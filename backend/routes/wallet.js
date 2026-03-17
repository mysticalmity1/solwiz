const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/wallet/connect
// creates or fetches User, returns full profile
router.post('/connect', async (req, res) => {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress) {
      return res.status(400).json({ error: "walletAddress is required" });
    }

    let user = await User.findOne({ walletAddress }).populate('battleIds').populate('selectedAttacks');
    
    if (!user) {
      user = new User({ walletAddress });
      await user.save();
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error("Error in /connect:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/wallet/:address
// returns User + activeWizardMint + battleIds populated
router.get('/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const user = await User.findOne({ walletAddress: address }).populate('battleIds').populate('selectedAttacks');
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error("Error in /wallet/:address:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
