const mongoose = require('mongoose');
const UserVocabularyProgress = require('../../models/userVocabularyProgress');

describe('UserVocabularyProgress Model', () => {
  describe('updateProgress method', () => {
    test('should increase srsLevel and successCount when correct', () => {
      const progress = new UserVocabularyProgress({
        user: new mongoose.Types.ObjectId(),
        word: new mongoose.Types.ObjectId(),
        srsLevel: 3,
        successCount: 5,
        failureCount: 2
      });

      progress.updateProgress(true);

      expect(progress.srsLevel).toBe(4);
      expect(progress.successCount).toBe(6);
      expect(progress.failureCount).toBe(2);
      expect(progress.lastReviewed).toBeInstanceOf(Date);
      expect(progress.nextReview).toBeInstanceOf(Date);
    });

    test('should decrease srsLevel and increase failureCount when incorrect', () => {
      const progress = new UserVocabularyProgress({
        user: new mongoose.Types.ObjectId(),
        word: new mongoose.Types.ObjectId(),
        srsLevel: 3,
        successCount: 5,
        failureCount: 2
      });

      progress.updateProgress(false);

      expect(progress.srsLevel).toBe(2);
      expect(progress.successCount).toBe(5);
      expect(progress.failureCount).toBe(3);
      expect(progress.lastReviewed).toBeInstanceOf(Date);
      expect(progress.nextReview).toBeInstanceOf(Date);
    });

    test('should not go below srsLevel 0', () => {
      const progress = new UserVocabularyProgress({
        user: new mongoose.Types.ObjectId(),
        word: new mongoose.Types.ObjectId(),
        srsLevel: 0
      });

      progress.updateProgress(false);

      expect(progress.srsLevel).toBe(0);
    });

    test('should not go above srsLevel 9', () => {
      const progress = new UserVocabularyProgress({
        user: new mongoose.Types.ObjectId(),
        word: new mongoose.Types.ObjectId(),
        srsLevel: 9
      });

      progress.updateProgress(true);

      expect(progress.srsLevel).toBe(9);
    });

    test('should set correct nextReview time based on srsLevel', () => {
      const progress = new UserVocabularyProgress({
        user: new mongoose.Types.ObjectId(),
        word: new mongoose.Types.ObjectId(),
        srsLevel: 2
      });

      const beforeTime = new Date();
      progress.updateProgress(true); // Should go to level 3 (6 hours = 360 minutes)
      
      const expectedTime = new Date(beforeTime.getTime() + (360 * 60 * 1000));
      const timeDiff = Math.abs(progress.nextReview.getTime() - expectedTime.getTime());
      
      // Allow 1 second difference for test execution time
      expect(timeDiff).toBeLessThan(1000);
    });
  });

  describe('isDue method', () => {
    test('should return true when nextReview is in the past', () => {
      const progress = new UserVocabularyProgress({
        user: new mongoose.Types.ObjectId(),
        word: new mongoose.Types.ObjectId(),
        nextReview: new Date(Date.now() - 1000) // 1 second ago
      });

      expect(progress.isDue()).toBe(true);
    });

    test('should return false when nextReview is in the future', () => {
      const progress = new UserVocabularyProgress({
        user: new mongoose.Types.ObjectId(),
        word: new mongoose.Types.ObjectId(),
        nextReview: new Date(Date.now() + 1000) // 1 second from now
      });

      expect(progress.isDue()).toBe(false);
    });
  });
});