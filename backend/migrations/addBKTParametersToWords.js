require('dotenv').config();

const mongoose = require('mongoose');
const Word = require('../models/word');
const { getBKTDefaultsByLevel } = require('../config/bktDefaults');

const migrateBKTParameters = async () => {
  try {
    console.log('Starting migration...');
    
    // Check if MongoDB URI is available
    if (!process.env.MONGODB_URI) {
      console.log('No MONGODB_URI found, using default connection');
    }
    
    await mongoose.connect(process.env.MONGODB_URI || 'your-mongodb-connection-string');
    console.log('Connected to MongoDB');
    
    // Check total words first
    const totalWords = await Word.countDocuments();
    console.log(`Total words in database: ${totalWords}`);
    
    // Get all words that need BKT parameters
    const wordsToUpdate = await Word.find({
      priorKnowledge: { $exists: false },
    });
    
    console.log(`Words needing BKT parameters: ${wordsToUpdate.length}`);
    
    for (const word of wordsToUpdate) {
      const defaults = getBKTDefaultsByLevel(word.level);
      console.log(`Updating word ${word.kanji} (${word.level}) with parameters:`, defaults);
      
      await Word.updateOne(
        { _id: word._id },
        { $set: defaults },
      );
    }
    
    console.log(`Migration completed! Updated ${wordsToUpdate.length} words`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

migrateBKTParameters();