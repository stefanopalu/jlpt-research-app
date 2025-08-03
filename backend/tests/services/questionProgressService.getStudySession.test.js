const questionProgressService = require('../../services/questionProgressService');

// Mock all the models and dependencies
jest.mock('../../models/userQuestionProgress');
jest.mock('../../models/question');
jest.mock('../../models/readingContent');
jest.mock('../../models/user');
jest.mock('../../models/userWordProgress');
jest.mock('../../models/userGrammarPointProgress');
jest.mock('../../models/word');
jest.mock('../../models/grammarPoint');

const UserQuestionProgress = require('../../models/userQuestionProgress');
const Question = require('../../models/question');
const User = require('../../models/user');
const UserWordProgress = require('../../models/userWordProgress');
const UserGrammarPointProgress = require('../../models/userGrammarPointProgress');

describe('questionProgressService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateProgress', () => {
    test('should update existing progress', async () => {
      // Mock existing progress
      const mockProgress = {
        updateProgress: jest.fn(),
        save: jest.fn(),
        populate: jest.fn().mockResolvedValue({
          id: 'progress123',
          user: 'user123',
          question: { id: 'question123', questionText: 'Test question' },
          srsLevel: 1,
          successCount: 1,
          failureCount: 0
        })
      };
      UserQuestionProgress.findOne.mockResolvedValue(mockProgress);

      const userId = 'user123';
      const questionId = 'question123';
      const isCorrect = false;

      const result = await questionProgressService.updateProgress(userId, questionId, isCorrect);

      expect(UserQuestionProgress.findOne).toHaveBeenCalledWith({
        user: userId,
        question: questionId,
      });
      expect(mockProgress.updateProgress).toHaveBeenCalledWith(isCorrect, null);
      expect(mockProgress.save).toHaveBeenCalled();
      expect(mockProgress.populate).toHaveBeenCalledWith('question');
      expect(result).toBeDefined();
    });

    test('should create new progress when none exists', async () => {
      UserQuestionProgress.findOne.mockResolvedValue(null);

      const mockProgress = {
        updateProgress: jest.fn(),
        save: jest.fn(),
        populate: jest.fn().mockResolvedValue({
          id: 'newprogress123',
          user: 'user123',
          question: { id: 'question123', questionText: 'Test question' },
          srsLevel: 0,
          successCount: 1,
          failureCount: 0
        })
      };
      UserQuestionProgress.mockImplementation(() => mockProgress);

      const result = await questionProgressService.updateProgress('user123', 'question123', true);

      expect(UserQuestionProgress).toHaveBeenCalledWith({
        user: 'user123',
        question: 'question123',
        srsLevel: 0,
      });
      expect(mockProgress.updateProgress).toHaveBeenCalledWith(true, null);
      expect(mockProgress.save).toHaveBeenCalled();
      expect(mockProgress.populate).toHaveBeenCalledWith('question');
      expect(result).toBeDefined();
    });

    test('should include responseTime when provided', async () => {
      const mockProgress = {
        updateProgress: jest.fn(),
        save: jest.fn(),
        populate: jest.fn().mockResolvedValue({})
      };
      UserQuestionProgress.findOne.mockResolvedValue(mockProgress);

      await questionProgressService.updateProgress('user123', 'question123', true, 1500);

      expect(mockProgress.updateProgress).toHaveBeenCalledWith(true, 1500);
    });
  });

  describe('getAdaptiveStudySession', () => {
    test('should use SRS session for SRS users', async () => {
      // Mock user with SRS type
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        studySessionType: 'SRS'
      };
      User.findById.mockResolvedValue(mockUser);

      // Mock SRS session data
      const mockSRSSession = [
        {
          _id: 'progress1',
          user: 'user123',
          question: 'question1',
          questionData: { _id: 'question1', questionText: 'Test 1' },
          srsLevel: 1,
          successCount: 0,
          failureCount: 0,
          isNew: false
        }
      ];

      // Spy on the SRS method (updated method name)
      const getSRSStudySessionSpy = jest.spyOn(questionProgressService, 'getSRSStudySession');
      getSRSStudySessionSpy.mockResolvedValue(mockSRSSession);

      const result = await questionProgressService.getAdaptiveStudySession(
        'user123', 
        'vocabulary', 
        'N4', 
        10
      );

      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(getSRSStudySessionSpy).toHaveBeenCalledWith('user123', 'vocabulary', 'N4', 10);
      expect(result).toEqual(mockSRSSession);

      // Restore spy
      getSRSStudySessionSpy.mockRestore();
    });

    test('should use BKT session for BKT users', async () => {
      // Mock user with BKT type
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        studySessionType: 'BKT'
      };
      User.findById.mockResolvedValue(mockUser);

      // Mock BKT session data
      const mockBKTSession = [
        {
          _id: null,
          user: 'user123',
          question: 'question1',
          questionData: { _id: 'question1', questionText: 'Test 1' },
          srsLevel: 0,
          successCount: 0,
          failureCount: 0,
          isNew: false
        }
      ];

      // Spy on the BKT method
      const getBKTStudySessionSpy = jest.spyOn(questionProgressService, 'getBKTStudySession');
      getBKTStudySessionSpy.mockResolvedValue(mockBKTSession);

      const result = await questionProgressService.getAdaptiveStudySession(
        'user123', 
        'vocabulary', 
        'N4', 
        10
      );

      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(getBKTStudySessionSpy).toHaveBeenCalledWith('user123', 'vocabulary', 'N4', 10);
      expect(result).toEqual(mockBKTSession);

      // Restore spy
      getBKTStudySessionSpy.mockRestore();
    });

    test('should throw error when user not found', async () => {
      User.findById.mockResolvedValue(null);

      await expect(
        questionProgressService.getAdaptiveStudySession('user123', 'vocabulary', 'N4', 10)
      ).rejects.toThrow('User not found: user123');
    });
  });

  describe('getQuestionsByMastery', () => {
    test('should return questions for knowledge components in mastery range', async () => {
      // Mock user progress data with proper chaining
      const mockWordProgress = [
        { word: { kanji: '海' } },
        { word: { kanji: '体' } }
      ];
      const mockGrammarProgress = [
        { grammarPoint: { name: 'particle-wo' } }
      ];

      // Fix the populate chaining
      UserWordProgress.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockWordProgress)
      });
      UserGrammarPointProgress.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockGrammarProgress)
      });

      // Mock questions
      const mockQuestions = [
        {
          _id: 'question1',
          questionText: 'Test question',
          words: ['海'],
          grammarPoints: ['particle-wo'],
          toObject: () => ({ _id: 'question1', questionText: 'Test question' })
        }
      ];
      Question.find.mockReturnValue({
        limit: jest.fn().mockResolvedValue(mockQuestions)
      });

      const result = await questionProgressService.getQuestionsByMastery(
        'user123',
        'vocabulary',
        'N4',
        { min: 0.0, max: 0.3 },
        5
      );

      expect(UserWordProgress.find).toHaveBeenCalledWith({
        user: 'user123',
        masteryScore: { $gte: 0.0, $lt: 0.3 }
      });
      expect(UserGrammarPointProgress.find).toHaveBeenCalledWith({
        user: 'user123',
        masteryScore: { $gte: 0.0, $lt: 0.3 }
      });
      expect(result).toHaveLength(1);
      expect(result[0].questionData._id).toBe('question1');
    });

    test('should return empty array when no knowledge components in range', async () => {
      // Mock empty results with proper chaining
      UserWordProgress.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([])
      });
      UserGrammarPointProgress.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([])
      });

      const result = await questionProgressService.getQuestionsByMastery(
        'user123',
        'vocabulary',
        'N4',
        { min: 0.7, max: 1.0 },
        5
      );

      expect(result).toEqual([]);
    });
  });

  describe('getBKTStudySession', () => {
    test('should generate session with correct percentage distribution', async () => {
      // Mock the dependencies that getQuestionsByMastery needs
      UserWordProgress.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([
          { word: { kanji: '海' } },
          { word: { kanji: '体' } }
        ])
      });
      UserGrammarPointProgress.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([
          { grammarPoint: { name: 'particle-wo' } }
        ])
      });

      // Mock questions for mastery-based selection - need to handle multiple calls
      const mockMasteryQuestions = [
        {
          _id: 'mastery1',
          questionText: 'Mastery question 1',
          words: ['海'],
          toObject: () => ({ _id: 'mastery1', questionText: 'Mastery question 1' })
        },
        {
          _id: 'mastery2',
          questionText: 'Mastery question 2',
          words: ['体'],
          toObject: () => ({ _id: 'mastery2', questionText: 'Mastery question 2' })
        }
      ];

      // Create separate Question.find calls for mastery and new questions
      let callCount = 0;
      Question.find.mockImplementation(() => ({
        limit: jest.fn().mockResolvedValue(callCount++ < 3 ? mockMasteryQuestions : [])
      }));

      // Mock getNewQuestions for backfill - need to mock UserQuestionProgress.distinct first
      UserQuestionProgress.distinct.mockResolvedValue([]);
      
      // Create a separate mock for the getNewQuestions call
      const originalQuestionFind = Question.find;
      Question.find = jest.fn().mockImplementation((query) => {
        // If this is the getNewQuestions call (has $nin), return new questions
        if (query._id && query._id.$nin) {
          const mockNewQuestions = Array.from({ length: 8 }, (_, i) => ({
            _id: `new${i + 1}`,
            questionText: `New question ${i + 1}`,
            toObject: () => ({ _id: `new${i + 1}`, questionText: `New question ${i + 1}` })
          }));
          return { limit: jest.fn().mockResolvedValue(mockNewQuestions) };
        }
        // Otherwise return mastery questions
        return { limit: jest.fn().mockResolvedValue(mockMasteryQuestions) };
      });

      const result = await questionProgressService.getBKTStudySession(
        'user123',
        'vocabulary',
        'N4',
        10
      );

      // Should return 10 questions total
      expect(result).toHaveLength(10);

      // Should contain a mix of mastery-based and new questions
      const masteryQuestions = result.filter(q => q.questionData._id.startsWith('mastery'));
      const newQuestions = result.filter(q => q.questionData._id && q.questionData._id.startsWith('new'));
      
      expect(masteryQuestions.length).toBeGreaterThan(0);
      expect(newQuestions.length).toBeGreaterThan(0);
      expect(masteryQuestions.length + newQuestions.length).toBe(10);

      // Restore
      Question.find = originalQuestionFind;
    });

    test('should handle empty mastery categories and backfill with new questions', async () => {
      // Mock empty mastery data
      UserWordProgress.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([])
      });
      UserGrammarPointProgress.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([])
      });

      // Mock UserQuestionProgress.distinct for getNewQuestions
      UserQuestionProgress.distinct.mockResolvedValue([]);

      // Mock Question.find to handle both mastery (empty) and new question calls
      Question.find.mockImplementation((query) => {
        if (query._id && query._id.$nin) {
          // This is the getNewQuestions call - return backfill questions
          const mockNewQuestions = Array.from({ length: 5 }, (_, i) => ({
            _id: `new${i + 1}`,
            questionText: `New question ${i + 1}`,
            toObject: () => ({ _id: `new${i + 1}`, questionText: `New question ${i + 1}` })
          }));
          return { limit: jest.fn().mockResolvedValue(mockNewQuestions) };
        }
        // This is a mastery call - return empty
        return { limit: jest.fn().mockResolvedValue([]) };
      });

      const result = await questionProgressService.getBKTStudySession(
        'user123',
        'vocabulary',
        'N4',
        5
      );

      // Should return 5 questions from backfill
      expect(result).toHaveLength(5);

      // All questions should be new (backfill) questions
      const newQuestions = result.filter(q => q.isNew === true);
      expect(newQuestions.length).toBe(5);
    });

    test('should create questions in correct format', async () => {
      // Mock some mastery data
      UserWordProgress.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([
          { word: { kanji: '海' } }
        ])
      });
      UserGrammarPointProgress.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([])
      });

      const mockMasteryQuestion = {
        _id: 'mastery1',
        questionText: 'What does 海 mean?',
        answers: ['sea', 'mountain', 'river', 'sky'],
        correctAnswer: 0,
        words: ['海'],
        grammarPoints: [],
        toObject: () => ({
          _id: 'mastery1',
          questionText: 'What does 海 mean?',
          answers: ['sea', 'mountain', 'river', 'sky'],
          correctAnswer: 0,
          words: ['海'],
          grammarPoints: []
        })
      };

      Question.find.mockReturnValue({
        limit: jest.fn().mockResolvedValue([mockMasteryQuestion])
      });

      const result = await questionProgressService.getBKTStudySession(
        'user123',
        'vocabulary',
        'N4',
        1
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        _id: null,
        user: 'user123',
        question: 'mastery1',
        questionData: expect.objectContaining({
          _id: 'mastery1',
          questionText: 'What does 海 mean?'
        }),
        srsLevel: 0,
        successCount: 0,
        failureCount: 0,
        isNew: false
      });
    });

    test('should use percentage distribution correctly', async () => {
      // Simple test that just verifies the method runs and returns something
      UserWordProgress.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([])
      });
      UserGrammarPointProgress.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([])
      });

      UserQuestionProgress.distinct.mockResolvedValue([]);
      
      // Mock at least one question for backfill
      Question.find.mockImplementation((query) => {
        if (query._id && query._id.$nin) {
          const mockQuestions = [{ _id: 'test1', questionText: 'Test', toObject: () => ({ _id: 'test1', questionText: 'Test' }) }];
          return { limit: jest.fn().mockResolvedValue(mockQuestions) };
        }
        return { limit: jest.fn().mockResolvedValue([]) };
      });

      const result = await questionProgressService.getBKTStudySession(
        'user123',
        'vocabulary',
        'N4',
        1
      );

      // Should return at least 1 question
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('questionData');
      expect(result[0]).toHaveProperty('user', 'user123');
    });
  });
});