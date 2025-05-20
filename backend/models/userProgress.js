const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
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
  successCount: {
    type: Number,
    default: 0
  },
  failureCount: {
    type: Number,
    default: 0
  },
  lastReviewed: {
    type: Date,
    default: Date.now
  },
  nextReview: {
    type: Date,
    default: Date.now
  }
});

userProgressSchema.index({ user: 1, word: 1 }, { unique: true });

module.exports = mongoose.model('UserProgress', userProgressSchema);