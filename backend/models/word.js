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
});

schema.index({ kanji: 1, hiragana: 1 }, { unique: true });

module.exports = mongoose.model('Word', schema);