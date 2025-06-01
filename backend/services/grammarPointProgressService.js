const UserGrammarPointProgress = require('../models/userGrammarPointProgress');
const GrammarPoint = require('../models/grammarPoint');

const grammarPointProgressService = {
  // Update progress for a grammar point using name
  async updateProgress(userId, GPname, isCorrect) {
    // First, find the grammar point by name to get its ObjectId
    const grammarPoint = await GrammarPoint.findOne({ name: GPname });
    
    if (!grammarPoint) {
      throw new Error(`Grammar point not found with name: ${GPname}`);
    }

    console.log('GrammarPoint ObjectId:', grammarPoint._id);
    
    let progress = await UserGrammarPointProgress.findOne({
      user: userId, 
      grammarPoint: grammarPoint._id,
    });

    if (progress) {
      progress.updateProgress(isCorrect);
      await progress.save();
    } else {
      progress = new UserGrammarPointProgress({
        user: userId,
        grammarPoint: grammarPoint._id,
      });
      progress.updateProgress(isCorrect);
      await progress.save();
    }

    await progress.populate('grammarPoint');
    return progress;
  },

  // Get user's progress for all grammar points
  async getUserProgress(userId) {
    return await UserGrammarPointProgress.find({ user: userId }).populate('grammarPoint');
  },

  // Get user's progress for specific grammar point
  async getGrammarPointProgress(userId, grammarPointId) {
    return await UserGrammarPointProgress.findOne({  
      user: userId, 
      grammarPoint: grammarPointId, 
    }).populate('grammarPoint');
  },
};

module.exports = grammarPointProgressService;