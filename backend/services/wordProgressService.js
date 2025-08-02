const UserWordProgress = require('../models/userWordProgress');
const Word = require('../models/word');
const bktService = require('./bktService');
const mongoose = require('mongoose');

const wordProgressService = {
  // Update progress for a word using kanji value
  async updateProgress(userId, word, isCorrect) {
    // First, find the word by kanji to get its ObjectId
    const wordObj = await Word.findOne({ kanji: word });
        
    if (!wordObj) {
      throw new Error(`Word not found with kanji: ${word}`);
    }
    
    // Find existing progress record for the user and word
    let progress = await UserWordProgress.findOne({
      user: userId, 
      word: wordObj._id,
    });

    if (progress) {
      // If there is an existing progress record, update it
      progress.updateProgress(isCorrect);
    } else {
      // If not, create new record with prior knowledge as starting mastery score
      progress = new UserWordProgress({
        user: userId,
        word: wordObj._id,
        masteryScore: wordObj.priorKnowledge,
      });
      
      progress.updateProgress(isCorrect);
    }

    await progress.save();
 
    // Update BKT mastery score using formula in BKT service
    await bktService.updateWordMastery(userId, wordObj._id, isCorrect);
    
    await progress.populate('word');
    return progress;
  },
  
  // Get user's progress for all words
  async getUserProgress(userId) {
    return await UserWordProgress.find({ user: userId }).populate('word');
  },

  // Get user's progress for specific word
  async getWordProgress(userId, wordId) {
    return await UserWordProgress.findOne({
      user: userId, 
      word: wordId, 
    }).populate('word');
  },

  // Get words that the user has issues with
  async getProblematicWords(userId) {
    const pipeline = [
      // STEP 1: Join words with user progress data
      {
        $lookup: {
          from: 'userwordprogresses', // MongoDB collection name (lowercase + pluralized)
          let: { wordId: '$_id' }, // Store current word's _id in a variable
          pipeline: [ // Sub-pipeline to filter the joined data
            {
              $match: { // Filter conditions for the join
                $expr: { // Use expressions to compare fields
                  $and: [ // Both conditions must be true
                    { $eq: ['$user', new mongoose.Types.ObjectId(userId)] }, // Match the specific user
                    { $eq: ['$word', '$$wordId'] }, // Match this word (use $$ for parent variable)
                  ],
                },
              },
            },
          ],
          as: 'userProgress', // Store joined results in 'userProgress' array
        },
      },
      
      // STEP 2: Add computed fields to make filtering easier
      {
        $addFields: {
          hasProgress: { $gt: [{ $size: '$userProgress' }, 0] }, // true if userProgress array has any elements
          progressData: { $arrayElemAt: ['$userProgress', 0] }, // Extract first (and only) element from userProgress array
        },
      },
      
      // STEP 3: Filter for problematic words only
      {
        $match: {
          $and: [ // Both conditions must be true
            { hasProgress: true }, // Must have progress data (has been attempted)
            {
              $expr: { // Use expression to compare fields
                $gt: ['$progressData.failureCount', '$progressData.successCount'], // More failures than successes
              },
            },
          ],
        },
      },
      
      // STEP 4: Calculate failure rate for sorting
      {
        $addFields: {
          failureRate: { // Calculate percentage of failures
            $divide: [ // Division operation
              '$progressData.failureCount', // Numerator: number of failures
              { $add: ['$progressData.successCount', '$progressData.failureCount'] }, // Denominator: total attempts
            ],
          },
        },
      },
      
      // STEP 5: Sort results by priority
      {
        $sort: { 
          failureRate: -1, // Primary sort: highest failure rate first (-1 = descending)
          kanji: 1, // Secondary sort: alphabetical by kanji (1 = ascending)
        },
      },
      
      // STEP 6: Clean up the output - remove temporary fields
      {
        $project: {
          hiragana: 1, // Include hiragana field
          kanji: 1, // Include kanji field
          english: 1, // Include english field
          level: 1, // Include level field
          type: 1, // Include type field
          // hasProgress, progressData, and failureRate are excluded (not listed = excluded)
        },
      },
    ];

    try {
      // Execute the aggregation pipeline on Word collection
      const results = await Word.aggregate(pipeline);
      
      // Transform the results to match GraphQL expectations
      return results.map(word => ({
        ...word, // Spread all existing fields
        id: word._id.toString(), // Convert MongoDB ObjectId to string for GraphQL
      }));
    } catch (error) {
      // Log the error for debugging
      console.error('Error in getProblematicWords aggregation:', error);
      // Throw a more user-friendly error message
      throw new Error(`Failed to get problematic words: ${error.message}`);
    }
  },
};

module.exports = wordProgressService;