const mongoose = require('mongoose');

const userGrammarPointProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  grammarPoint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GrammarPoint',
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
}, {
  timestamps: true,
});

userGrammarPointProgressSchema.index({ user: 1, grammarPoint: 1 }, { unique: true });

// Instance method to update progress
userGrammarPointProgressSchema.methods.updateProgress = function(isCorrect) {
  if (isCorrect) {
    this.successCount += 1;
  } else {
    this.failureCount += 1;
  }
  
  this.lastReviewed = new Date();
};

module.exports = mongoose.model('UserGrammarPointProgress', userGrammarPointProgressSchema);