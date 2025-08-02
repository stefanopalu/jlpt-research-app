const mongoose = require('mongoose');

const userWordProgressSchema = new mongoose.Schema({
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

  masteryScore: {
    type: Number,
    min: 0,
    max: 1,
  },
}, {
  timestamps: true,
});

userWordProgressSchema.index({ user: 1, word: 1 }, { unique: true });
userWordProgressSchema.index({ user: 1, masteryScore: 1 });

// Instance method to update progress
userWordProgressSchema.methods.updateProgress = function(isCorrect) {
  if (isCorrect) {
    this.successCount += 1;
  } else {
    this.failureCount += 1;
  }
  
  this.lastReviewed = new Date();
};

module.exports = mongoose.model('UserWordProgress', userWordProgressSchema);