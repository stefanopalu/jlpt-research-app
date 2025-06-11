const mongoose = require('mongoose');

const readingContentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  contentType: {
    type: String,
    required: true,
  },
  questionType: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('ReadingContent', readingContentSchema);