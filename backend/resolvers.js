const Word = require('./models/word');
const User = require('./models/user');
const UserProgress = require('./models/userProgress');
const jwt = require('jsonwebtoken');

const { GraphQLError } = require('graphql');

const resolvers = {
  User: {
    userProgress: async (parent) => {
      return await UserProgress.find({ user: parent.id }).populate('word');
    }
  },

  Word: {
    id: (parent) => {
      return parent._id ? parent._id.toString() : null;
    },
  },

  Question: {
    id: (parent) => {
      return parent._id ? parent._id.toString() : null;
    },
  },

  Query: {
    allWords: async (root, args ) => {
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
      const filter = {
        level,
        type
      };

      const questions = await Question.find(filter);

      return questions.map(q => ({
        ...q.toObject(),
        id: q._id.toString(),
      }));
    },
    me: (root, args, context) => {
      console.log('me resolver called with context:', context);
        return context.currentUser
    },
    getUserProgress: async (_, { userId }) => {
      return UserProgress.find({ user: userId }).populate('word');
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
    updateUserProgress: async (root, { wordId, success }, context) => {
      const userId = context.currentUser?._id;
      console.log("updateUserProgress called with userId:", context.currentUser?._id);
      if (!userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      // Find existing progress for this user+word
      let progress = await UserProgress.findOne({ user: userId, word: wordId });

      if (progress) {
        // Update existing progress
        progress.successCount += success ? 1 : 0;
        progress.failureCount += success ? 0 : 1;
        progress.lastReviewed = new Date();
        await progress.save();
      } else {
        // Create new progress entry
        progress = new UserProgress({
          user: userId,
          word: wordId,
          successCount: success ? 1 : 0,
          failureCount: success ? 0 : 1,
          lastReviewed: new Date(),
          nextReview: new Date() // or your custom logic
        });
        await progress.save();
      }

      // Populate the 'word' field before returning
      await progress.populate('word');

      return progress;
    },
  },
};

module.exports = resolvers;
