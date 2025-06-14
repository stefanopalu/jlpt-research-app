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
    console.log('getStudySession called with:', { userId, exerciseType, level, totalLimit });

    try {
      // Calculate limits for mixing
      const newLimit = Math.floor(totalLimit * 0.7); // 70% new questions
      const dueLimit = Math.ceil(totalLimit * 0.3); // 30% due questions
      
      console.log('Limits:', { newLimit, dueLimit });

      // Get both due and new questions in parallel
      const [dueQuestions, newQuestions] = await Promise.all([
        this.getDueQuestions(userId, exerciseType, level, dueLimit),
        this.getNewQuestions(userId, exerciseType, level, newLimit),
      ]);

      console.log('Retrieved:', { dueCount: dueQuestions.length, newCount: newQuestions.length });

      // Convert new questions to consistent format with due questions
      const newQuestionCards = newQuestions.map(question => ({
        _id: null, // No progress record yet
        user: userId,
        question: question._id,
        questionData: question,
        srsLevel: 0,
        successCount: 0,
        failureCount: 0,
        isNew: true,
      }));

      // Combine due questions (already in correct format) with new question cards
      const combined = [...dueQuestions, ...newQuestionCards];
      
      // Limit to requested total and shuffle
      const finalQuestions = combined.slice(0, totalLimit).sort(() => Math.random() - 0.5);
      
      console.log('Final session:', { 
        total: finalQuestions.length, 
        due: dueQuestions.length, 
        new: newQuestionCards.length, 
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
  async getQuestionProgress(userId, questionId) {
    return await UserQuestionProgress.findOne({
      user: userId,
      question: questionId,
    }).populate('question');
  },
};

module.exports = questionProgressService;