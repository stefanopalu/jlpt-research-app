const Word = require('../models/word');
const GrammarPoint = require('../models/grammarPoint');
const UserWordProgress = require('../models/userWordProgress');
const UserGrammarPointProgress = require('../models/userGrammarPointProgress');

const bktService = {
  // Calculate new mastery score using BKT formula
  calculateMastery(currentMastery, isCorrect, bktParams) {
    const { learningRate, slipRate, guessRate } = bktParams;
    
    if (isCorrect) {
      // P(L_n | correct) = P(L_{n-1}) + (1-P(L_{n-1})) * P(T) / P(correct)
      // where P(correct) = P(L_{n-1}) * (1-slip) + (1-P(L_{n-1})) * guess
      
      const pCorrect = currentMastery * (1 - slipRate) + (1 - currentMastery) * guessRate;
      
      if (pCorrect === 0) return currentMastery; // Avoid division by zero
      
      const numerator = currentMastery * (1 - slipRate) + (1 - currentMastery) * learningRate * guessRate;
      
      return Math.min(1.0, numerator / pCorrect);
      
    } else {
      // P(L_n | incorrect) = P(L_{n-1}) * slip / P(incorrect)
      // where P(incorrect) = P(L_{n-1}) * slip + (1-P(L_{n-1})) * (1-guess)
      
      const pIncorrect = currentMastery * slipRate + (1 - currentMastery) * (1 - guessRate);
      
      if (pIncorrect === 0) return currentMastery; // Avoid division by zero
      
      const numerator = currentMastery * slipRate + (1 - currentMastery) * learningRate * (1 - guessRate);
      
      return Math.max(0.0, numerator / pIncorrect);
    }
  },
  
  // Update word mastery score for a user using wordId and userId
  async updateWordMastery(userId, wordId, isCorrect) {
    try {
      // Get word's BKT parameters
      const word = await Word.findById(wordId);
      if (!word) {
        throw new Error(`Word not found with ID: ${wordId}`);
      }
      
      const bktParams = {
        priorKnowledge: word.priorKnowledge,
        learningRate: word.learningRate,
        slipRate: word.slipRate,
        guessRate: word.guessRate,
      };
            
      // Get user's current progress
      const progress = await UserWordProgress.findOne({
        user: userId, 
        word: wordId,
      });
      
      if (!progress) {
        throw new Error(`UserWordProgress not found for user ${userId} and word ${wordId}`);
      }
      
      // Calculate new mastery using BKT
      const oldMastery = progress.masteryScore;
      const newMastery = this.calculateMastery(
        progress.masteryScore, 
        isCorrect, 
        bktParams,
      );
      
      console.log('BKT calculation:', {
        oldMastery: oldMastery.toFixed(3),
        newMastery: newMastery.toFixed(3),
        change: (newMastery - oldMastery).toFixed(3),
      });
      
      // Update mastery score
      progress.masteryScore = newMastery;
      await progress.save();
      
      return progress;
      
    } catch (error) {
      console.error('Error updating word mastery:', error);
      throw error;
    }
  },
  
  // Update grammar point mastery score for a user using grammarPointId and userId
  async updateGrammarPointMastery(userId, grammarPointId, isCorrect) {
    try {
      // Get grammar point's BKT parameters
      const grammarPoint = await GrammarPoint.findById(grammarPointId);
      if (!grammarPoint) {
        throw new Error(`Grammar point not found with ID: ${grammarPointId}`);
      }
      
      const bktParams = {
        priorKnowledge: grammarPoint.priorKnowledge,
        learningRate: grammarPoint.learningRate,
        slipRate: grammarPoint.slipRate,
        guessRate: grammarPoint.guessRate,
      };
      
      // Get user's current progress
      const progress = await UserGrammarPointProgress.findOne({
        user: userId, 
        grammarPoint: grammarPointId,
      });
      
      if (!progress) {
        throw new Error(`UserGrammarPointProgress not found for user ${userId} and grammar point ${grammarPointId}`);
      }
      
      // Calculate new mastery using BKT
      const newMastery = this.calculateMastery(
        progress.masteryScore, 
        isCorrect, 
        bktParams,
      );
      
      // Update mastery score
      progress.masteryScore = newMastery;
      await progress.save();
            
      return progress;
      
    } catch (error) {
      console.error('Error updating grammar point mastery:', error);
      throw error;
    }
  },
};

module.exports = bktService;