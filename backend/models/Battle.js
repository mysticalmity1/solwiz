const mongoose = require('mongoose');

const BattleSchema = new mongoose.Schema({
  roomId:        { type: String, unique: true, required: true },
  player1: {
    walletAddress: String,
    mintAddress:   String,
    wizardName:    String,
    wizardType:    String,
    level:         Number,
    stats:         Object,
    selectedAttacks: Array,
    hpRemaining:   Number,
    mpRemaining:   Number,
    xpBefore:      Number
  },
  player2: {
    walletAddress: String,
    mintAddress:   String,
    wizardName:    String,
    wizardType:    String,
    level:         Number,
    stats:         Object,
    selectedAttacks: Array,
    hpRemaining:   Number,
    mpRemaining:   Number,
    xpBefore:      Number
  },
  turnLog: [
    {
      turnNumber:   Number,
      actingPlayer: String,
      actionType:   String,
      attackName:   String,
      damageDealt:  Number,
      mpUsed:       Number,
      p1HpAfter:    Number,
      p2HpAfter:    Number,
      p1MpAfter:    Number,
      p2MpAfter:    Number,
      isCritical:   Boolean,
      timestamp:    Date
    }
  ],
  winner:        { type: String, default: null },
  loser:         { type: String, default: null },
  xpAwarded:     { type: Number, default: 0 },
  state:         { type: String, enum: ["waiting","active","finished"], default: "waiting" },
  startedAt:     Date,
  endedAt:       Date,
  createdAt:     { type: Date, default: Date.now }
});

module.exports = mongoose.model('Battle', BattleSchema);
