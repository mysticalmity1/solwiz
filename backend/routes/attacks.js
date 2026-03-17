const express = require('express');
const router = express.Router();
const AttackSet = require('../models/AttackSet');
const WizardStats = require('../models/WizardStats');

// GET /api/attacks/catalog/:wizardType
router.get('/catalog/:wizardType', async (req, res) => {
  try {
    const { wizardType } = req.params;
    const { level } = req.query; // pass wizard's level to determine unlocked status

    const attacks = await AttackSet.find({ wizardType }).lean();
    
    const parsedLevel = parseInt(level, 10) || 1;
    const catalog = attacks.map(attack => ({
      ...attack,
      isUnlocked: parsedLevel >= attack.minLevel
    }));

    res.status(200).json(catalog);
  } catch (error) {
    console.error("Error fetching attack catalog:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/attacks/select
router.post('/select', async (req, res) => {
  try {
    const { mintAddress, walletAddress, attackIds } = req.body;
    
    if (!attackIds || attackIds.length !== 4) {
      return res.status(400).json({ error: "Exactly 4 attacks must be selected." });
    }

    const stats = await WizardStats.findOne({ mintAddress, ownerWallet: walletAddress }).populate('selectedAttackIds');
    if (!stats) {
      return res.status(404).json({ error: "Wizard stats not found" });
    }

    // Verify attacks match wizard type and are unlocked
    const selectedAttacks = await AttackSet.find({ _id: { $in: attackIds } });
    if (selectedAttacks.length !== 4) {
      return res.status(400).json({ error: "Invalid attack IDs" });
    }

    for (const attack of selectedAttacks) {
      if (attack.wizardType !== stats.wizardType) {
        return res.status(400).json({ error: "Attack type mismatch" });
      }
      if (stats.level < attack.minLevel) {
        return res.status(400).json({ error: "Wizard level too low for one or more attacks" });
      }
    }

    stats.selectedAttackIds = attackIds;
    await stats.save();

    res.status(200).json({ message: "Attacks updated successfully", selectedAttackIds: stats.selectedAttackIds });
  } catch (error) {
    console.error("Error selecting attacks:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
