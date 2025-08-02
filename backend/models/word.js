const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  hiragana: {
    type: String,
    required: true,
  },
  kanji: {
    type: String,
    required: true,
  },
  english: {
    type: [String],
    required: true,
  },
  level: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  // BKT Parameters (no defaults here)
  priorKnowledge: {
    type: Number,
    min: 0,
    max: 1,
  },
  learningRate: {
    type: Number,
    min: 0,
    max: 1,
  },
  slipRate: {
    type: Number,
    min: 0,
    max: 1,
  },
  guessRate: {
    type: Number,
    min: 0,
    max: 1,
  },
});

schema.index({ kanji: 1, hiragana: 1 }, { unique: true });

module.exports = mongoose.model('Word', schema);