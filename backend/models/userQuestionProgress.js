const mongoose = require('mongoose');

// SRS interval levels (in minutes) - same as flashcards
const SRS_INTERVALS = [
  1, // Level 0: 1 minute
  240, // Level 1: 4 hours
  480, // Level 2: 8 hours
  1440, // Level 3: 1 day 
  2880, // Level 4: 2 days
  5760, // Level 5: 4 days
  10080, // Level 6: 1 week
  20160, // Level 7: 2 weeks
  43200, // Level 8: 1 month
  129600, // Level 9: 3 months
];

const userQuestionProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },

  // SRS Level (0-9)
  srsLevel: {
    type: Number,
    default: 0,
    min: 0,
    max: 9,
  },

  // Statistics
  successCount: {
    type: Number,
    default: 0,
  },
  failureCount: {
    type: Number,
    default: 0,
  },

  // Timing - SRS
  lastReviewed: {
    type: Date,
    default: null,
  },
  nextReview: {
    type: Date,
    default: Date.now,
  },

  // Timing - Response Time Tracking
  responseTime: {
    type: Number, // milliseconds for current response
    default: null,
  },
  averageResponseTime: {
    type: Number, // milliseconds average
    default: null,
  },
}, {
  timestamps: true,
});

// Indexes
userQuestionProgressSchema.index({ user: 1, question: 1 }, { unique: true });
userQuestionProgressSchema.index({ user: 1, nextReview: 1 }); // For SRS queries

// Method to update progress record after user answers
userQuestionProgressSchema.methods.updateProgress = function(isCorrect, responseTime = null) {
  // Update SRS level
  if (isCorrect) {
    this.srsLevel = Math.min(9, this.srsLevel + 1);
    this.successCount += 1;
  } else {
    this.srsLevel = Math.max(0, this.srsLevel - 1);
    this.failureCount += 1;
  }

  // Update timing
  this.lastReviewed = new Date();
  
  // Set next review based on new SRS level
  const intervalMinutes = SRS_INTERVALS[this.srsLevel];
  this.nextReview = new Date(Date.now() + intervalMinutes * 60 * 1000);

  // Update response time tracking
  if (responseTime !== null) {
    this.responseTime = responseTime;
    
    // Calculate new average response time
    if (this.averageResponseTime === null) {
      this.averageResponseTime = responseTime;
    } else {
      // Simple moving average (could be weighted later)
      const totalAttempts = this.successCount + this.failureCount;
      this.averageResponseTime = Math.round(
        ((this.averageResponseTime * (totalAttempts - 1)) + responseTime) / totalAttempts,
      );
    }
  }
};

// Check if question is due for review
userQuestionProgressSchema.methods.isDue = function() {
  return this.nextReview <= new Date();
};

module.exports = mongoose.model('UserQuestionProgress', userQuestionProgressSchema);