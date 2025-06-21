const mongoose = require('mongoose');
const UserFlashcardsProgress = require('../../models/userFlashcardsProgress');

describe('UserFlashcardsProgress Model', () => {
  describe('updateProgress method', () => {
    test('should increase srsLevel and successCount when correct', () => {
      const progress = new UserFlashcardsProgress({
        user: new mongoose.Types.ObjectId(),
        word: new mongoose.Types.ObjectId(),
        srsLevel: 3,
        successCount: 5,
        failureCount: 2,
      });

      progress.updateProgress(true);

      expect(progress.srsLevel).toBe(4);
      expect(progress.successCount).toBe(6);
      expect(progress.failureCount).toBe(2);
      expect(progress.lastReviewed).toBeInstanceOf(Date);
      expect(progress.nextReview).toBeInstanceOf(Date);
    });

    test('should decrease srsLevel and increase failureCount when incorrect', () => {
      const progress = new UserFlashcardsProgress({
        user: new mongoose.Types.ObjectId(),
        word: new mongoose.Types.ObjectId(),
        srsLevel: 3,
        successCount: 5,
        failureCount: 2,
      });

      progress.updateProgress(false);

      expect(progress.srsLevel).toBe(2);
      expect(progress.successCount).toBe(5);
      expect(progress.failureCount).toBe(3);
      expect(progress.lastReviewed).toBeInstanceOf(Date);
      expect(progress.nextReview).toBeInstanceOf(Date);
    });

    test('should not go below srsLevel 0', () => {
      const progress = new UserFlashcardsProgress({
        user: new mongoose.Types.ObjectId(),
        word: new mongoose.Types.ObjectId(),
        srsLevel: 0,
      });

      progress.updateProgress(false);

      expect(progress.srsLevel).toBe(0);
    });

    test('should not go above srsLevel 9', () => {
      const progress = new UserFlashcardsProgress({
        user: new mongoose.Types.ObjectId(),
        word: new mongoose.Types.ObjectId(),
        srsLevel: 9,
      });

      progress.updateProgress(true);

      expect(progress.srsLevel).toBe(9);
    });

    test('should set correct nextReview time based on srsLevel', () => {
      const progress = new UserFlashcardsProgress({
        user: new mongoose.Types.ObjectId(),
        word: new mongoose.Types.ObjectId(),
        srsLevel: 2,
      });

      const beforeTime = new Date();
      progress.updateProgress(true); // Should go to level 3 (1440 minutes = 24 hours)
      
      // Debug output to understand what's happening
      console.log('Final srsLevel:', progress.srsLevel);
      console.log('Expected interval (minutes):', 1440); // SRS_INTERVALS[3]
      
      const actualInterval = progress.nextReview.getTime() - beforeTime.getTime();
      console.log('Actual interval (ms):', actualInterval);
      console.log('Actual interval (minutes):', actualInterval / (60 * 1000));
      console.log('Actual interval (hours):', actualInterval / (60 * 60 * 1000));
      
      // Expected for level 3 = 1440 minutes = 24 hours = 86400000ms
      const expectedIntervalMs = 1440 * 60 * 1000;
      console.log('Expected interval (ms):', expectedIntervalMs);
      
      const expectedTime = new Date(beforeTime.getTime() + expectedIntervalMs);
      const timeDiff = Math.abs(progress.nextReview.getTime() - expectedTime.getTime());
      
      console.log('Time difference (ms):', timeDiff);
      console.log('Time difference (minutes):', timeDiff / (60 * 1000));
      
      // Allow 5 second difference for test execution time
      expect(timeDiff).toBeLessThan(5000);
    });

    test('should set correct nextReview time based on srsLevel - alternative approach', () => {
      const progress = new UserFlashcardsProgress({
        user: new mongoose.Types.ObjectId(),
        word: new mongoose.Types.ObjectId(),
        srsLevel: 2,
      });

      progress.updateProgress(true); // Should go to level 3
      
      // Check that it's approximately 24 hours (1440 minutes) from now
      const now = new Date();
      const timeDiff = progress.nextReview.getTime() - now.getTime();
      const expectedDiff = 1440 * 60 * 1000; // 24 hours in ms
      
      // Allow 10 second difference for test execution time
      expect(Math.abs(timeDiff - expectedDiff)).toBeLessThan(10000);
    });

    test('should correctly calculate intervals for different levels', () => {
      // Test multiple levels to verify SRS_INTERVALS are being used correctly
      const testCases = [
        { startLevel: 0, expectedMinutes: 240 }, // 0->1: 4 hours
        { startLevel: 1, expectedMinutes: 480 }, // 1->2: 8 hours  
        { startLevel: 2, expectedMinutes: 1440 }, // 2->3: 24 hours
        { startLevel: 3, expectedMinutes: 2880 }, // 3->4: 48 hours
      ];

      testCases.forEach(({ startLevel, expectedMinutes }) => {
        const progress = new UserFlashcardsProgress({
          user: new mongoose.Types.ObjectId(),
          word: new mongoose.Types.ObjectId(),
          srsLevel: startLevel,
        });

        const beforeTime = new Date();
        progress.updateProgress(true);
        
        const actualInterval = progress.nextReview.getTime() - beforeTime.getTime();
        const expectedInterval = expectedMinutes * 60 * 1000;
        const timeDiff = Math.abs(actualInterval - expectedInterval);
        
        console.log(`Level ${startLevel}->${startLevel + 1}: Expected ${expectedMinutes}min, Got ${actualInterval / (60 * 1000)}min`);
        
        // Allow 5 second difference
        expect(timeDiff).toBeLessThan(5000);
      });
    });
  });

  describe('isDue method', () => {
    test('should return true when nextReview is in the past', () => {
      const progress = new UserFlashcardsProgress({
        user: new mongoose.Types.ObjectId(),
        word: new mongoose.Types.ObjectId(),
        nextReview: new Date(Date.now() - 1000), // 1 second ago
      });

      expect(progress.isDue()).toBe(true);
    });

    test('should return false when nextReview is in the future', () => {
      const progress = new UserFlashcardsProgress({
        user: new mongoose.Types.ObjectId(),
        word: new mongoose.Types.ObjectId(),
        nextReview: new Date(Date.now() + 1000), // 1 second from now
      });

      expect(progress.isDue()).toBe(false);
    });
  });
});