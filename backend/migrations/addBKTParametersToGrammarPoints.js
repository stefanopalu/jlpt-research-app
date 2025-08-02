require('dotenv').config();
const mongoose = require('mongoose');
const GrammarPoint = require('../models/grammarPoint');
const { getBKTDefaultsByLevel } = require('../config/bktDefaults');

const migrateBKTParameters = async () => {
  try {
    console.log('Starting grammar points migration...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const totalGrammarPoints = await GrammarPoint.countDocuments();
    console.log(`Total grammar points in database: ${totalGrammarPoints}`);
    
    const grammarPointsToUpdate = await GrammarPoint.find({
      priorKnowledge: { $exists: false },
    });
    
    console.log(`Grammar points needing BKT parameters: ${grammarPointsToUpdate.length}`);
    
    // Use N4 parameters for all existing grammar points
    const defaults = getBKTDefaultsByLevel('N4');
    
    for (const grammarPoint of grammarPointsToUpdate) {
      console.log(`Updating grammar point ${grammarPoint.name} with N4 parameters:`, defaults);
      
      await GrammarPoint.updateOne(
        { _id: grammarPoint._id },
        { $set: defaults },
      );
    }
    
    console.log(`Migration completed! Updated ${grammarPointsToUpdate.length} grammar points with N4 parameters`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

migrateBKTParameters();