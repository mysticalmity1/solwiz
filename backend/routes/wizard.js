const express = require('express');
const router = express.Router();
const WizardStats = require('../models/WizardStats');
const { computeStats } = require('../services/statService');
const { getXpRequired } = require('../services/xpService');

// Use metaplex service
const { updateWizardLevel } = require('../services/metaplexService');

// GET /api/wizards/:mintAddress/:walletAddress
router.get('/:mintAddress/:walletAddress', async (req, res) => {
  try {
    const { mintAddress, walletAddress } = req.params;
    const stats = await WizardStats.findOne({ mintAddress, ownerWallet: walletAddress }).populate('selectedAttackIds');
    if (!stats) {
      return res.status(404).json({ error: "Wizard stats not found locally. Please sync." });
    }
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/wizards/sync
// Body: { mintAddress, walletAddress, baseStats, wizardType, level }
router.post('/sync', async (req, res) => {
  try {
    const { mintAddress, walletAddress, baseStats, wizardType, level } = req.body;
    let stats = await WizardStats.findOne({ mintAddress, ownerWallet: walletAddress });
    
    const wizardLevel = level || 1;
    const computed = computeStats(baseStats, wizardLevel);
    const xpRequired = getXpRequired(wizardLevel);

    if (!stats) {
      stats = new WizardStats({
        mintAddress,
        ownerWallet: walletAddress,
        wizardType,
        level: wizardLevel,
        baseStats,
        computedStats: computed,
        xpToNextLevel: xpRequired
      });
      await stats.save();
    } else {
      // Sync stats (in case of level up or data mismatch)
      stats.baseStats = baseStats;
      stats.wizardType = wizardType;
      stats.level = wizardLevel;
      stats.computedStats = computed;
      stats.xpToNextLevel = xpRequired;
      await stats.save();
    }
    
    res.status(200).json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/wizards/levelup
router.post('/levelup', async (req, res) => {
  try {
    const { mintAddress, walletAddress } = req.body;
    const stats = await WizardStats.findOne({ mintAddress, ownerWallet: walletAddress });
    
    if (!stats || !stats.levelUpPending) {
      return res.status(400).json({ error: "Level up not available" });
    }
    
    stats.level += 1;
    stats.computedStats = computeStats(stats.baseStats, stats.level);
    
    const xpRequiredForNewLevel = getXpRequired(stats.level);
    stats.totalXp = stats.totalXp - stats.xpToNextLevel; // Subtract previous threshold
    if(stats.totalXp < 0) stats.totalXp = 0; // Safeguard
    
    stats.xpToNextLevel = xpRequiredForNewLevel;
    
    // Check if another levelup is pending
    if (stats.totalXp >= stats.xpToNextLevel) {
      stats.levelUpPending = true;
    } else {
      stats.levelUpPending = false;
    }
    
    await stats.save();
    
    // Call metaplexService to update NFT on-chain
    await updateWizardLevel(mintAddress, stats.level);
    
    res.status(200).json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
