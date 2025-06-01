const mongoose = require('mongoose');

// SRS interval levels (in minutes)
const SRS_INTERVALS = [
  1,      // Level 0: 1 minute
  10,     // Level 1: 10 minutes
  60,     // Level 2: 1 hour
  360,    // Level 3: 6 hours  
  1440,   // Level 4: 1 day
  4320,   // Level 5: 3 days
  10080,  // Level 6: 1 week
  20160,  // Level 7: 2 weeks
  43200,  // Level 8: 1 month
  129600  // Level 9: 3 months
];

const userVocabularyProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  word: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Word',
    required: true
  },
  
  // SRS Level (0-9)
  srsLevel: {
    type: Number,
    default: 0,
    min: 0,
    max: 9
  },
  
  // Statistics
  successCount: {
    type: Number,
    default: 0
  },
  failureCount: {
    type: Number,
    default: 0
  },
  
  // Timing
  lastReviewed: {
    type: Date,
    default: null
  },
  nextReview: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
userVocabularyProgressSchema.index({ user: 1, word: 1 }, { unique: true });
userVocabularyProgressSchema.index({ user: 1, nextReview: 1 });

// Method to update progress record after user answers
userVocabularyProgressSchema.methods.updateProgress = function(isCorrect) {
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
userVocabularyProgressSchema.methods.isDue = function() {
  return this.nextReview <= new Date();
};


module.exports = mongoose.model('UserVocabularyProgress', userVocabularyProgressSchema);