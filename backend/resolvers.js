const Word = require('./models/word');
const User = require('./models/user');
const Question = require('./models/question')
const ReadingContent = require('./models/readingContent')
const UserVocabularyProgress = require('./models/userVocabularyProgress');
const vocabularyProgressService = require('./services/vocabularyProgressService');
const questionProgressService = require('./services/questionProgressService');
const jwt = require('jsonwebtoken');

const { GraphQLError } = require('graphql');

const resolvers = {
  User: {
    userVocabularyProgress: async (parent) => {
      return await vocabularyProgressService.getUserProgress(parent.id);
    },
    userQuestionProgress: async (parent) => {
      return await questionProgressService.getUserProgress(parent.id);
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
      return parent._id ? parent._id.toString() : null;
    },
  },

  ReadingContent: {
    id: (parent) => {
      return parent._id ? parent._id.toString() : null;
    }
  },

  UserVocabularyProgress: {
    id: (parent) => {
      return parent._id ? parent._id.toString() : null;
    },
  },

  UserQuestionProgress: {
    id: (parent) => {
      return parent._id ? parent._id.toString() : null;
    },
  },

  Query: {
    allWords: async (root, args) => {
      const filter = {}
      if (args.level) {
        filter.level = args.level;
      }
      const words = await Word.find(filter);
      return words.map(word => ({
        ...word.toObject(),
        id: word._id.toString(),
      }));
    },

    allQuestions: async (root, args) => {
      const { level, type } = args
      const filter = { level, type };

      const questions = await Question.find(filter)
      
      // For each question call the method to get the populated data 
      const populatedQuestions = await Promise.all(
        questions.map(q => q.populateByNames())
      );
      
      // directly return populatedQuestions (plain objects with the needed data about words and grammar points)
      return populatedQuestions; 
    },

    me: (root, args, context) => {
      console.log('me resolver called with context:', context);
      return context.currentUser
    },

    getUserVocabularyProgress: async (_, { userId }) => {
      return await vocabularyProgressService.getUserProgress(userId);
    },

    getStudySession: async (root, { level, limit }, context) => {
      const userId = context.currentUser?._id;
      
      if (!userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      try {
        const session = await vocabularyProgressService.getStudySession(userId, level, limit);
        
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
              type: wordData.type
            },
            srsLevel: card.srsLevel || 0,
            successCount: card.successCount || 0,
            failureCount: card.failureCount || 0,
            isNew: card.isNew || false
          };
        }).filter(card => card !== null);
        
        console.log(`Returning ${transformedSession.length} cards`);
        return transformedSession;
      } catch (error) {
        console.error('Error getting study session:', error);
        throw new GraphQLError(`Failed to get study session: ${error.message}`);
      }
    },

    getUserQuestionProgress: async (_, { userId }) => {
      return await questionProgressService.getUserProgress(userId);
    } 
  },

  Mutation: {
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      console.log("Login attempt:", args)
      console.log("User found in DB:", user)

      if (!user || args.password !== user.password) {
        throw new GraphQLError('wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { 
        value: jwt.sign(userForToken, process.env.JWT_SECRET), 
        user: {
          username: user.username,
          id: user._id.toString(),
        }
      }
    },

    updateUserVocabularyProgress: async (root, { wordId, isCorrect }, context) => {
      const userId = context.currentUser?._id;
      console.log("updateUserVocabularyProgress called with userId:", context.currentUser?._id);
      
      if (!userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      try {
        return await vocabularyProgressService.updateProgress(userId, wordId, isCorrect);
      } catch (error) {
        console.error('Error updating vocabulary progress:', error);
        throw new GraphQLError('Failed to update progress');
      }
    },

    updateUserQuestionProgress: async (root, { questionId, isCorrect }, context) => {
      const userId = context.currentUser?._id;
      console.log("updateUserQuestionProgress called with userId:", context.currentUser?._id);
      
      if (!userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      try {
        return await  questionProgressService.updateProgress(userId, questionId, isCorrect);
      } catch (error) {
        console.error('Error updating question progress:', error);
        throw new GraphQLError('Failed to update progress');
      }
    },
  },
};

module.exports = resolvers;