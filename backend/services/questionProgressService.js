const mongoose = require('mongoose');
const UserQuestionProgress = require('../models/userQuestionProgress');
const Question = require('../models/question');
const ReadingContent = require('../models/readingContent');  

const questionProgressService = {
  // Get due questions for a user (for SRS)
  async getDueQuestions(userId, exerciseType = null, level = null, limit = 15) {
    // CLEANUP ORPHANED RECORDS FIRST
    // const orphanedRecords = await UserQuestionProgress.aggregate([
    //  { $match: { user: userId } }, // Only for this user
    //  {
    //    $lookup: {
    //      from: 'questions',
    //      localField: 'question',
    //      foreignField: '_id',
    //     as: 'questionExists',
    //    },
    //  },
    //  {
    //    $match: {
    //      questionExists: { $size: 0 }, // No matching question found
    //    },
    //  },
    //  {
    //    $project: { _id: 1 }, // Only return the _id for deletion
    //  },
    //]);

    // Delete orphaned records if any found
    //if (orphanedRecords.length > 0) {
    //  const orphanedIds = orphanedRecords.map(record => record._id);
    //  await UserQuestionProgress.deleteMany({ _id: { $in: orphanedIds } });
    //  console.log(`Cleaned up ${orphanedRecords.length} orphaned progress records for user ${userId}`);
    //}

    const query = {
      user: userId,
      nextReview: { $lte: new Date() },
    };

    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'questions',
          localField: 'question',
          foreignField: '_id',
          as: 'questionData',
        },
      },
      { $unwind: '$questionData' },
    ];

    // Filter by exercise type if specified
    if (exerciseType) {
      pipeline.push({
        $match: { 'questionData.type': exerciseType },
      });
    }

    // Filter by level if specified
    if (level) {
      pipeline.push({
        $match: { 'questionData.level': level },
      });
    }

    //Sort by oldest due first and take the first N questions from that sorted list
    pipeline.push({ $sort: { nextReview: 1 } });
    pipeline.push({ $limit: limit }); 

    const dueQuestions = await UserQuestionProgress.aggregate(pipeline);
    
    return dueQuestions;
  },

  // Get new questions not yet attempted by user
  async getNewQuestions(userId, exerciseType = null, level = null, limit = 35) {    
    const userProgressQuestionIds = await UserQuestionProgress.distinct('question', { user: userId });

    const query = {
      _id: { $nin: userProgressQuestionIds },
    };

    if (exerciseType) {
      query.type = exerciseType;
    }

    if (level) {
      query.level = level;
    }

    // Simple query without reading content population
    const questions = await Question.find(query).limit(limit);
    
    // Convert to plain objects
    const questionObjects = questions.map(question => question.toObject());
    
    return questionObjects;
  },

  // Get mixed study session (80% new, 20% due) 
  async getStudySession(userId, exerciseType = null, level = null, totalLimit = 50) {
    try {  
      // Calculate limits for mixing
      const newLimit = Math.floor(totalLimit * 0.8); // 80% new questions
      const dueLimit = Math.ceil(totalLimit * 0.2); // 20% due questions

      // Get both due and new questions in parallel
      const [dueQuestions, newQuestions] = await Promise.all([
        this.getDueQuestions(userId, exerciseType, level, dueLimit),
        this.getNewQuestions(userId, exerciseType, level, newLimit),
      ]);

      // BACKFILL LOGIC: If we don't have enough questions, get more from the other category
      let finalDueQuestions = dueQuestions;
      let finalNewQuestions = newQuestions;

      const currentTotal = dueQuestions.length + newQuestions.length;
      
      if (currentTotal < totalLimit) {
        const shortage = totalLimit - currentTotal;

        if (dueQuestions.length < dueLimit) {
          // Not enough due questions - get more new ones
          const additionalNew = await this.getNewQuestions(userId, exerciseType, level, newLimit + shortage);
          finalNewQuestions = additionalNew;
        } else if (newQuestions.length < newLimit) {
          // Not enough new questions - get more due ones
          const additionalDue = await this.getDueQuestions(userId, exerciseType, level, dueLimit + shortage);
          finalDueQuestions = additionalDue;
        }
      }

      // Convert new questions to consistent format
      const newQuestionCards = finalNewQuestions.map((question) => {
        return {
          _id: null,
          user: userId,
          question: question._id,
          questionData: question, // Simple question data, no reading content needed
          srsLevel: 0,
          successCount: 0,
          failureCount: 0,
          isNew: true,
        };
      });

      // Combine and limit
      const combined = [...finalDueQuestions, ...newQuestionCards];
      const finalQuestions = combined.slice(0, totalLimit).sort(() => Math.random() - 0.5);

      return finalQuestions;

    } catch (error) {
      console.error('Error in getStudySession:', error);
      throw error;
    }
  },
    
  async getReadingBasedSession(userId, exerciseType, level, maxReadings = 3) {
    console.log('=== getReadingBasedSession called ===');
    console.log(`userId: ${userId}, exerciseType: ${exerciseType}, level: ${level}, maxReadings: ${maxReadings}`);

    try {
    // 1. Get due questions using your existing logic (THIS WAS WORKING!)
      const dueQuestions = await this.getDueQuestions(userId, exerciseType, level, 20);
    
      // 2. Get new questions using your existing logic (THIS WAS WORKING!)
      const newQuestions = await this.getNewQuestions(userId, exerciseType, level, 30);
    
      console.log(`Found ${dueQuestions.length} due questions and ${newQuestions.length} new questions`);

      // 3. Combine and filter for questions with reading content (THIS WAS WORKING!)
      const allQuestions = [
        ...dueQuestions.map(dq => ({
          ...dq,
          questionData: dq.questionData,
          isNew: false,
        })),
        ...newQuestions.filter(q => q.readingContentId).map(q => ({
          _id: null,
          user: userId,
          question: q._id,
          questionData: q,
          srsLevel: 0,
          successCount: 0,
          failureCount: 0,
          isNew: true,
        })),
      ];

      // 4. Filter for questions that have reading content (THIS WAS WORKING!)
      const questionsWithReading = allQuestions.filter(q => q.questionData.readingContentId);
      console.log(`Found ${questionsWithReading.length} questions with reading content`);

      if (questionsWithReading.length === 0) {
        return [];
      }

      // 5. Group by reading content (THIS WAS WORKING!)
      const readingGroups = {};
      for (const questionCard of questionsWithReading) {
        const readingId = questionCard.questionData.readingContentId.toString();
        if (!readingGroups[readingId]) {
          readingGroups[readingId] = [];
        }
        readingGroups[readingId].push(questionCard);
      }

      console.log(`Grouped questions into ${Object.keys(readingGroups).length} reading contents`);

      // 6. Select up to maxReadings (THIS WAS WORKING!)
      const selectedReadingIds = Object.keys(readingGroups).slice(0, maxReadings);
      const readingSets = [];

      for (const readingId of selectedReadingIds) {
        console.log(`Processing reading: ${readingId}`);

        // Get the reading content (THIS WAS WORKING!)
        const readingContent = await ReadingContent.findById(readingId);
        if (!readingContent) {
          console.log(`Reading content not found for ID: ${readingId}`);
          continue;
        }

        // Get the questions for this reading that are already available (due/new)
        const questionCards = readingGroups[readingId];
      
        // NEW: Sort these questions in the correct order within this reading
        // Get all question IDs for this reading to determine correct order
        const allQuestionIdsForReading = await Question.find({
          readingContentId: readingId,
          type: exerciseType,
          level: level,
        }).select('_id').sort({ _id: 1 }); // Sort by _id for consistent ordering

        // Create a map for ordering
        const questionOrderMap = {};
        allQuestionIdsForReading.forEach((q, index) => {
          questionOrderMap[q._id.toString()] = index;
        });

        // Sort the available questions by their correct order
        const orderedQuestionCards = questionCards.sort((a, b) => {
          const orderA = questionOrderMap[a.questionData._id.toString()] || 999;
          const orderB = questionOrderMap[b.questionData._id.toString()] || 999;
          return orderA - orderB;
        });

        console.log(`Ordered ${orderedQuestionCards.length} questions for reading ${readingId}`);

        // FIXED: Ensure we always pass full objects, never just IDs
        const fullReadingContentObject = readingContent.toObject();
      
        // Populate reading content for each question with FULL OBJECT
        const enrichedQuestionCards = orderedQuestionCards.map(card => ({
          ...card,
          questionData: {
            ...card.questionData,
            // CRITICAL: Pass the full reading content object
            readingContent: fullReadingContentObject,
          },
        }));

        readingSets.push({
        // CRITICAL: Pass the full reading content object here too
          readingContent: fullReadingContentObject,
          questions: enrichedQuestionCards,
          totalQuestions: enrichedQuestionCards.length,
        });

        console.log(`Added reading set with ${enrichedQuestionCards.length} questions in correct order`);
      }

      const totalQuestions = readingSets.reduce((sum, set) => sum + set.totalQuestions, 0);
      console.log(`Returning ${readingSets.length} reading sets with ${totalQuestions} total questions`);

      return readingSets;

    } catch (error) {
      console.error('Error in getReadingBasedSession:', error);
      throw error;
    }
  },

  // Rest of your methods remain the same...
  async updateProgress(userId, questionId, isCorrect, responseTime = null) {
    let progress = await UserQuestionProgress.findOne({ 
      user: userId, 
      question: questionId, 
    });

    if (progress) {
      progress.updateProgress(isCorrect, responseTime);
      await progress.save();
    } else {
      progress = new UserQuestionProgress({
        user: userId,
        question: questionId,
        srsLevel: 0,
      });
      progress.updateProgress(isCorrect, responseTime);
      await progress.save();
    }

    await progress.populate('question');
    return progress;
  },

  async getUserProgress(userId) {
    return await UserQuestionProgress.find({ user: userId }).populate('question');
  },

  async getUserStats(userId) {
    console.log('getUserStats called for:', userId);
    
    try {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      
      const totalAttempted = await UserQuestionProgress.countDocuments({ user: userId });
      const currentlyDue = await UserQuestionProgress.countDocuments({ 
        user: userId, 
        nextReview: { $lte: new Date() }, 
      });

      const totalQuestions = await Question.countDocuments();
      
      const byType = await UserQuestionProgress.aggregate([
        { $match: { user: userObjectId } },
        {
          $lookup: {
            from: 'questions',
            localField: 'question',
            foreignField: '_id',
            as: 'questionData',
          },
        },
        { $unwind: '$questionData' },
        {
          $group: {
            _id: '$questionData.type',
            attempted: { $sum: 1 },
            totalSuccess: { $sum: '$successCount' },
            totalFailure: { $sum: '$failureCount' },
            due: {
              $sum: {
                $cond: [{ $lte: ['$nextReview', new Date()] }, 1, 0],
              },
            },
            questionsCorrect: {
              $sum: {
                $cond: [{ $gt: ['$successCount', '$failureCount'] }, 1, 0],
              },
            },
            avgSrsLevel: { $avg: '$srsLevel' },
            questionsAtLevel0: {
              $sum: {
                $cond: [{ $eq: ['$srsLevel', 0] }, 1, 0],
              },
            },
          },
        },
        {
          $addFields: {
            accuracy: {
              $cond: [
                { $gt: [{ $add: ['$totalSuccess', '$totalFailure'] }, 0] },
                { 
                  $multiply: [
                    { $divide: ['$totalSuccess', { $add: ['$totalSuccess', '$totalFailure'] }] },
                    100,
                  ],
                },
                0,
              ],
            },
            masteryRate: {
              $cond: [
                { $gt: ['$attempted', 0] },
                { $multiply: [{ $divide: ['$questionsCorrect', '$attempted'] }, 100] },
                0,
              ],
            },
          },
        },
        { $sort: { attempted: -1 } },
      ]);
      
      const questionsByType = await Question.aggregate([
        {
          $group: {
            _id: '$type',
            totalAvailable: { $sum: 1 },
          },
        },
      ]);
      
      const byTypeWithTotals = byType.map(type => {
        const typeTotal = questionsByType.find(qt => qt._id === type._id);
        return {
          ...type,
          totalAvailable: typeTotal?.totalAvailable || 0,
        };
      });

      const overallStats = await UserQuestionProgress.aggregate([
        { $match: { user: userObjectId } },
        {
          $group: {
            _id: null,
            totalSuccess: { $sum: '$successCount' },
            totalFailure: { $sum: '$failureCount' },
            questionsCorrect: {
              $sum: {
                $cond: [{ $gt: ['$successCount', '$failureCount'] }, 1, 0],
              },
            },
            avgSrsLevel: { $avg: '$srsLevel' },
          },
        },
      ]);
      
      const overall = overallStats[0] || { totalSuccess: 0, totalFailure: 0, questionsCorrect: 0, avgSrsLevel: 0 };
      const overallAccuracy = (overall.totalSuccess + overall.totalFailure) > 0 
        ? (overall.totalSuccess / (overall.totalSuccess + overall.totalFailure)) * 100 
        : 0;
      const overallMasteryRate = totalAttempted > 0 
        ? (overall.questionsCorrect / totalAttempted) * 100 
        : 0;
      
      return {
        totalAttempted,
        totalQuestions,
        currentlyDue,
        overallAccuracy: Math.round(overallAccuracy * 10) / 10,
        overallMasteryRate: Math.round(overallMasteryRate * 10) / 10,
        averageSrsLevel: Math.round(overall.avgSrsLevel * 10) / 10,
        byType: byTypeWithTotals.map(type => ({
          ...type,
          accuracy: Math.round(type.accuracy * 10) / 10,
          masteryRate: Math.round(type.masteryRate * 10) / 10,
          avgSrsLevel: Math.round(type.avgSrsLevel * 10) / 10,
        })),
      };
      
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  },
};

module.exports = questionProgressService;