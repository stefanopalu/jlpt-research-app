const wordService = require('./services/wordService');
const questionService = require('./services/questionService');
const flashcardsProgressService = require('./services/flashcardsProgressService');
const questionProgressService = require('./services/questionProgressService');
const wordProgressService = require('./services/wordProgressService');
const grammarPointProgressService = require('./services/grammarPointProgressService');
const grammarPointService = require('./services/grammarPointService');
const authService = require('./services/authService');

const { GraphQLError } = require('graphql');

const resolvers = {
  User: {
    userFlashcardsProgress: async (parent) => {
      return await flashcardsProgressService.getUserProgress(parent.id);
    },
    userQuestionProgress: async (parent) => {
      return await questionProgressService.getUserProgress(parent.id);
    },
    userWordProgress: async (parent) => {
      return await wordProgressService.getUserProgress(parent.id);
    },
    userGrammarPointProgress: async (parent) => {
      return await grammarPointProgressService.getUserProgress(parent.id);
    },
  },

  Word: {
    id: (parent) => {
      // Handle both _id (from MongoDB) and id (from transformed data)
      if (parent.id) {
        return parent.id.toString();
      }
      return parent._id ? parent._id.toString() : null;
    },
  },

  Question: {
    id: (parent) => {
      // Handle both _id (from MongoDB) and id (from transformed data)
      if (parent.id) {
        return parent.id.toString();
      }
      return parent._id ? parent._id.toString() : null;
    },
  },

  ReadingContent: {
    id: (parent) => {
      return parent._id ? parent._id.toString() : null;
    },
  },

  GrammarPoint: {
    id: (parent) => {
      // Handle both _id (from MongoDB) and id (from transformed data)
      if (parent.id) {
        return parent.id.toString();
      }
      return parent._id ? parent._id.toString() : null;
    },
  },

  UserFlashcardsProgress: {
    id: (parent) => {
      return parent._id ? parent._id.toString() : null;
    },
  },

  UserQuestionProgress: {
    id: (parent) => {
      return parent._id ? parent._id.toString() : null;
    },
  },

  UserWordProgress: {
    id: (parent) => {
      return parent._id ? parent._id.toString() : null;
    },
  },

  UserGrammarPointProgress: {
    id: (parent) => {
      return parent._id ? parent._id.toString() : null;
    },
  },

  StudyQuestion: {
    id: (parent) => {
      // Handle both _id (from MongoDB) and id (from transformed data)
      if (parent.id) {
        return parent.id.toString();
      }
      return parent._id ? parent._id.toString() : null;
    },
  },

  Query: {
    allWords: async (_root, _args) => {
      // No parameters, just like allGrammarPoints
      return await wordService.getAllWords();
    },

    wordsByLevel: async (root, args) => {
      // Separate resolver for level filtering
      return await wordService.getAllWords(args.level);
    },

    findWords: async (root, args) => {
      return await wordService.findWords(args);
    },

    allQuestions: async (root, args) => {
      return await questionService.getAllQuestions(args.level, args.type); 
    },

    findQuestions: async (root, args) => {
      return await questionService.findQuestions(args);
    },

    allGrammarPoints: async (_root, _args) => {
      return await grammarPointService.getAllGrammarPoints();
    },

    findGrammarPoints: async (root, args) => {
      return await grammarPointService.findGrammarPoints(args);
    },

    me: (root, args, context) => {
      console.log('me resolver called with context:', context);
      return context.currentUser;
    },

    getUserFlashcardsProgress: async (_, { userId }) => {
      return await flashcardsProgressService.getUserProgress(userId);
    },

    getStudySession: async (root, { level, limit }, context) => {
      const userId = context.currentUser?._id;
      
      if (!userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      try {
        const session = await flashcardsProgressService.getStudySession(userId, level, limit);
        
        // Transform the data for GraphQL
        // convert objectId to string and restructure the data returned by mongo
        const transformedSession = session.map(card => {
          const wordData = card.wordData;
          
          if (!wordData || !wordData._id) {
            console.error('Missing word data for card:', card);
            return null;
          }
          
          return {
            id: card._id,
            word: {
              id: wordData._id.toString(),
              kanji: wordData.kanji,
              hiragana: wordData.hiragana,
              english: wordData.english,
              level: wordData.level,
              type: wordData.type,
            },
            srsLevel: card.srsLevel || 0,
            successCount: card.successCount || 0,
            failureCount: card.failureCount || 0,
            isNew: card.isNew || false,
          };
        }).filter(card => card !== null);
        
        console.log(`Returning ${transformedSession.length} cards`);
        return transformedSession;
      } catch (error) {
        console.error('Error getting study session:', error);
        throw new GraphQLError(`Failed to get study session: ${error.message}`);
      }
    },

    getQuestionStudySession: async (root, { exerciseType, level, limit }, context) => {
      const userId = context.currentUser?._id;
      
      if (!userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      try {
        console.log('Resolver called with:', { exerciseType, level, limit, userId });
        
        const session = await questionProgressService.getStudySession(userId, exerciseType, level, limit);
        
        console.log('Session returned from service:', session.length, 'items');
        console.log('First session item:', session[0]);
        
        // Transform the data for GraphQL
        const transformedSession = session.map((questionCard, index) => {
          const questionData = questionCard.questionData;
          
          console.log(`Transforming question ${index}:`, {
            hasQuestionData: !!questionData,
            questionDataId: questionData?._id,
            questionText: questionData?.questionText,
            answers: questionData?.answers,
            readingContentId: questionData?.readingContentId,
            readingContent: questionData?.readingContent,
          });
          
          if (!questionData || !questionData._id) {
            console.error(`Missing questionData for card at index ${index}:`, questionCard);
            return null;
          }
          
          const transformed = {
            id: questionCard._id || questionData._id.toString(),
            question: {
              id: questionData._id.toString(),
              questionText: questionData.questionText,
              answers: questionData.answers,
              correctAnswer: questionData.correctAnswer,
              level: questionData.level,
              type: questionData.type,
              words: questionData.words || [],
              grammarPoints: questionData.grammarPoints || [],
              readingContent: questionData.readingContentId || null,
            },
            srsLevel: questionCard.srsLevel || 0,
            successCount: questionCard.successCount || 0,
            failureCount: questionCard.failureCount || 0,
            isNew: questionCard.isNew || false,
          };
          
          console.log(`Transformed question ${index}:`, transformed.question);
          return transformed;
        }).filter(questionCard => questionCard !== null);
        
        console.log(`Returning ${transformedSession.length} question cards`);
        return transformedSession;
      } catch (error) {
        console.error('Error getting question study session:', error);
        throw new GraphQLError(`Failed to get question study session: ${error.message}`);
      }
    },

    getUserQuestionProgress: async (_, { userId }) => {
      return await questionProgressService.getUserProgress(userId);
    },

    getUserQuestionStats: async (parent, { userId }, context) => {
      const { currentUser } = context;
      if (!currentUser) {
        throw new Error('Authentication required');
      }
      
      return await questionProgressService.getUserStats(userId);
    },

    getUserWordProgress: async (_, { userId }) => {
      return await wordProgressService.getUserProgress(userId);
    },
    getUserGrammarPointProgress: async (_, { userId }) => {
      return await grammarPointProgressService.getUserProgress(userId);
    },
    getProblematicGrammarPoints: async (root, args, context) => {
      const userId = context.currentUser?._id;
      
      if (!userId) {
        throw new GraphQLError('Not authenticated');
      }

      return await grammarPointProgressService.getProblematicGrammarPoints(userId);
    },
    getProblematicWords: async (root, args, context) => {
      const userId = context.currentUser?._id;
      
      if (!userId) {
        throw new GraphQLError('Not authenticated');
      }

      return await wordProgressService.getProblematicWords(userId);
    },
  },

  Mutation: {
    login: async (root, args) => {
      return await authService.login(args);
    },

    signUp: async (root, args) => {
      return await authService.signUp(args);
    },
    
    updateUserFlashcardsProgress: async (root, { wordId, isCorrect }, context) => {
      const userId = context.currentUser?._id;
      console.log('updateUserFlashcardsProgress called with userId:', context.currentUser?._id);
      
      if (!userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      try {
        return await flashcardsProgressService.updateProgress(userId, wordId, isCorrect);
      } catch (error) {
        console.error('Error updating flashcards progress:', error);
        throw new GraphQLError('Failed to update progress');
      }
    },

    updateUserQuestionProgress: async (root, { questionId, isCorrect, responseTime }, context) => {
      const userId = context.currentUser?._id;
      console.log('updateUserQuestionProgress called with userId:', context.currentUser?._id);
      
      if (!userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      try {
        return await questionProgressService.updateProgress(userId, questionId, isCorrect, responseTime);
      } catch (error) {
        console.error('Error updating question progress:', error);
        throw new GraphQLError('Failed to update progress');
      }
    },

    updateUserWordProgress: async (root, { word, isCorrect }, context) => {
      const userId = context.currentUser?._id;

      if (!userId) {
        throw new GraphQLError('Not authenticated');
      }

      try {
        const result = await wordProgressService.updateProgress(userId, word, isCorrect);
        return result;
      } catch (error) {
        console.error('Error message:', error.message);
        throw new GraphQLError('Failed to update progress');
      }
    },
    
    updateUserGrammarPointProgress: async (root, { GPname, isCorrect }, context) => {
      const userId = context.currentUser?._id;

      if (!userId) {
        throw new GraphQLError('Not authenticated');
      }

      try {
        const result = await grammarPointProgressService.updateProgress(userId, GPname, isCorrect);
        return result;
      } catch (error) {
        console.error('Error message:', error.message);
        throw new GraphQLError('Failed to update progress');
      }
    },

    updateWord: async (root, { id, ...updateFields }) => {
      return await wordService.updateWord(id, updateFields);
    },

    updateQuestion: async (root, { id, ...updateFields }) => {
      return await questionService.updateQuestion(id, updateFields);
    },

    updateGrammarPoint: async (root, { id, ...updateFields }) => {
      return await grammarPointService.updateGrammarPoint(id, updateFields);
    },

    deleteWord: async (root, { id }) => {
      return await wordService.deleteWord(id);
    },

    deleteQuestion: async (root, { id }) => {
      return await questionService.deleteQuestion(id);
    },

    deleteGrammarPoint: async (root, { id }) => {
      return await grammarPointService.deleteGrammarPoint(id);
    },
  },
};

module.exports = resolvers;