const jwt = require('jsonwebtoken');
const Battle = require('../models/Battle');
const User = require('../models/User');
const WizardStats = require('../models/WizardStats');
const AttackSet = require('../models/AttackSet');
const { resolveTurn } = require('../services/battleEngine');
const { createRoomCode, trackRoom, getRoom, untrackRoom } = require('../services/matchmakingService');
const { calculateXpGained } = require('../services/xpService');

// Map to track user socket connections for reconnects
// walletAddress -> socketId
const userSockets = new Map();

// Map to temporarily store player actions per turn
// roomId -> { player1: action, player2: action }
const pendingActions = new Map();

// Map to track disconnect timeouts
// roomId -> timeoutId
const disconnectTimeouts = new Map();

module.exports = function(io) {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // CLIENT -> SERVER: createRoom
    socket.on('createRoom', async ({ walletAddress, mintAddress }) => {
      try {
        if (!walletAddress || !mintAddress) return socket.emit('error', { message: "Missing params" });
        
        userSockets.set(walletAddress, socket.id);
        const roomId = createRoomCode();

        // Join socket room
        socket.join(roomId);

        const wizardStats = await WizardStats.findOne({ mintAddress, ownerWallet: walletAddress }).populate('selectedAttackIds');
        if (!wizardStats || wizardStats.selectedAttackIds.length !== 4) {
          return socket.emit('error', { message: "Wizard not found or lacks 4 attacks" });
        }

        const user = await User.findOne({ walletAddress });

        // Initialize battle doc
        const battleData = {
          roomId,
          player1: {
            walletAddress,
            mintAddress,
            wizardName: user?.username || "Wizard",
            wizardType: wizardStats.wizardType,
            level: wizardStats.level,
            stats: wizardStats.computedStats,
            selectedAttacks: wizardStats.selectedAttackIds,
            hpRemaining: wizardStats.computedStats.hp,
            mpRemaining: wizardStats.computedStats.mp,
            xpBefore: wizardStats.totalXp
          },
          state: 'waiting',
          startedAt: new Date(),
          turnLog: []
        };

        // Create doc in DB
        const battleDoc = new Battle(battleData);
        await battleDoc.save();

        // Track in memory
        trackRoom(roomId, battleDoc.toObject());
        pendingActions.set(roomId, {});

        socket.emit('roomCreated', { roomId });
      } catch (err) {
        console.error(err);
        socket.emit('error', { message: "Server error creating room" });
      }
    });

    // CLIENT -> SERVER: joinRoom
    socket.on('joinRoom', async ({ roomId, walletAddress, mintAddress }) => {
      try {
        if (!roomId || !walletAddress || !mintAddress) return socket.emit('error', { message: "Missing params" });
        
        const roomUpper = roomId.toUpperCase();
        const memRoom = getRoom(roomUpper);
        
        if (!memRoom || memRoom.state !== 'waiting') {
          return socket.emit('roomNotFound', { message: "Room not found or already full" });
        }
        
        // Prevent joining own room
        if (memRoom.player1.walletAddress === walletAddress) {
           return socket.emit('error', { message: "Cannot play against yourself" });
        }

        userSockets.set(walletAddress, socket.id);
        socket.join(roomUpper);

        const wizardStats = await WizardStats.findOne({ mintAddress, ownerWallet: walletAddress }).populate('selectedAttackIds');
        const user = await User.findOne({ walletAddress });

        // Update memory state
        memRoom.player2 = {
          walletAddress,
          mintAddress,
          wizardName: user?.username || "Wizard",
          wizardType: wizardStats.wizardType,
          level: wizardStats.level,
          stats: wizardStats.computedStats,
          selectedAttacks: wizardStats.selectedAttackIds,
          hpRemaining: wizardStats.computedStats.hp,
          mpRemaining: wizardStats.computedStats.mp,
          xpBefore: wizardStats.totalXp
        };
        memRoom.state = 'active';

        // Update DB
        const battleDoc = await Battle.findOneAndUpdate(
          { roomId: roomUpper },
          { player2: memRoom.player2, state: 'active' },
          { new: true }
        );
        trackRoom(roomUpper, battleDoc.toObject());

        // Emit to both
        io.to(roomUpper).emit('battleReady', {
          roomId: roomUpper,
          player1: memRoom.player1,
          player2: memRoom.player2
        });

      } catch (err) {
        console.error(err);
        socket.emit('error', { message: "Server error joining room" });
      }
    });

    // CLIENT -> SERVER: submitAction
    socket.on('submitAction', async ({ roomId, walletAddress, actionType, attackId }) => {
      try {
        const memRoom = getRoom(roomId);
        if (!memRoom || memRoom.state !== 'active') return;

        const isPlayer1 = memRoom.player1.walletAddress === walletAddress;
        const playerKey = isPlayer1 ? 'player1' : 'player2';
        
        let action = { actionType };
        
        // Find attack details if it's an attack
        if (actionType === 'attack' && attackId) {
           const attacks = memRoom[playerKey].selectedAttacks;
           action.attack = attacks.find(a => a._id.toString() === attackId.toString());
        }

        let actions = pendingActions.get(roomId) || {};
        actions[playerKey] = action;
        pendingActions.set(roomId, actions);

        // Notify other player that this player is ready
        socket.to(roomId).emit('waitingForAction', { message: "Opponent has locked in their move." });

        // Check if both submitted
        if (actions.player1 && actions.player2) {
           // Resolve Turn
           const { newState, turnLogs } = resolveTurn(memRoom, actions.player1, actions.player2);
           
           // Clear actions
           pendingActions.set(roomId, {});
           
           // Update memory room
           Object.assign(memRoom, newState);
           
           // Append logs
           const turnNum = (memRoom.turnLog?.length || 0) + 1;
           const stampedLogs = turnLogs.map(l => ({
             ...l,
             turnNumber: turnNum,
             p1HpAfter: memRoom.player1.hpRemaining,
             p2HpAfter: memRoom.player2.hpRemaining,
             p1MpAfter: memRoom.player1.mpRemaining,
             p2MpAfter: memRoom.player2.mpRemaining,
             timestamp: new Date()
           }));
           
           memRoom.turnLog = [...(memRoom.turnLog || []), ...stampedLogs];
           trackRoom(roomId, memRoom); // ensure update

           // Push state to both
           io.to(roomId).emit('turnResult', {
             turnNumber: turnNum,
             p1HpAfter: memRoom.player1.hpRemaining,
             p2HpAfter: memRoom.player2.hpRemaining,
             p1MpAfter: memRoom.player1.mpRemaining,
             p2MpAfter: memRoom.player2.mpRemaining,
             battleLog: stampedLogs
           });

           // Check finish
           if (memRoom.state === 'finished') {
             await handleBattleEnd(roomId, memRoom.winner, memRoom.loser, io);
           }
        }

      } catch (err) {
        console.error(err);
      }
    });

    // CLIENT -> SERVER: rejoinRoom
    socket.on('rejoinRoom', ({ roomId, walletAddress }) => {
       const memRoom = getRoom(roomId);
       if (memRoom) {
         userSockets.set(walletAddress, socket.id);
         socket.join(roomId);

         // Clear disconnect timeout if exists
         if (disconnectTimeouts.has(roomId)) {
           clearTimeout(disconnectTimeouts.get(roomId));
           disconnectTimeouts.delete(roomId);
           io.to(roomId).emit('opponentReconnected', { message: "Opponent has returned!" });
         }

         socket.emit('battleState', memRoom);
       } else {
         socket.emit('error', { message: "Room not found or already closed." });
       }
    });

    socket.on('disconnect', () => {
      // Find which wallet disconnected
      let disconnectedWallet = null;
      for (const [wallet, sId] of userSockets.entries()) {
        if (sId === socket.id) {
          disconnectedWallet = wallet;
          userSockets.delete(wallet);
          break;
        }
      }

      if (disconnectedWallet) {
        // Walk all rooms in memory via matchmakingService
        const { getAllRooms } = require('../services/matchmakingService');
        const rooms = getAllRooms(); // returns Map or object
        for (const [roomId, room] of Object.entries(rooms)) {
          if (room.state === 'active' &&
             (room.player1.walletAddress === disconnectedWallet || room.player2.walletAddress === disconnectedWallet)) {

            // Start 60s timeout
            io.to(roomId).emit('opponentDisconnected', { countdown: 60 });

            const toId = setTimeout(async () => {
               const currentRoom = getRoom(roomId);
               if (currentRoom && currentRoom.state === 'active') {
                 const winner = currentRoom.player1.walletAddress === disconnectedWallet ? currentRoom.player2.walletAddress : currentRoom.player1.walletAddress;
                 const loser = disconnectedWallet;
                 currentRoom.state = 'finished';
                 currentRoom.winner = winner;
                 currentRoom.loser = loser;

                 io.to(roomId).emit('opponentForfeited', { message: "Opponent forfeited by abandonment." });
                 await handleBattleEnd(roomId, winner, loser, io);
                 disconnectTimeouts.delete(roomId);
               }
            }, 60000);

            disconnectTimeouts.set(roomId, toId);
          }
        }
      }
      console.log('Client disconnected:', socket.id);
    });

  });
};

