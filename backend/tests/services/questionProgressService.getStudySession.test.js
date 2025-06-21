const questionProgressService = require('../../services/questionProgressService');

// Mock the dependencies
jest.mock('../../models/userQuestionProgress');
jest.mock('../../models/question');
jest.mock('../../models/readingContent');

const UserQuestionProgress = require('../../models/userQuestionProgress');
const Question = require('../../models/question');
const ReadingContent = require('../../models/readingContent');

describe('questionProgressService - getStudySession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Math.random for consistent shuffling tests
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    Math.random.mockRestore();
  });

  describe('getStudySession', () => {
    test('should return mixed session with 80% new, 20% due questions', async () => {
      // Mock due questions (should get 20% = 10 questions for limit 50)
      const mockDueQuestions = [
        {
          _id: 'progress1',
          user: 'user123',
          question: 'question1',
          questionData: {
            _id: 'question1',
            questionText: 'Due question 1',
            answers: ['a', 'b', 'c', 'd'],
            correctAnswer: 0,
            type: 'vocabulary',
            level: 'N4',
            words: ['word1'],
            grammarPoints: ['grammar1'],
            readingContentId: null
          },
          srsLevel: 2,
          successCount: 3,
          failureCount: 1,
          isNew: false
        },
        {
          _id: 'progress2',
          user: 'user123',
          question: 'question2',
          questionData: {
            _id: 'question2',
            questionText: 'Due question 2',
            answers: ['a', 'b', 'c', 'd'],
            correctAnswer: 1,
            type: 'vocabulary',
            level: 'N4',
            words: ['word2'],
            grammarPoints: ['grammar2'],
            readingContentId: {
              _id: 'reading1',
              content: 'Reading content',
              contentType: 'text',
              level: 'N4'
            }
          },
          srsLevel: 1,
          successCount: 1,
          failureCount: 0,
          isNew: false
        }
      ];

      // Mock new questions (should get 80% = 40 questions for limit 50)
      const mockNewQuestions = Array.from({ length: 40 }, (_, i) => ({
        _id: `question${i + 3}`,
        questionText: `New question ${i + 1}`,
        answers: ['a', 'b', 'c', 'd'],
        correctAnswer: i % 4,
        type: 'vocabulary',
        level: 'N4',
        words: [`word${i + 3}`],
        grammarPoints: [`grammar${i + 3}`],
        readingContentId: null
      }));

      // Mock the service methods
      jest.spyOn(questionProgressService, 'getDueQuestions').mockResolvedValue(mockDueQuestions);
      jest.spyOn(questionProgressService, 'getNewQuestions').mockResolvedValue(mockNewQuestions);

      const result = await questionProgressService.getStudySession('user123', 'vocabulary', 'N4', 50);

      // Verify initial calls with correct limits (80% new = 40, 20% due = 10)
      expect(questionProgressService.getDueQuestions).toHaveBeenCalledWith('user123', 'vocabulary', 'N4', 10);
      expect(questionProgressService.getNewQuestions).toHaveBeenCalledWith('user123', 'vocabulary', 'N4', 40);

      // Verify result structure
      expect(result).toHaveLength(42); // 2 due + 40 new = 42 total
      
      // Check that due questions maintain their progress data
      const dueQuestionCards = result.filter(card => !card.isNew);
      expect(dueQuestionCards).toHaveLength(2);
      expect(dueQuestionCards[0]).toMatchObject({
        _id: 'progress1',
        user: 'user123',
        srsLevel: 2,
        successCount: 3,
        failureCount: 1,
        isNew: false
      });

      // Check that new questions have default progress data
      const newQuestionCards = result.filter(card => card.isNew);
      expect(newQuestionCards).toHaveLength(40);
      expect(newQuestionCards[0]).toMatchObject({
        _id: null,
        user: 'user123',
        srsLevel: 0,
        successCount: 0,
        failureCount: 0,
        isNew: true
      });
    });

    test('should handle case with no due questions', async () => {
      const mockNewQuestions = [
        {
          _id: 'question1',
          questionText: 'New question',
          answers: ['a', 'b'],
          correctAnswer: 0,
          type: 'grammar',
          level: 'N4',
          words: [],
          grammarPoints: [],
          readingContentId: null
        }
      ];

      jest.spyOn(questionProgressService, 'getDueQuestions').mockResolvedValue([]);
      jest.spyOn(questionProgressService, 'getNewQuestions').mockResolvedValue(mockNewQuestions);

      const result = await questionProgressService.getStudySession('user123', 'grammar', 'N4', 3);

      expect(result).toHaveLength(1); // Only 1 question available
      expect(result.every(card => card.isNew)).toBe(true);
      expect(questionProgressService.getDueQuestions).toHaveBeenCalledWith('user123', 'grammar', 'N4', 1); // 20% of 3 = 1
      expect(questionProgressService.getNewQuestions).toHaveBeenCalledWith('user123', 'grammar', 'N4', 2); // 80% of 3 = 2
    });

    test('should handle case with no new questions', async () => {
      const mockDueQuestion = {
        _id: 'progress1',
        user: 'user123',
        question: 'question1',
        questionData: {
          _id: 'question1',
          questionText: 'Due question',
          answers: ['a', 'b'],
          correctAnswer: 0,
          type: 'kanji',
          level: 'N4',
          words: [],
          grammarPoints: [],
          readingContentId: null
        },
        srsLevel: 1,
        successCount: 1,
        failureCount: 0,
        isNew: false
      };

      jest.spyOn(questionProgressService, 'getDueQuestions').mockResolvedValue([mockDueQuestion]);
      jest.spyOn(questionProgressService, 'getNewQuestions').mockResolvedValue([]);

      const result = await questionProgressService.getStudySession('user123', 'kanji', 'N4', 3);

      expect(result).toHaveLength(1); // Only 1 due question available
      expect(result.every(card => !card.isNew)).toBe(true);
      expect(result[0]._id).toBe('progress1');
    });

    test('should respect total limit when questions exceed limit', async () => {
      // Mock more questions than the limit
      const mockDueQuestions = Array.from({ length: 5 }, (_, i) => ({
        _id: `progress${i}`,
        user: 'user123',
        question: `question${i}`,
        questionData: {
          _id: `question${i}`,
          questionText: `Due question ${i}`,
          answers: ['a', 'b'],
          correctAnswer: 0,
          type: 'vocabulary',
          level: 'N4',
          words: [],
          grammarPoints: [],
          readingContentId: null
        },
        srsLevel: 1,
        successCount: 1,
        failureCount: 0,
        isNew: false
      }));

      const mockNewQuestions = Array.from({ length: 10 }, (_, i) => ({
        _id: `newquestion${i}`,
        questionText: `New question ${i}`,
        answers: ['a', 'b'],
        correctAnswer: 0,
        type: 'vocabulary',
        level: 'N4',
        words: [],
        grammarPoints: [],
        readingContentId: null
      }));

      jest.spyOn(questionProgressService, 'getDueQuestions').mockResolvedValue(mockDueQuestions);
      jest.spyOn(questionProgressService, 'getNewQuestions').mockResolvedValue(mockNewQuestions);

      const result = await questionProgressService.getStudySession('user123', 'vocabulary', 'N4', 3);

      // Should respect the limit of 3
      expect(result).toHaveLength(3);
    });

    test('should handle questions without reading content', async () => {
      const mockNewQuestions = [
        {
          _id: 'question1',
          questionText: 'Question without reading',
          answers: ['a', 'b'],
          correctAnswer: 0,
          type: 'vocabulary',
          level: 'N4',
          words: ['word1'],
          grammarPoints: ['grammar1'],
          readingContentId: null
        }
      ];

      jest.spyOn(questionProgressService, 'getDueQuestions').mockResolvedValue([]);
      jest.spyOn(questionProgressService, 'getNewQuestions').mockResolvedValue(mockNewQuestions);

      const result = await questionProgressService.getStudySession('user123', 'vocabulary', 'N4', 1);

      expect(result).toHaveLength(1);
      expect(result[0].questionData.readingContentId).toBe(null);
    });

    test('should pass through exercise type and level filters', async () => {
      jest.spyOn(questionProgressService, 'getDueQuestions').mockResolvedValue([]);
      jest.spyOn(questionProgressService, 'getNewQuestions').mockResolvedValue([]);

      await questionProgressService.getStudySession('user123', 'reading', 'N3', 10);

      expect(questionProgressService.getDueQuestions).toHaveBeenCalledWith('user123', 'reading', 'N3', 2); // 20% of 10 = 2
      expect(questionProgressService.getNewQuestions).toHaveBeenCalledWith('user123', 'reading', 'N3', 8); // 80% of 10 = 8
    });

    test('should handle null/undefined exercise type and level', async () => {
      jest.spyOn(questionProgressService, 'getDueQuestions').mockResolvedValue([]);
      jest.spyOn(questionProgressService, 'getNewQuestions').mockResolvedValue([]);

      await questionProgressService.getStudySession('user123', null, null, 5);

      expect(questionProgressService.getDueQuestions).toHaveBeenCalledWith('user123', null, null, 1); // 20% of 5 = 1
      expect(questionProgressService.getNewQuestions).toHaveBeenCalledWith('user123', null, null, 4); // 80% of 5 = 4
    });

    test('should handle service errors gracefully', async () => {
      jest.spyOn(questionProgressService, 'getDueQuestions').mockRejectedValue(new Error('Database error'));
      jest.spyOn(questionProgressService, 'getNewQuestions').mockResolvedValue([]);

      await expect(
        questionProgressService.getStudySession('user123', 'vocabulary', 'N4', 5)
      ).rejects.toThrow('Database error');
    });

    test('should calculate correct limits for different total limits', async () => {
      jest.spyOn(questionProgressService, 'getDueQuestions').mockResolvedValue([]);
      jest.spyOn(questionProgressService, 'getNewQuestions').mockResolvedValue([]);

      // Test limit of 10: 80% = 8 new, 20% = 2 due
      await questionProgressService.getStudySession('user123', null, null, 10);
      expect(questionProgressService.getDueQuestions).toHaveBeenCalledWith('user123', null, null, 2);
      expect(questionProgressService.getNewQuestions).toHaveBeenCalledWith('user123', null, null, 8);

      jest.clearAllMocks();

      // Test limit of 1: 80% = 0 new, 20% = 1 due (due to Math.ceil)
      await questionProgressService.getStudySession('user123', null, null, 1);
      expect(questionProgressService.getDueQuestions).toHaveBeenCalledWith('user123', null, null, 1);
      expect(questionProgressService.getNewQuestions).toHaveBeenCalledWith('user123', null, null, 0);
    });
  });
});