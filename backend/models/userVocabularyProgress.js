const mongoose = require('mongoose');

// SRS interval levels (in minutes)
const SRS_INTERVALS = [
  1,      // Level 0: 1 minute
  10,     // Level 1: 10 minutes
  60,     // Level 2: 1 hour
  360,    // Level 3: 6 hours  
  1440,   // Level 4: 1 day
  4320,   // Level 5: 3 days
  10080,  // Level 6: 1 week
  20160,  // Level 7: 2 weeks
  43200,  // Level 8: 1 month
  129600  // Level 9: 3 months
];

const userVocabularyProgressSchema = new mongoose.Schema({
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
  
  // SRS Level (0-9)
  srsLevel: {
    type: Number,
    default: 0,
    min: 0,
    max: 9
  },
  
  // Statistics
  successCount: {
    type: Number,
    default: 0
  },
  failureCount: {
    type: Number,
    default: 0
  },
  
  // Timing
  lastReviewed: {
    type: Date,
    default: null
  },
  nextReview: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
userVocabularyProgressSchema.index({ user: 1, word: 1 }, { unique: true });
userVocabularyProgressSchema.index({ user: 1, nextReview: 1 });

// Method to update progress record after user answers
userVocabularyProgressSchema.methods.updateProgress = function(isCorrect) {
  if (isCorrect) {
    // Move forward one level (max 9) and add one to successCount
    this.srsLevel = Math.min(9, this.srsLevel + 1);
    this.successCount += 1;
  } else {
    // Go back one level (min 0) and add one to failureCount
    this.srsLevel = Math.max(0, this.srsLevel - 1);
    this.failureCount += 1;
  }
  
  // Set next review based on new level
  const intervalMinutes = SRS_INTERVALS[this.srsLevel];
  this.nextReview = new Date(Date.now() + intervalMinutes * 60 * 1000);
  this.lastReviewed = new Date();
};

// Check if card is due for review
userVocabularyProgressSchema.methods.isDue = function() {
  return this.nextReview <= new Date();
};

// Get due cards for a user
userVocabularyProgressSchema.statics.getDueCards = function(userId, level = null, limit = 30) {
  // initial query find records that belong to the user where next review is less than or equal to now
  const query = {
    user: userId,
    nextReview: { $lte: new Date() }
  };
  // Aggregation pipeline: take the words that match the query and
  // join them with the words table to extract the actual word data
  const pipeline = [
    { $match: query },
    {
      $lookup: {
        from: 'words',
        localField: 'word',
        foreignField: '_id',
        as: 'wordData'
      }
    },
    // Convert array to object
    { $unwind: '$wordData' }
  ];
  
  // Keep only words that match the jlpt level
  if (level) {
    pipeline.push({
      $match: { 'wordData.level': level }
    });
  }
  // Take only the number of words we need according to limit
  pipeline.push(
    { $limit: limit }
  );
  
  return this.aggregate(pipeline);
};

// Get words not yet in user's progress 
userVocabularyProgressSchema.statics.getNewWords = async function(userId, level = null, limit = 70) {
  const Word = mongoose.model('Word');
  
  // Find all word IDs this user has progress for and extract the word field from each record
  const userProgressWordIds = await this.distinct('word', { user: userId });
  
  // query for words not in that list and with specified level
  const query = {
    _id: { $nin: userProgressWordIds }
  };
  
  if (level) {
    query.level = level;
  }
  // Filter all the words according to the query and get number of them based on limit
  return Word.find(query).limit(limit);
};

// Get mixed study session (70% new, 30% due)
userVocabularyProgressSchema.statics.getStudySession = async function(userId, level = null, totalLimit = 100) {
  const newLimit = Math.floor(totalLimit * 0.7); // 70% new cards
  
  // Two queries to get new and due cards. their number is based on limits
  const [dueCards, newWords] = await Promise.all([
    this.getDueCards(userId, level, totalLimit),
    this.getNewWords(userId, level, newLimit)
  ]);
  
  // Convert new words to consistent format with due cards so they have SRS data
  const newCards = newWords.map(word => ({
    _id: null, // No progress record yet
    user: userId,
    word: word._id,
    wordData: {
      _id: word._id,
      kanji: word.kanji,
      hiragana: word.hiragana,
      english: word.english,
      level: word.level,
      type: word.type
    },
    srsLevel: 0,
    successCount: 0,
    failureCount: 0,
    isNew: true
  }));
  
  // Combine (max 100 cards per session) and shuffle
  const combined = [...dueCards, ...newCards].slice(0, totalLimit);
  return combined.sort(() => Math.random() - 0.5);
};

module.exports = mongoose.model('UserVocabularyProgress', userVocabularyProgressSchema);