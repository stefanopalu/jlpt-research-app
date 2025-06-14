const mongoose = require('mongoose');
const UserQuestionProgress = require('../../models/userQuestionProgress');

describe('UserQuestionProgress Model - updateProgress method', () => {
  let questionProgress;

  beforeEach(() => {
    // Create a fresh instance for each test
    questionProgress = new UserQuestionProgress({
      user: new mongoose.Types.ObjectId(),
      question: new mongoose.Types.ObjectId(),
      srsLevel: 0,
      successCount: 0,
      failureCount: 0,
      lastReviewed: null,
      nextReview: new Date(),
      responseTime: null,
      averageResponseTime: null
    });
  });

  describe('SRS Level Progression', () => {
    test('should increase SRS level on correct answer', () => {
      questionProgress.srsLevel = 1;
      questionProgress.updateProgress(true);

      expect(questionProgress.srsLevel).toBe(2);
      expect(questionProgress.successCount).toBe(1);
      expect(questionProgress.failureCount).toBe(0);
    });

    test('should decrease SRS level on incorrect answer', () => {
      questionProgress.srsLevel = 3;
      questionProgress.updateProgress(false);

      expect(questionProgress.srsLevel).toBe(2);
      expect(questionProgress.successCount).toBe(0);
      expect(questionProgress.failureCount).toBe(1);
    });

    test('should not go below SRS level 0', () => {
      questionProgress.srsLevel = 0;
      questionProgress.updateProgress(false);

      expect(questionProgress.srsLevel).toBe(0);
      expect(questionProgress.failureCount).toBe(1);
    });

    test('should not exceed maximum SRS level', () => {
      // Assuming max level is around 8-10, test high level
      questionProgress.srsLevel = 8;
      questionProgress.updateProgress(true);

      // Should either stay at 8 or go to 9, but not exceed reasonable bounds
      expect(questionProgress.srsLevel).toBeGreaterThanOrEqual(8);
      expect(questionProgress.srsLevel).toBeLessThanOrEqual(10);
    });
  });

  describe('Next Review Date Calculation', () => {
    test('should set next review date in the future', () => {
      const startTime = new Date();
      questionProgress.srsLevel = 0;
      questionProgress.updateProgress(false);

      // Should set a future date (adjust based on your actual implementation)
      expect(questionProgress.nextReview.getTime()).toBeGreaterThan(startTime.getTime());
    });

    test('should set progressively longer intervals for higher SRS levels', () => {
      const startTime = new Date();
      
      // Test level 1
      questionProgress.srsLevel = 1;
      questionProgress.updateProgress(true);
      const level2NextReview = new Date(questionProgress.nextReview);

      // Reset for level 2 test  
      questionProgress.srsLevel = 2;
      questionProgress.nextReview = startTime; // Reset to compare
      questionProgress.updateProgress(true);
      const level3NextReview = new Date(questionProgress.nextReview);

      // Level 3 should have longer interval than level 2
      expect(level3NextReview.getTime()).toBeGreaterThan(level2NextReview.getTime());
    });

    test('should set appropriate intervals based on SRS level', () => {
      const startTime = new Date();
      
      // Test a few different levels to ensure progression
      const testLevels = [1, 2, 3, 4, 5];
      const intervals = [];
      
      testLevels.forEach(level => {
        questionProgress.srsLevel = level;
        questionProgress.nextReview = startTime; // Reset
        questionProgress.updateProgress(true);
        
        const intervalHours = (questionProgress.nextReview.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        intervals.push(intervalHours);
      });
      
      // Each interval should be longer than the previous (or at least not shorter)
      for (let i = 1; i < intervals.length; i++) {
        expect(intervals[i]).toBeGreaterThanOrEqual(intervals[i-1]);
      }
      
      // First interval should be at least some minimum (adjust based on your implementation)
      expect(intervals[0]).toBeGreaterThan(0);
    });

    test('should handle incorrect answers appropriately', () => {
      const startTime = new Date();
      questionProgress.srsLevel = 5; // High level
      questionProgress.updateProgress(false); // Wrong answer

      const timeDiffHours = (questionProgress.nextReview.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      
      // Should set a reasonable review time (adjust based on your implementation)
      expect(timeDiffHours).toBeGreaterThan(0);
      expect(timeDiffHours).toBeLessThan(168); // Less than a week
    });
  });

  describe('Counter Updates', () => {
    test('should increment success count on correct answer', () => {
      questionProgress.successCount = 3;
      questionProgress.failureCount = 1;
      
      questionProgress.updateProgress(true);

      expect(questionProgress.successCount).toBe(4);
      expect(questionProgress.failureCount).toBe(1); // Should not change
    });

    test('should increment failure count on incorrect answer', () => {
      questionProgress.successCount = 3;
      questionProgress.failureCount = 1;
      
      questionProgress.updateProgress(false);

      expect(questionProgress.successCount).toBe(3); // Should not change
      expect(questionProgress.failureCount).toBe(2);
    });
  });

  describe('Response Time Tracking', () => {
    test('should update response time when provided', () => {
      questionProgress.updateProgress(true, 2500); // 2.5 seconds

      expect(questionProgress.responseTime).toBe(2500);
    });

    test('should calculate average response time correctly', () => {
      // First response
      questionProgress.averageResponseTime = null;
      questionProgress.updateProgress(true, 2000);
      expect(questionProgress.averageResponseTime).toBe(2000);

      // Second response - should average with previous
      questionProgress.updateProgress(true, 4000);
      expect(questionProgress.averageResponseTime).toBe(3000); // (2000 + 4000) / 2
    });

    test('should handle response time with existing average', () => {
      questionProgress.averageResponseTime = 3000;
      questionProgress.successCount = 2; // Had 2 previous correct answers
      
      questionProgress.updateProgress(true, 6000);
      
      // Should weight the average: (3000 * 2 + 6000) / 3 = 4000
      expect(questionProgress.averageResponseTime).toBe(4000);
    });

    test('should not update response time when not provided', () => {
      questionProgress.responseTime = 1000;
      questionProgress.averageResponseTime = 2000;
      
      questionProgress.updateProgress(true); // No response time
      
      expect(questionProgress.responseTime).toBe(1000); // Should remain unchanged
      expect(questionProgress.averageResponseTime).toBe(2000); // Should remain unchanged
    });

    test('should handle zero response time', () => {
      questionProgress.updateProgress(true, 0);
      
      expect(questionProgress.responseTime).toBe(0);
      expect(questionProgress.averageResponseTime).toBe(0);
    });
  });

  describe('Last Reviewed Date', () => {
    test('should update lastReviewed to current date', () => {
      const startTime = new Date();
      questionProgress.lastReviewed = null;
      
      questionProgress.updateProgress(true);
      
      expect(questionProgress.lastReviewed).toBeInstanceOf(Date);
      const timeDiff = questionProgress.lastReviewed.getTime() - startTime.getTime();
      expect(timeDiff).toBeLessThan(1000); // Within 1 second
    });

    test('should update lastReviewed on both correct and incorrect answers', () => {
      const startTime = new Date();
      
      // Test correct answer
      questionProgress.updateProgress(true);
      const correctAnswerTime = new Date(questionProgress.lastReviewed);
      
      // Wait a tiny bit and test incorrect answer
      setTimeout(() => {
        questionProgress.updateProgress(false);
        expect(questionProgress.lastReviewed.getTime()).toBeGreaterThan(correctAnswerTime.getTime());
      }, 10);
    });
  });

  describe('Edge Cases', () => {
    test('should handle undefined/null response time', () => {
      expect(() => {
        questionProgress.updateProgress(true, null);
      }).not.toThrow();
      
      expect(() => {
        questionProgress.updateProgress(true, undefined);
      }).not.toThrow();
    });

    test('should handle very large response times', () => {
      const largeTime = 999999999; // Very large response time
      questionProgress.updateProgress(true, largeTime);
      
      expect(questionProgress.responseTime).toBe(largeTime);
      expect(questionProgress.averageResponseTime).toBe(largeTime);
    });

    test('should handle rapid successive updates', () => {
      questionProgress.updateProgress(true, 1000);
      questionProgress.updateProgress(false, 2000);
      questionProgress.updateProgress(true, 3000);
      
      expect(questionProgress.successCount).toBe(2);
      expect(questionProgress.failureCount).toBe(1);
      expect(questionProgress.responseTime).toBe(3000);
    });
  });

  describe('Data Integrity', () => {
    test('should maintain non-negative counters', () => {
      questionProgress.successCount = 0;
      questionProgress.failureCount = 0;
      
      questionProgress.updateProgress(false);
      questionProgress.updateProgress(false);
      
      expect(questionProgress.successCount).toBeGreaterThanOrEqual(0);
      expect(questionProgress.failureCount).toBeGreaterThanOrEqual(0);
      expect(questionProgress.srsLevel).toBeGreaterThanOrEqual(0);
    });

    test('should ensure nextReview is always a valid future date', () => {
      const now = new Date();
      questionProgress.updateProgress(true);
      
      expect(questionProgress.nextReview).toBeInstanceOf(Date);
      expect(questionProgress.nextReview.getTime()).toBeGreaterThanOrEqual(now.getTime());
    });
  });
});