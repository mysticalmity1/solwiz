/**
 * Core Combat Logic Engine (Server-side only)
 * Pure functions: No DB calls, no socket calls.
 */

const BASIC_ATTACK = {
  name: "Basic Strike",
  damage: 15,
  mpCost: 0,
  effect: "none",
  effectChance: 0
};

// Returns new battleState and turn result logs
function resolveTurn(battleState, p1Action, p2Action) {
  // Deep clone to avoid mutating input directly
  const state = JSON.parse(JSON.stringify(battleState));

  let logs = [];
  let isGameOver = false;

  // Function to determine active speed (handling slow effect)
  const getSpeed = (playerKey) => {
    let speed = state[playerKey].stats.speed;
    const slowEffect = state.effects?.[playerKey]?.slow;
    if (slowEffect && slowEffect.turnsLeft > 0) {
      speed = speed * 0.7; // 30% reduction
    }
    return speed;
  };

  const p1Speed = getSpeed('player1');
  const p2Speed = getSpeed('player2');

  // Determine turn order
  let firstKey = 'player1';
  let secondKey = 'player2';
  let firstAction = p1Action;
  let secondAction = p2Action;

  if (p2Speed > p1Speed || (p2Speed === p1Speed && Math.random() < 0.5)) {
    firstKey = 'player2';
    secondKey = 'player1';
    firstAction = p2Action;
    secondAction = p1Action;
  }

  // Helper to execute a single player's action
  const executeAction = (attackerKey, defenderKey, action) => {
    if (isGameOver) return;

    if (!state.effects) state.effects = { player1: {}, player2: {} };

    const attacker = state[attackerKey];
    const defender = state[defenderKey];
    const effects = state.effects[attackerKey];

    // Check Stun
    if (effects.stun && effects.stun.turnsLeft > 0) {
      logs.push({ actingPlayer: attackerKey, actionType: "skip", message: `${attacker.wizardName} is STUNNED and skips their turn!` });
      effects.stun.turnsLeft -= 1;
      return;
    }

    // Determine Attack
    let attack = action.attack || BASIC_ATTACK;
    
    // MP Check
    if (attacker.mpRemaining < attack.mpCost) {
      logs.push({ actingPlayer: attackerKey, actionType: "fallback", message: `${attacker.wizardName} does not have enough MP. Using Basic Strike instead.` });
      attack = BASIC_ATTACK;
    }

    // Deduct MP
    attacker.mpRemaining -= attack.mpCost;

    // Calculate Damage
    const baseDamage = attacker.stats.attack - (defender.stats.defense * 0.4);
    const skillDamage = attack.damage;
    let totalDamage = baseDamage + skillDamage;

    // Critical Hit (10% chance)
    let isCrit = false;
    if (Math.random() <= 0.10) {
      isCrit = true;
      totalDamage *= 1.5;
    }

    totalDamage = Math.max(1, Math.floor(totalDamage)); // Minimum 1 damage

    // Deduct HP
    defender.hpRemaining = Math.max(0, defender.hpRemaining - totalDamage);
    
    const logEntry = {
      actingPlayer: attackerKey,
      actionType: "attack",
      attackName: attack.name,
      damageDealt: totalDamage,
      mpUsed: attack.mpCost,
      isCritical: isCrit,
      message: `${attacker.wizardName} used ${attack.name}! ${isCrit ? "CRITICAL HIT! " : ""}Dealt ${totalDamage} damage.`
    };

    // Apply Effects
    if (attack.effect !== "none" && attack.effectChance > 0) {
      if ((Math.random() * 100) <= attack.effectChance) {
        if (!state.effects[defenderKey]) state.effects[defenderKey] = {};
        
        switch (attack.effect) {
          case "burn":
            state.effects[defenderKey].burn = { turnsLeft: 2 };
            logEntry.message += ` ${defender.wizardName} is burning!`;
            break;
          case "stun":
            state.effects[defenderKey].stun = { turnsLeft: 1 };
            logEntry.message += ` ${defender.wizardName} is stunned!`;
            break;
          case "slow":
            state.effects[defenderKey].slow = { turnsLeft: 2 };
            logEntry.message += ` ${defender.wizardName} is slowed!`;
            break;
        }
      }
    }

    logs.push(logEntry);

    // Check Win Condition
    if (defender.hpRemaining <= 0) {
      isGameOver = true;
      state.winner = attacker.walletAddress;
      state.loser = defender.walletAddress;
      state.state = "finished";
    }
  };

  // Helper to process end of turn effects (like Burn)
  const processEndOfTurnEffects = (playerKey) => {
    if (isGameOver) return;
    const player = state[playerKey];
    const effects = state.effects?.[playerKey] || {};

    if (effects.burn && effects.burn.turnsLeft > 0) {
      const burnDamage = 5;
      player.hpRemaining = Math.max(0, player.hpRemaining - burnDamage);
      effects.burn.turnsLeft -= 1;
      
      logs.push({ actingPlayer: 'environment', actionType: 'effect', message: `🔥 Burn effect: ${burnDamage} damage to ${player.wizardName}.` });

      if (player.hpRemaining <= 0) {
        isGameOver = true;
        state.winner = state[playerKey === 'player1' ? 'player2' : 'player1'].walletAddress;
        state.loser = player.walletAddress;
        state.state = "finished";
      }
    }

    // Degrade slow effect
    if (effects.slow && effects.slow.turnsLeft > 0) {
      effects.slow.turnsLeft -= 1;
    }
  };

  // 1st move
  executeAction(firstKey, secondKey, firstAction);
  // 2nd move
  if (!isGameOver) {
    executeAction(secondKey, firstKey, secondAction);
  }

  // Process dots (burn)
  if (!isGameOver) {
    processEndOfTurnEffects('player1');
    processEndOfTurnEffects('player2');
  }

  return { newState: state, turnLogs: logs };
}

module.exports = {
  resolveTurn,
  BASIC_ATTACK
};
