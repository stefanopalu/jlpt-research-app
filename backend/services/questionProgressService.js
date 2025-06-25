const mongoose = require('mongoose');
const UserQuestionProgress = require('../models/userQuestionProgress');
const Question = require('../models/question');
const ReadingContent = require('../models/readingContent');  

const questionProgressService = {
  // Get due questions for a user (for SRS)
  async getDueQuestions(userId, exerciseType = null, level = null, limit = 15) {    
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

    //Sort by oldest due first, then by limit amount
    pipeline.push({ $sort: { nextReview: 1 } });
    pipeline.push({ $sample: { size: limit } });

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
      // 1. Get all questions user has studied to exclude them (using your existing model)
      const studiedQuestions = await UserQuestionProgress.find({
        user: userId,
      }).select('question');
      
      const studiedQuestionIds = studiedQuestions.map(sq => sq.question);
      console.log(`Found ${studiedQuestionIds.length} studied questions to exclude`);

      // 2. Find readings that have questions available for this user
      const availableReadings = await Question.aggregate([
        {
          $match: {
            type: exerciseType,
            level: level,
            _id: { $nin: studiedQuestionIds },
            readingContentId: { $exists: true, $ne: null },
          },
        },
        {
          $group: {
            _id: '$readingContentId',
            questionCount: { $sum: 1 },
            questionIds: { $push: '$_id' },
          },
        },
        {
          $match: {
            questionCount: { $gte: 2 }, // Only include readings with at least 2 questions
          },
        },
        {
          $limit: maxReadings,
        },
      ]);

      console.log(`Found ${availableReadings.length} available readings`);

      if (availableReadings.length === 0) {
        console.log('No readings available, returning empty array');
        return [];
      }

      // 3. Get full reading content and questions for each selected reading
      const readingSets = [];

      for (const reading of availableReadings) {
        console.log(`Processing reading: ${reading._id} with ${reading.questionCount} questions`);

        // Get the reading content
        const readingContent = await ReadingContent.findById(reading._id);
        if (!readingContent) {
          console.log(`Reading content not found for ID: ${reading._id}`);
          continue;
        }

        // Get all questions for this reading
        const questions = await Question.find({
          _id: { $in: reading.questionIds },
          type: exerciseType,
          level: level,
        }).sort({ _id: 1 }); // Consistent ordering

        // Get question progress for these questions (using your existing model)
        const questionProgresses = await UserQuestionProgress.find({
          user: userId,
          question: { $in: reading.questionIds },
        });

        // Create question cards (following your existing pattern)
        const questionCards = questions.map(question => {
          const progress = questionProgresses.find(qp => 
            qp.question.toString() === question._id.toString(),
          );

          return {
            _id: question._id,
            user: userId,
            question: question._id,
            questionData: {
              ...question.toObject(),
              readingContentId: readingContent.toObject(), // Populate the reading content
            },
            srsLevel: progress?.srsLevel || 0,
            successCount: progress?.successCount || 0,
            failureCount: progress?.failureCount || 0,
            isNew: !progress,
            nextReview: progress?.nextReview || new Date(),
            lastReviewDate: progress?.lastReviewDate || null,
          };
        });

        readingSets.push({
          readingContent: readingContent.toObject(),
          questions: questionCards,
          totalQuestions: questionCards.length,
        });
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
        currentlyDue,
        overallAccuracy: Math.round(overallAccuracy * 10) / 10,
        overallMasteryRate: Math.round(overallMasteryRate * 10) / 10,
        averageSrsLevel: Math.round(overall.avgSrsLevel * 10) / 10,
        byType: byType.map(type => ({
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