async function handleBattleEnd(roomId, winner, loser, io) {
    const memRoom = getRoom(roomId);
    if (!memRoom) return;

    try {
      // Calculate XP
      const loserData = memRoom.player1.walletAddress === loser ? memRoom.player1 : memRoom.player2;
      const winnerData = memRoom.player1.walletAddress === winner ? memRoom.player1 : memRoom.player2;
      
      const xpGained = calculateXpGained(loserData.xpBefore);
      memRoom.xpAwarded = xpGained;

      // Update Database Battle Document
      const battleDoc = await Battle.findOneAndUpdate(
        { roomId },
        { 
          turnLog: memRoom.turnLog,
          hpRemaining1: memRoom.player1.hpRemaining,
          hpRemaining2: memRoom.player2.hpRemaining,
          state: 'finished',
          winner,
          loser,
          xpAwarded: xpGained,
          endedAt: new Date()
        },
        { new: true }
      );

      // Update User Battle History
      await User.updateMany(
        { walletAddress: { $in: [winner, loser] } },
        { $push: { battleIds: battleDoc._id } }
      );

      // Award XP to winner
      const winStats = await WizardStats.findOne({ mintAddress: winnerData.mintAddress });
      if (winStats) {
        winStats.totalXp += xpGained;
        if (winStats.totalXp >= winStats.xpToNextLevel) {
          winStats.levelUpPending = true;
        }
        await winStats.save();
      }

      // Emit end
      io.to(roomId).emit('battleEnded', { winner, loser, xpGained, finalState: memRoom });
      
      // Cleanup
      untrackRoom(roomId);
      pendingActions.delete(roomId);

    } catch(err) {
      console.error("Error saving battle completion:", err);
    }
}
