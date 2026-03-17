const express = require('express');
const router = express.Router();
const Battle = require('../models/Battle');

// GET /api/battles/history/:walletAddress
// Returns last 10 battles involving this wallet
router.get('/history/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const battles = await Battle.find({
      $or: [
        { 'player1.walletAddress': walletAddress },
        { 'player2.walletAddress': walletAddress }
      ],
      state: 'finished'
    }).sort({ createdAt: -1 }).limit(10);

    res.status(200).json(battles);
  } catch (error) {
    console.error("Error fetching battle history:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/battles/:roomId
router.get('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const battle = await Battle.findOne({ roomId });
    if (!battle) {
      return res.status(404).json({ error: "Battle not found" });
    }
    res.status(200).json(battle);
  } catch (error) {
    console.error("Error fetching battle:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
