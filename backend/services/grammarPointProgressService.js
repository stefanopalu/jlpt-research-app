const UserGrammarPointProgress = require('../models/userGrammarPointProgress');
const GrammarPoint = require('../models/grammarPoint');
const bktService = require('./bktService');
const mongoose = require('mongoose');

const grammarPointProgressService = {
  // Update progress for a grammar point using name
  async updateProgress(userId, GPname, isCorrect) {
    // First, find the grammar point by name to get its ObjectId
    const grammarPoint = await GrammarPoint.findOne({ name: GPname });
        
    if (!grammarPoint) {
      throw new Error(`Grammar point not found with name: ${GPname}`);
    }

    console.log('GrammarPoint ObjectId:', grammarPoint._id);
    
    // Find existing progress record for the user and grammarPoint
    let progress = await UserGrammarPointProgress.findOne({
      user: userId, 
      grammarPoint: grammarPoint._id,
    });

    if (progress) {
      // If it exist, update progress record
      progress.updateProgress(isCorrect);
    } else {
      // If it does not, create a new record with prior knowledge as starting mastery
      progress = new UserGrammarPointProgress({
        user: userId,
        grammarPoint: grammarPoint._id,
        masteryScore: grammarPoint.priorKnowledge,
      });
      progress.updateProgress(isCorrect);
    }
    await progress.save();

    // Update BKT mastery score using formula in BKT service
    await bktService.updateGrammarPointMastery(userId, grammarPoint._id, isCorrect);

    await progress.populate('grammarPoint');
    return progress;
  },

  // Get user's progress for all grammar points
  async getUserProgress(userId) {
    return await UserGrammarPointProgress.find({ user: userId }).populate('grammarPoint');
  },

  // Get user's progress for specific grammar point
  async getGrammarPointProgress(userId, grammarPointId) {
    return await UserGrammarPointProgress.findOne({
      user: userId, 
      grammarPoint: grammarPointId, 
    }).populate('grammarPoint');
  },

  // Get grammar points that the user has issues with
  async getProblematicGrammarPoints(userId) {
    // MongoDB aggragation pipeline
    const pipeline = [
      // Start with all grammar points. 
      {
        // Join grammarpoints with usergrammarpointprogress collection using current grammar point's ID
        $lookup: {
          from: 'usergrammarpointprogresses', 
          let: { grammarPointId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$user', new mongoose.Types.ObjectId(userId)] },
                    { $eq: ['$grammarPoint', '$$grammarPointId'] },
                  ],
                },
              },
            },
          ],
          // Store joined results
          as: 'userProgress',
        },
      },
      // Add computed fields to make filtering easier
      {
        $addFields: {
          hasProgress: { $gt: [{ $size: '$userProgress' }, 0] },
          progressData: { $arrayElemAt: ['$userProgress', 0] },
        },
      },
      // Filter for problematic grammar points with two criteria
      {
        $match: {
          $and: [
            // Must have progress record (has been attempted)
            { hasProgress: true },
            // Must have more failures than successes
            {
              $expr: {
                $gt: ['$progressData.failureCount', '$progressData.successCount'],
              },
            },
          ],
        },
      },
      // Calculate failure rate for sorting (only for attempted grammar points)
      {
        $addFields: {
          failureRate: {
            $divide: [
              '$progressData.failureCount',
              { $add: ['$progressData.successCount', '$progressData.failureCount'] },
            ],
          },
        },
      },
      // Sort by failure rate (worst first), then by title
      {
        $sort: { failureRate: -1, title: 1 },
      },
      // Clean up the output - remove temporary fields
      {
        $project: {
          title: 1,
          name: 1,
          explanation: 1,
          grammarStructure: 1,
          grammarExamples: 1,
          // Optional: include progress stats for debugging
          // successCount: '$progressData.successCount',
          // failureCount: '$progressData.failureCount',
          // failureRate: 1
        },
      },
    ];

    try {
      const results = await GrammarPoint.aggregate(pipeline);
      
      // Transform the results to match GraphQL expectations
      return results.map(grammarPoint => ({
        ...grammarPoint,
        id: grammarPoint._id.toString(),
      }));
    } catch (error) {
      console.error('Error in getProblematicGrammarPoints aggregation:', error);
      throw new Error(`Failed to get problematic grammar points: ${error.message}`);
    }
  },
};

module.exports = grammarPointProgressService;