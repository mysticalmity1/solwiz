/**
 * Computes the multiplied stats based on wizard level
 * Formula: computedStat = baseStat * (1 + (level - 1) * 0.03)
 */
function computeStats(baseStats, level) {
  const multiplier = 1 + (level - 1) * 0.03;

  return {
    attack: Math.round(baseStats.attack * multiplier),
    defense: Math.round(baseStats.defense * multiplier),
    speed: Math.round(baseStats.speed * multiplier),
    hp: Math.round(baseStats.hp * multiplier),
    mp: Math.round(baseStats.mp * multiplier)
  };
}

module.exports = {
  computeStats
};
