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

  masteryScore: {
    type: Number,
    min: 0,
    max: 1,
  },
  // Attempt history
  attempts: [
    {
      date: {
        type: Date,
        default: Date.now,
      },
      isCorrect: {
        type: Boolean,
        required: true,
      },
      responseTime: Number, // Optional — you can track response time per attempt
    },
  ],

}, {
  timestamps: true,
});

userGrammarPointProgressSchema.index({ user: 1, grammarPoint: 1 }, { unique: true });
userGrammarPointProgressSchema.index({ user: 1, masteryScore: 1 });

// Instance method to update progress
userGrammarPointProgressSchema.methods.updateProgress = function(isCorrect, responseTime = null) {
  console.log(`updateProgress called - isCorrect: ${isCorrect}, responseTime: ${responseTime}`);

  if (isCorrect) {
    this.successCount += 1;
  } else {
    this.failureCount += 1;
  }

  const now = new Date();
  this.lastReviewed = now;

  this.attempts.push({
    date: now,
    isCorrect,
    responseTime,
  });

  console.log(`Attempt added: ${JSON.stringify(this.attempts[this.attempts.length - 1])}`);
};

module.exports = mongoose.model('UserGrammarPointProgress', userGrammarPointProgressSchema);