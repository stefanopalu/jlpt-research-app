const UserProgress = require('../models/userProgress');

const getUserProgressForUser = async (userId) => {
  return await UserProgress.find({ user: userId }).populate('word');
};

const updateUserProgress = async ({ userId, wordId, success }) => {
  let progress = await UserProgress.findOne({ user: userId, word: wordId });

  if (!progress) {
    progress = new UserProgress({
      user: userId,
      word: wordId,
      successCount: success ? 1 : 0,
      lastReviewed: new Date(),
      nextReview: new Date(),
    });
  } else {
    if (success) {
      progress.successCount += 1;
    }
    progress.lastReviewed = new Date();
  }

  await progress.save();
  return progress;
};

module.exports = {
  getUserProgressForUser,
  updateUserProgress,
};