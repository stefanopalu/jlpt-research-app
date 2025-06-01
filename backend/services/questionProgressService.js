const UserQuestionProgress = require('../models/userQuestionProgress');

const questionProgressService = {
  // Update progress for a question
  // Search for existing record with userId and questionId
  async updateProgress(userId, questionId, isCorrect) {
    let progress = await UserQuestionProgress.findOne({ 
      user: userId, 
      question: questionId, 
    });

    if (progress) {
      // If exists, update existing progress using model instance method and save
      progress.updateProgress(isCorrect);
      await progress.save();
    } else {
      // If not exists, create new progress entry and save
      progress = new UserQuestionProgress({
        user: userId,
        question: questionId,
      });
      progress.updateProgress(isCorrect);
      await progress.save();
    }

    return progress;
  },

  // Get user's progress for all questions
  async getUserProgress(userId) {
    return await UserQuestionProgress.find({ user: userId }).populate('question');
  },

  // Get user's progress for specific question
  async getQuestionProgress(userId, questionId) {
    return await UserQuestionProgress.findOne({ 
      user: userId, 
      question: questionId, 
    }).populate('question');
  },
};

module.exports = questionProgressService;