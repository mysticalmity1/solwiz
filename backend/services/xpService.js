/**
 * Calculate XP required for next level
 * Formula: xpRequired(level) = 100 + (level - 1) * 10
 */
function getXpRequired(level) {
  return 100 + (level - 1) * 10;
}

/**
 * XP gained from winning a battle
 * xpGained = 10% of loser's totalXp (minimum 50 XP)
 */
function calculateXpGained(loserTotalXp) {
  const percentage = Math.floor(loserTotalXp * 0.1);
  return Math.max(50, percentage);
}

/**
 * Determine if a wizard is eligible for level up
 */
function isEligibleForLevelUp(totalXp, xpToNextLevel) {
  return totalXp >= xpToNextLevel;
}

module.exports = {
  getXpRequired,
  calculateXpGained,
  isEligibleForLevelUp
};
