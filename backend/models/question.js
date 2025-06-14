const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
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
  readingContentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReadingContent',
  },
  words: {
    type: [String],
    default: [],
  },
  grammarPoints: {
    type: [String],
    default: [],
  },
});

questionSchema.index({ type: 1, level: 1 });

questionSchema.methods.populateReadingContent = async function() {
  let populatedReadingContent = null;

  if (this.readingContentId) {
    const ReadingContent = require('./readingContent');
    const foundReadingContent = await ReadingContent.findById(this.readingContentId);
    
    if (foundReadingContent) {
      populatedReadingContent = {
        ...foundReadingContent.toObject(),
        id: foundReadingContent._id.toString(),
      };
    }
  }
  
  // Return it with the words and grammarpoints array replaced with the new arrays that contain Word and GrammarPoint objects
  return {
    ...this.toObject(),
    id: this._id.toString(),
    readingContent: populatedReadingContent,
  };
};

module.exports = mongoose.model('Question', questionSchema);
