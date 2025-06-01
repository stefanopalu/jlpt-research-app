const mongoose = require('mongoose');
const UserWordProgress = require('../../models/userWordProgress');

describe('UserWordProgress Model', () => {
  describe('updateProgress method', () => {
    test('should increment successCount when isCorrect is true', () => {
      const progress = new UserWordProgress({
        user: new mongoose.Types.ObjectId(),
        word: new mongoose.Types.ObjectId(),
        successCount: 5,
        failureCount: 2
      });

      progress.updateProgress(true);

      expect(progress.successCount).toBe(6);
      expect(progress.failureCount).toBe(2);
      expect(progress.lastReviewed).toBeInstanceOf(Date);
    });

    test('should increment failureCount when isCorrect is false', () => {
      const progress = new UserWordProgress({
        user: new mongoose.Types.ObjectId(),
        word: new mongoose.Types.ObjectId(),
        successCount: 5,
        failureCount: 2
      });

      progress.updateProgress(false);

      expect(progress.successCount).toBe(5);
      expect(progress.failureCount).toBe(3);
      expect(progress.lastReviewed).toBeInstanceOf(Date);
    });

    test('should set lastReviewed to current date', () => {
      const progress = new UserWordProgress({
        user: new mongoose.Types.ObjectId(),
        word: new mongoose.Types.ObjectId()
      });

      const beforeTime = new Date();
      progress.updateProgress(true);
      const afterTime = new Date();

      expect(progress.lastReviewed.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(progress.lastReviewed.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });
  });
});