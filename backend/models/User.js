const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  walletAddress:   { type: String, unique: true, required: true },
  username:        { type: String, default: "Wizard" },
  activeWizardMint:{ type: String, default: null },
  selectedAttacks: [{ type: mongoose.Schema.Types.ObjectId, ref: "AttackSet" }],
  battleIds:       [{ type: mongoose.Schema.Types.ObjectId, ref: "Battle" }],
  totalXp:         { type: Number, default: 0 },
  createdAt:       { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
