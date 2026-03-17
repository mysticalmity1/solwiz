const mongoose = require('mongoose');

const AttackSetSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  wizardType:    { type: String, enum: ["Viking","Mage","Musician","Santa","Miner"] },
  description:   String,
  damage:        Number,
  mpCost:        Number,
  minLevel:      Number,
  attackType:    { type: String, enum: ["physical","fire","water","lightning","arcane","music","frost"] },
  effect:        String,
  effectChance:  Number,
  cooldown:      Number,
  emoji:         String
});

module.exports = mongoose.model('AttackSet', AttackSetSchema);
