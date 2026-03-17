const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const AttackSet = require('../models/AttackSet');

async function seedAttacks() {
  try {
    const dataDir = path.join(__dirname, '../data');
    const files = [
      'viking_attacks.json',
      'mage_attacks.json',
      'musician_attacks.json',
      'santa_attacks.json',
      'miner_attacks.json'
    ];

    let totalSeeded = 0;
    for (const file of files) {
      const filePath = path.join(dataDir, file);
      if (fs.existsSync(filePath)) {
        const attackData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        for (const attack of attackData) {
          // Update if exists, otherwise insert
          await AttackSet.findOneAndUpdate(
            { name: attack.name, wizardType: attack.wizardType },
            attack,
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
          totalSeeded++;
        }
      }
    }
    console.log(`Successfully seeded ${totalSeeded} attacks to the database.`);
  } catch (error) {
    console.error("Error seeding attacks:", error);
  }
}

module.exports = seedAttacks;
