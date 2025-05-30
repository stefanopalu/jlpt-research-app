const mongoose = require('mongoose');

const grammarPointSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  explanation: {
    type: String,
    default: ""
  },
  structure: {
    type: String,
    default: ""
  },
  examples: {
    type: [String],
    default: []
  }
});

module.exports = mongoose.model('GrammarPoint', grammarPointSchema);