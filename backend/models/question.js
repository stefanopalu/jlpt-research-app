const mongoose = require('mongoose')

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
    ref: 'ReadingContent'
  },
  words: {
    type: [String],
    default: []
  },
  grammarPoints: {
    type: [String],
    default: []
  }
})

questionSchema.index({ type: 1, level: 1 });

questionSchema.methods.populateByNames = async function() {
  let populatedWords = [];
  let populatedGrammarPoints = [];
  let populatedReadingContent = null;
  
  if (this.words && this.words.length > 0) {
    const Word = require('./word');
    // Find words where kanji matches the word in the word array
    const foundWords = await Word.find({ 
      kanji: { $in: this.words }
    });
    
    // Get an array of Word objects with ObjectId converted to string
    populatedWords = foundWords.map(word => ({
      ...word.toObject(),
      id: word._id.toString()
    }));
  }
  
  if (this.grammarPoints && this.grammarPoints.length > 0) {
    const GrammarPoint = require('./grammarPoint');
    const foundGrammar = await GrammarPoint.find({ 
      name: { $in: this.grammarPoints }
    });
    
    populatedGrammarPoints = foundGrammar.map(gp => ({
      ...gp.toObject(),
      id: gp._id.toString()
    }));
  }

  if (this.readingContentId) {
    const ReadingContent = require('./readingContent');
    const foundReadingContent = await ReadingContent.findById(this.readingContentId);
    
    if (foundReadingContent) {
      populatedReadingContent = {
        ...foundReadingContent.toObject(),
        id: foundReadingContent._id.toString()
      };
    }
  }
  
  // Return it with the words and grammarpoints array replaced with the new arrays that contain Word and GrammarPoint objects
  return {
    ...this.toObject(),
    id: this._id.toString(),
    words: populatedWords,
    grammarPoints: populatedGrammarPoints,
    readingContent: populatedReadingContent
  };
};

module.exports = mongoose.model('Question', questionSchema)
