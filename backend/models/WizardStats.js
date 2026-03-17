const mongoose = require('mongoose');

const WizardStatsSchema = new mongoose.Schema({
  mintAddress:     { type: String, required: true },
  ownerWallet:     { type: String, required: true },
  wizardType:      { type: String, enum: ["Viking","Mage","Musician","Santa","Miner"] },
  level:           { type: Number, default: 1 },
  totalXp:         { type: Number, default: 0 },
  xpToNextLevel:   { type: Number, default: 100 },
  baseStats: {
    attack:  Number,
    defense: Number,
    speed:   Number,
    hp:      Number,
    mp:      Number
  },
  computedStats: {
    attack:  Number,
    defense: Number,
    speed:   Number,
    hp:      Number,
    mp:      Number
  },
  selectedAttackIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "AttackSet" }],
  levelUpPending:  { type: Boolean, default: false },
  createdAt:       { type: Date, default: Date.now },
  updatedAt:       { type: Date, default: Date.now }
});

module.exports = mongoose.model('WizardStats', WizardStatsSchema);
