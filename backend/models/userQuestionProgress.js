const mongoose = require('mongoose');

const userQuestionProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
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
}, {
  timestamps: true
});

userQuestionProgressSchema.index({ user: 1, question: 1 }, { unique: true });

// Method to update progress record after user answers
userQuestionProgressSchema.methods.updateProgress = function(isCorrect) {
  if (isCorrect) {
    this.successCount += 1;
  } else {
    this.failureCount += 1;
  }
  
  this.lastReviewed = new Date();
};

module.exports = mongoose.model('UserQuestionProgress', userQuestionProgressSchema);
