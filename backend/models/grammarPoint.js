const mongoose = require('mongoose');

const grammarPointSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  explanation: {
    type: String,
    default: '',
  },
  structure: {
    type: String,
    default: '',
  },
  examples: {
    type: [String],
    default: [],
  },
});

grammarPointSchema.index({ name: 1 });

module.exports = mongoose.model('GrammarPoint', grammarPointSchema);