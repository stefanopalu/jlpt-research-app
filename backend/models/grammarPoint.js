const mongoose = require('mongoose');

const grammarPointSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  explanation: {
    type: String,
    default: '',
  },
  grammarStructure: {
    formation: {
      type: [String],
      required: true,
    },
    declinations: {
      type: [String],
      default: [],
    },
  },
  grammarExamples: [{
    japanese: {
      type: String,
      required: true,
    },
    english: {
      type: String,
      required: true,
    },
  }],
});

grammarPointSchema.index({ name: 1 });

module.exports = mongoose.model('GrammarPoint', grammarPointSchema);