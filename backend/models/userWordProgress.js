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
      responseTime: Number, 
    },
  ],

}, {
  timestamps: true,
});

userWordProgressSchema.index({ user: 1, word: 1 }, { unique: true });
userWordProgressSchema.index({ user: 1, masteryScore: 1 });

// Instance method to update progress
userWordProgressSchema.methods.updateProgress = function(isCorrect, responseTime = null) {
  console.log(`WORDupdateProgress called - isCorrect: ${isCorrect}, responseTime: ${responseTime}`);

  if (isCorrect) {
    this.successCount += 1;
  } else {
    this.failureCount += 1;
  }
  
  this.lastReviewed = new Date();

  this.attempts.push({
    date: new Date(),
    isCorrect,
    responseTime,
  });

  console.log(`Attempt added: ${JSON.stringify(this.attempts[this.attempts.length - 1])}`);
};

module.exports = mongoose.model('UserWordProgress', userWordProgressSchema);