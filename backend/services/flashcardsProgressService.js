const UserFlashcardsProgress = require('../models/userFlashcardsProgress');
const Word = require('../models/word');

const flashcardsProgressService = {
  // Get due cards for a user
  async getDueCards(userId, level = null, limit = 30) {
    const query = {
      user: userId,
      nextReview: { $lte: new Date() },
    };
    
    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'words',
          localField: 'word',
          foreignField: '_id',
          as: 'wordData',
        },
      },
      { $unwind: '$wordData' },
    ];
    
    if (level) {
      pipeline.push({
        $match: { 'wordData.level': level },
      });
    }
    
    pipeline.push({ $limit: limit });
    
    return await UserFlashcardsProgress.aggregate(pipeline);
  },

  // Get words not yet in user's progress 
  async getNewWords(userId, level = null, limit = 70) {
    const userProgressWordIds = await UserFlashcardsProgress.distinct('word', { user: userId });
    
    const query = {
      _id: { $nin: userProgressWordIds },
    };
    
    if (level) {
      query.level = level;
    }
    
    return await Word.find(query).limit(limit);
  },

  // Get mixed study session (70% new, 30% due)
  async getStudySession(userId, level = null, totalLimit = 100) {
    const newLimit = Math.floor(totalLimit * 0.7); // 70% new cards
    
    const [dueCards, newWords] = await Promise.all([
      this.getDueCards(userId, level, totalLimit),
      this.getNewWords(userId, level, newLimit),
    ]);
    
    // Convert new words to consistent format with due cards
    const newCards = newWords.map(word => ({
      _id: null, // No progress record yet
      user: userId,
      word: word._id,
      wordData: {
        _id: word._id,
        kanji: word.kanji,
        hiragana: word.hiragana,
        english: word.english,
        level: word.level,
        type: word.type,
      },
      srsLevel: 0,
      successCount: 0,
      failureCount: 0,
      isNew: true,
    }));
    
    // Combine and shuffle
    const combined = [...dueCards, ...newCards].slice(0, totalLimit);
    return combined.sort(() => Math.random() - 0.5);
  },

  // Update progress for a word
  async updateProgress(userId, wordId, isCorrect) {
    let progress = await UserFlashcardsProgress.findOne({ user: userId, word: wordId });

    if (progress) {
      // Update existing progress using SRS logic
      progress.updateProgress(isCorrect);
      await progress.save();
    } else {
      // Create new progress entry
      progress = new UserFlashcardsProgress({
        user: userId,
        word: wordId,
        srsLevel: 0,
      });
      progress.updateProgress(isCorrect);
      await progress.save();
    }

    // Populate the word field
    await progress.populate('word');
    return progress;
  },

  // Get user's flashcards progress
  async getUserProgress(userId) {
    return await UserFlashcardsProgress.find({ user: userId }).populate('word');
  },
};

module.exports = flashcardsProgressService;