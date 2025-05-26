const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  answers: {
    type: [String],
    required: true,
  },
  correctAnswer: {
    type: Number,
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
})

module.exports = mongoose.model('Question', schema)