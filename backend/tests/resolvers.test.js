const resolvers = require('../resolvers');
const { GraphQLError } = require('graphql');

// Mock all the services
jest.mock('../services/questionProgressService');
jest.mock('../services/wordProgressService');
jest.mock('../services/grammarPointProgressService');
jest.mock('../services/flashcardsProgressService');
jest.mock('../services/authService');
jest.mock('../services/wordService');
jest.mock('../services/questionService');

const questionProgressService = require('../services/questionProgressService');
const wordProgressService = require('../services/wordProgressService');
const grammarPointProgressService = require('../services/grammarPointProgressService');
const authService = require('../services/authService');
const wordService = require('../services/wordService');
const questionService = require('../services/questionService');

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
          { questionId: 'question123', isCorrect: true, responseTime: 1500 },
          context,
        );

        // ✅ Include responseTime parameter
        expect(questionProgressService.updateProgress).toHaveBeenCalledWith(
          'user123',
          'question123',
          true,
          1500
        );
        expect(result).toEqual(mockProgress);
      });

      test('should update question progress without responseTime', async () => {
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

        // ✅ Should include undefined for responseTime when not provided
        expect(questionProgressService.updateProgress).toHaveBeenCalledWith(
          'user123',
          'question123',
          true,
          undefined
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
          { word: '猫', isCorrect: false }, // ✅ Changed from wordKanji to word
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

  describe('Word resolvers', () => {
    describe('Query - findWords', () => {
      test('should find words by kanji', async () => {
        const mockWords = [
          { id: 'word1', kanji: '本', hiragana: 'ほん', english: ['book'] }
        ];
        wordService.findWords.mockResolvedValue(mockWords);

        const result = await resolvers.Query.findWords(
          null,
          { kanji: '本' }
        );

        expect(wordService.findWords).toHaveBeenCalledWith({ kanji: '本' });
        expect(result).toEqual(mockWords);
      });

      test('should find words by hiragana', async () => {
        const mockWords = [
          { id: 'word1', kanji: '本', hiragana: 'ほん', english: ['book'] }
        ];
        wordService.findWords.mockResolvedValue(mockWords);

        const result = await resolvers.Query.findWords(
          null,
          { hiragana: 'ほん' }
        );

        expect(wordService.findWords).toHaveBeenCalledWith({ hiragana: 'ほん' });
        expect(result).toEqual(mockWords);
      });

      test('should find words by english', async () => {
        const mockWords = [
          { id: 'word1', kanji: '本', hiragana: 'ほん', english: ['book'] }
        ];
        wordService.findWords.mockResolvedValue(mockWords);

        const result = await resolvers.Query.findWords(
          null,
          { english: 'book' }
        );

        expect(wordService.findWords).toHaveBeenCalledWith({ english: 'book' });
        expect(result).toEqual(mockWords);
      });

      test('should handle service errors', async () => {
        wordService.findWords.mockRejectedValue(new Error('Service error'));

        await expect(
          resolvers.Query.findWords(null, { kanji: '本' })
        ).rejects.toThrow('Service error');
      });
    });

    describe('Query - allWords', () => {
      test('should get all words without parameters', async () => {
        const mockWords = [
          { id: 'word1', kanji: '本', level: 'N4' },
          { id: 'word2', kanji: '猫', level: 'N5' },
          { id: 'word3', kanji: '学校', level: 'N4' }
        ];
        wordService.getAllWords.mockResolvedValue(mockWords);

        const result = await resolvers.Query.allWords(
          null,
          {} // No parameters, just like allGrammarPoints
        );

        expect(wordService.getAllWords).toHaveBeenCalledWith(); // No parameters
        expect(result).toEqual(mockWords);
      });

      test('should handle service errors', async () => {
        wordService.getAllWords.mockRejectedValue(new Error('Database error'));

        await expect(
          resolvers.Query.allWords(null, {})
        ).rejects.toThrow('Database error');
      });
    });

    // Add this if you implemented the wordsByLevel resolver
    describe('Query - wordsByLevel', () => {
      test('should get words filtered by level', async () => {
        const mockWords = [
          { id: 'word1', kanji: '本', level: 'N4' },
          { id: 'word2', kanji: '学校', level: 'N4' }
        ];
        wordService.getAllWords.mockResolvedValue(mockWords);

        const result = await resolvers.Query.wordsByLevel(
          null,
          { level: 'N4' }
        );

        expect(wordService.getAllWords).toHaveBeenCalledWith('N4');
        expect(result).toEqual(mockWords);
      });

      test('should handle service errors', async () => {
        wordService.getAllWords.mockRejectedValue(new Error('Database error'));

        await expect(
          resolvers.Query.wordsByLevel(null, { level: 'N4' })
        ).rejects.toThrow('Database error');
      });
    });

    describe('Mutation - updateWord', () => {
      test('should update word successfully', async () => {
        const mockUpdatedWord = {
          id: 'word1',
          kanji: '本',
          hiragana: 'ほん',
          english: ['book', 'volume']
        };
        wordService.updateWord.mockResolvedValue(mockUpdatedWord);

        const result = await resolvers.Mutation.updateWord(
          null,
          { 
            id: 'word1', 
            english: ['book', 'volume'] 
          }
        );

        expect(wordService.updateWord).toHaveBeenCalledWith(
          'word1',
          { english: ['book', 'volume'] }
        );
        expect(result).toEqual(mockUpdatedWord);
      });

      test('should handle partial updates', async () => {
        const mockUpdatedWord = {
          id: 'word1',
          kanji: '本',
          hiragana: 'ほん',
          english: ['book']
        };
        wordService.updateWord.mockResolvedValue(mockUpdatedWord);

        await resolvers.Mutation.updateWord(
          null,
          { 
            id: 'word1', 
            hiragana: 'ほん'
          }
        );

        expect(wordService.updateWord).toHaveBeenCalledWith(
          'word1',
          { hiragana: 'ほん' }
        );
      });

      test('should handle service errors', async () => {
        wordService.updateWord.mockRejectedValue(new Error('Word not found'));

        await expect(
          resolvers.Mutation.updateWord(
            null,
            { id: 'nonexistent', english: ['test'] }
          )
        ).rejects.toThrow('Word not found');
      });
    });
  });

  describe('Question resolvers', () => {
    describe('Query - findQuestions', () => {
      test('should find questions by level', async () => {
        const mockQuestions = [
          { id: 'q1', questionText: 'Test question', level: 'N4' }
        ];
        questionService.findQuestions.mockResolvedValue(mockQuestions);

        const result = await resolvers.Query.findQuestions(
          null,
          { level: 'N4' }
        );

        expect(questionService.findQuestions).toHaveBeenCalledWith({ level: 'N4' });
        expect(result).toEqual(mockQuestions);
      });

      test('should find questions by word', async () => {
        const mockQuestions = [
          { id: 'q1', questionText: 'Test question', words: ['寒い'] }
        ];
        questionService.findQuestions.mockResolvedValue(mockQuestions);

        const result = await resolvers.Query.findQuestions(
          null,
          { word: '寒い' }
        );

        expect(questionService.findQuestions).toHaveBeenCalledWith({ word: '寒い' });
        expect(result).toEqual(mockQuestions);
      });

      test('should find questions by grammar point', async () => {
        const mockQuestions = [
          { id: 'q1', questionText: 'Test question', grammarPoints: ['〜ている'] }
        ];
        questionService.findQuestions.mockResolvedValue(mockQuestions);

        const result = await resolvers.Query.findQuestions(
          null,
          { grammarPoint: '〜ている' }
        );

        expect(questionService.findQuestions).toHaveBeenCalledWith({ grammarPoint: '〜ている' });
        expect(result).toEqual(mockQuestions);
      });

      test('should find questions by multiple parameters', async () => {
        const mockQuestions = [
          { id: 'q1', questionText: 'Test question', level: 'N4', type: 'vocabulary' }
        ];
        questionService.findQuestions.mockResolvedValue(mockQuestions);

        const result = await resolvers.Query.findQuestions(
          null,
          { level: 'N4', type: 'vocabulary' }
        );

        expect(questionService.findQuestions).toHaveBeenCalledWith({ 
          level: 'N4', 
          type: 'vocabulary' 
        });
        expect(result).toEqual(mockQuestions);
      });

      test('should handle service errors', async () => {
        questionService.findQuestions.mockRejectedValue(new Error('Service error'));

        await expect(
          resolvers.Query.findQuestions(null, { level: 'N4' })
        ).rejects.toThrow('Service error');
      });
    });

    describe('Query - allQuestions', () => {
      test('should get all questions by level and type', async () => {
        const mockQuestions = [
          { id: 'q1', questionText: 'Test 1', level: 'N4', type: 'vocabulary' },
          { id: 'q2', questionText: 'Test 2', level: 'N4', type: 'vocabulary' }
        ];
        questionService.getAllQuestions.mockResolvedValue(mockQuestions);

        const result = await resolvers.Query.allQuestions(
          null,
          { level: 'N4', type: 'vocabulary' }
        );

        expect(questionService.getAllQuestions).toHaveBeenCalledWith('N4', 'vocabulary');
        expect(result).toEqual(mockQuestions);
      });
    });

    describe('Mutation - updateQuestion', () => {
      test('should update question successfully', async () => {
        const mockUpdatedQuestion = {
          id: 'q1',
          questionText: 'Updated question text',
          answers: ['A', 'B', 'C', 'D'],
          correctAnswer: 2
        };
        questionService.updateQuestion.mockResolvedValue(mockUpdatedQuestion);

        const result = await resolvers.Mutation.updateQuestion(
          null,
          { 
            id: 'q1', 
            questionText: 'Updated question text',
            correctAnswer: 2
          }
        );

        expect(questionService.updateQuestion).toHaveBeenCalledWith(
          'q1',
          { 
            questionText: 'Updated question text',
            correctAnswer: 2
          }
        );
        expect(result).toEqual(mockUpdatedQuestion);
      });

      test('should update question with arrays', async () => {
        const mockUpdatedQuestion = {
          id: 'q1',
          answers: ['新A', '新B', '新C', '新D'],
          words: ['新しい', '古い']
        };
        questionService.updateQuestion.mockResolvedValue(mockUpdatedQuestion);

        await resolvers.Mutation.updateQuestion(
          null,
          { 
            id: 'q1',
            answers: ['新A', '新B', '新C', '新D'],
            words: ['新しい', '古い']
          }
        );

        expect(questionService.updateQuestion).toHaveBeenCalledWith(
          'q1',
          { 
            answers: ['新A', '新B', '新C', '新D'],
            words: ['新しい', '古い']
          }
        );
      });

      test('should handle service errors', async () => {
        questionService.updateQuestion.mockRejectedValue(new Error('Question not found'));

        await expect(
          resolvers.Mutation.updateQuestion(
            null,
            { id: 'nonexistent', questionText: 'test' }
          )
        ).rejects.toThrow('Question not found');
      });
    });
  });
});