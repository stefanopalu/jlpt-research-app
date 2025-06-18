const mongoose = require('mongoose');
const UserQuestionProgress = require('../models/userQuestionProgress');
const Question = require('../models/question');
const ReadingContent = require('../models/readingContent'); // eslint-disable-line no-unused-vars

const questionProgressService = {
  // Get due questions for a user (for SRS)
  async getDueQuestions(userId, exerciseType = null, level = null, limit = 15) {
    console.log('getDueQuestions called:', { userId, exerciseType, level, limit });
    
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

    pipeline.push({ $limit: limit });

    const dueQuestions = await UserQuestionProgress.aggregate(pipeline);
    console.log('Found due questions:', dueQuestions.length);
    
    const populatedDueQuestions = await Promise.all(
      dueQuestions.map(async (item) => {
        if (item.questionData.readingContentId) {
          const ReadingContent = require('../models/readingContent');
          const readingContent = await ReadingContent.findById(item.questionData.readingContentId);
          if (readingContent) {
            item.questionData.readingContentId = readingContent;
          }
        }
        return item;
      }),
    );
    
    return populatedDueQuestions;
  },

  // Get new questions not yet attempted by user
  async getNewQuestions(userId, exerciseType = null, level = null, limit = 35) {
    console.log('getNewQuestions called:', { userId, exerciseType, level, limit });
    
    const userProgressQuestionIds = await UserQuestionProgress.distinct('question', { user: userId });
    console.log('User has attempted:', userProgressQuestionIds.length, 'questions');

    const query = {
      _id: { $nin: userProgressQuestionIds },
    };

    if (exerciseType) {
      query.type = exerciseType;
    }

    if (level) {
      query.level = level;
    }

    const questions = await Question.find(query)
      .populate('readingContentId')
      .limit(limit);
    console.log('Found new questions:', questions.length);
    
    return questions;
  },

  // Get mixed study session (70% new, 30% due) - replaces old useQuestions logic
  async getStudySession(userId, exerciseType = null, level = null, totalLimit = 50) {
    try {
      // Calculate limits for mixing
      const newLimit = Math.floor(totalLimit * 0.7); // 70% new questions
      const dueLimit = Math.ceil(totalLimit * 0.3); // 30% due questions
      
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
      const newQuestionCards = finalNewQuestions.map(question => ({
        _id: null,
        user: userId,
        question: question._id,
        questionData: question,
        srsLevel: 0,
        successCount: 0,
        failureCount: 0,
        isNew: true,
      }));

      // Combine and limit
      const combined = [...finalDueQuestions, ...newQuestionCards];
      const finalQuestions = combined.slice(0, totalLimit).sort(() => Math.random() - 0.5);
      
      console.log('Final session:', { 
        totalReturned: finalQuestions.length,
        dueCount: finalDueQuestions.length, 
        newCount: newQuestionCards.length, 
      });

      return finalQuestions;

    } catch (error) {
      console.error('Error in getStudySession:', error);
      throw error;
    }
  },
    
  // Update progress for a question (with SRS and time tracking)
  async updateProgress(userId, questionId, isCorrect, responseTime = null) {
    let progress = await UserQuestionProgress.findOne({ 
      user: userId, 
      question: questionId, 
    });

    if (progress) {
      // Update existing progress using SRS and time tracking
      progress.updateProgress(isCorrect, responseTime);
      await progress.save();
    } else {
      // Create new progress entry
      progress = new UserQuestionProgress({
        user: userId,
        question: questionId,
        srsLevel: 0,
      });
      progress.updateProgress(isCorrect, responseTime);
      await progress.save();
    }

    // Populate the question field
    await progress.populate('question');
    return progress;
  },

  // Get user's progress for all questions
  async getUserProgress(userId) {
    return await UserQuestionProgress.find({ user: userId }).populate('question');
  },

  // Get user's progress for specific question
  async getUserStats(userId) {
    console.log('getUserStats called for:', userId);
    
    try {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      
      // Basic counts
      const totalAttempted = await UserQuestionProgress.countDocuments({ user: userId });
      const currentlyDue = await UserQuestionProgress.countDocuments({ 
        user: userId, 
        nextReview: { $lte: new Date() }, 
      });
      
      // Enhanced breakdown by question type with success/failure stats
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
            // Count questions where success > failure (user is "winning")
            questionsCorrect: {
              $sum: {
                $cond: [{ $gt: ['$successCount', '$failureCount'] }, 1, 0],
              },
            },
            // Average SRS level for this type
            avgSrsLevel: { $avg: '$srsLevel' },
            // Questions still at level 0 (never answered correctly)
            questionsAtLevel0: {
              $sum: {
                $cond: [{ $eq: ['$srsLevel', 0] }, 1, 0],
              },
            },
          },
        },
        {
          $addFields: {
            // Calculate accuracy: total correct attempts / total attempts
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
            // Calculate question mastery rate: questions correct / total questions
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
      
      // Overall accuracy calculation
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