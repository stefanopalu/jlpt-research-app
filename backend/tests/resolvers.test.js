const resolvers = require('../resolvers');
const { GraphQLError } = require('graphql');

// Mock all the services
jest.mock('../services/questionProgressService');
jest.mock('../services/wordProgressService');
jest.mock('../services/grammarPointProgressService');
jest.mock('../services/vocabularyProgressService');
jest.mock('../services/authService');

const questionProgressService = require('../services/questionProgressService');
const wordProgressService = require('../services/wordProgressService');
const grammarPointProgressService = require('../services/grammarPointProgressService');
const authService = require('../services/authService');

describe('GraphQL Resolvers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Mutation resolvers', () => {
    describe('updateUserQuestionProgress', () => {
      test('should update question progress when authenticated', async () => {
        const mockProgress = { id: 'progress123', successCount: 1 };
        questionProgressService.updateProgress.mockResolvedValue(mockProgress);

        const context = {
          currentUser: { _id: 'user123' },
        };

        const result = await resolvers.Mutation.updateUserQuestionProgress(
          null,
          { questionId: 'question123', isCorrect: true },
          context,
        );

        expect(questionProgressService.updateProgress).toHaveBeenCalledWith(
          'user123',
          'question123',
          true,
        );
        expect(result).toEqual(mockProgress);
      });

      test('should throw error when not authenticated', async () => {
        const context = { currentUser: null };

        await expect(
          resolvers.Mutation.updateUserQuestionProgress(
            null,
            { questionId: 'question123', isCorrect: true },
            context,
          ),
        ).rejects.toThrow(GraphQLError);

        expect(questionProgressService.updateProgress).not.toHaveBeenCalled();
      });

      test('should throw error when service fails', async () => {
        questionProgressService.updateProgress.mockRejectedValue(new Error('Database error'));

        const context = {
          currentUser: { _id: 'user123' },
        };

        await expect(
          resolvers.Mutation.updateUserQuestionProgress(
            null,
            { questionId: 'question123', isCorrect: true },
            context,
          ),
        ).rejects.toThrow(GraphQLError);
      });
    });

    describe('updateUserWordProgress', () => {
      test('should update word progress when authenticated', async () => {
        const mockProgress = { id: 'progress123', successCount: 1 };
        wordProgressService.updateProgress.mockResolvedValue(mockProgress);

        const context = {
          currentUser: { _id: 'user123' },
        };

        const result = await resolvers.Mutation.updateUserWordProgress(
          null,
          { wordKanji: '猫', isCorrect: false },
          context,
        );

        expect(wordProgressService.updateProgress).toHaveBeenCalledWith(
          'user123',
          '猫',
          false,
        );
        expect(result).toEqual(mockProgress);
      });
    });

    describe('login', () => {
      test('should login successfully', async () => {
        const mockLoginResult = {
          value: 'jwt-token',
          user: { username: 'testuser', id: 'user123' },
        };
        authService.login.mockResolvedValue(mockLoginResult);

        const result = await resolvers.Mutation.login(
          null,
          { username: 'testuser', password: 'password123' },
          {}, // Add empty context - login doesn't need it
        );

        expect(authService.login).toHaveBeenCalledWith({
          username: 'testuser',
          password: 'password123',
        });
        expect(result).toEqual(mockLoginResult);
      }, 10000); // Add 10 second timeout
    });
  });

  describe('Query resolvers', () => {
    describe('getUserQuestionProgress', () => {
      test('should return user question progress', async () => {
        const mockProgress = [{ id: 'progress1' }, { id: 'progress2' }];
        questionProgressService.getUserProgress.mockResolvedValue(mockProgress);

        const result = await resolvers.Query.getUserQuestionProgress(
          null,
          { userId: 'user123' },
        );

        expect(questionProgressService.getUserProgress).toHaveBeenCalledWith('user123');
        expect(result).toEqual(mockProgress);
      });
    });
  });
});