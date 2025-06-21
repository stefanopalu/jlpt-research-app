const mongoose = require('mongoose');

// SRS interval levels (in minutes)
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

const userFlashcardsProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  word: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Word',
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
  
  // Timing
  lastReviewed: {
    type: Date,
    default: null,
  },
  nextReview: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes
userFlashcardsProgressSchema.index({ user: 1, word: 1 }, { unique: true });
userFlashcardsProgressSchema.index({ user: 1, nextReview: 1 });

// Method to update progress record after user answers
userFlashcardsProgressSchema.methods.updateProgress = function(isCorrect) {
  if (isCorrect) {
    // Move forward one level (max 9) and add one to successCount
    this.srsLevel = Math.min(9, this.srsLevel + 1);
    this.successCount += 1;
  } else {
    // Go back one level (min 0) and add one to failureCount
    this.srsLevel = Math.max(0, this.srsLevel - 1);
    this.failureCount += 1;
  }
  
  // Set next review based on new level
  const intervalMinutes = SRS_INTERVALS[this.srsLevel];
  this.nextReview = new Date(Date.now() + intervalMinutes * 60 * 1000);
  this.lastReviewed = new Date();
};

// Check if card is due for review
userFlashcardsProgressSchema.methods.isDue = function() {
  return this.nextReview <= new Date();
};


module.exports = mongoose.model('UserFlashcardsProgress', userFlashcardsProgressSchema);