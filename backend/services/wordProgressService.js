const UserWordProgress = require('../models/userWordProgress');
const Word = require('../models/word');

const wordProgressService = {
  // Update progress for a word using kanji value
  async updateProgress(userId, wordKanji, isCorrect) {
    // First, find the word by kanji to get its ObjectId
    const word = await Word.findOne({ kanji: wordKanji });
    
    if (!word) {
        throw new Error(`Word not found with kanji: ${wordKanji}`);
    }

    console.log('Word ObjectId:', word._id);
    
    let progress = await UserWordProgress.findOne({
      user: userId, 
      word: word._id
    });

    if (progress) {
      progress.updateProgress(isCorrect);
      await progress.save();
    } else {
      progress = new UserWordProgress({
        user: userId,
        word: word._id
      });
      progress.updateProgress(isCorrect);
      await progress.save();
    }

    await progress.populate('word');
    return progress;
  },

  // Get user's progress for all words
  async getUserProgress(userId) {
    return await UserWordProgress.find({ user: userId }).populate('word');
  },

  // Get user's progress for specific word
  async getWordProgress(userId, wordId) {
    return await UserWordProgress.findOne({  
      user: userId, 
      word: wordId 
    }).populate('word');
  },
};

module.exports = wordProgressService;