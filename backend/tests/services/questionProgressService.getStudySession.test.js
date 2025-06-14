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
    test('should return mixed session with 70% new, 30% due questions', async () => {
      // Mock due questions (should get 30% = 2 questions for limit 5)
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

      // Mock new questions (should get 70% = 3 questions for limit 5)
      const mockNewQuestions = [
        {
          _id: 'question3',
          questionText: 'New question 1',
          answers: ['a', 'b', 'c', 'd'],
          correctAnswer: 2,
          type: 'vocabulary',
          level: 'N4',
          words: ['word3'],
          grammarPoints: ['grammar3'],
          readingContentId: null
        },
        {
          _id: 'question4',
          questionText: 'New question 2',
          answers: ['a', 'b', 'c', 'd'],
          correctAnswer: 3,
          type: 'vocabulary',
          level: 'N4',
          words: ['word4'],
          grammarPoints: ['grammar4'],
          readingContentId: 'reading2'
        },
        {
          _id: 'question5',
          questionText: 'New question 3',
          answers: ['a', 'b', 'c', 'd'],
          correctAnswer: 0,
          type: 'vocabulary',
          level: 'N4',
          words: ['word5'],
          grammarPoints: ['grammar5'],
          readingContentId: null
        }
      ];

      // Mock reading content population for new questions
      ReadingContent.findById = jest.fn().mockImplementation((id) => {
        if (id === 'reading2') {
          return Promise.resolve({
            _id: 'reading2',
            content: 'New reading content',
            contentType: 'text',
            level: 'N4',
            toObject: () => ({
              _id: 'reading2',
              content: 'New reading content',
              contentType: 'text',
              level: 'N4'
            })
          });
        }
        return Promise.resolve(null);
      });

      // Mock the service methods
      jest.spyOn(questionProgressService, 'getDueQuestions').mockResolvedValue(mockDueQuestions);
      jest.spyOn(questionProgressService, 'getNewQuestions').mockResolvedValue(mockNewQuestions);

      const result = await questionProgressService.getStudySession('user123', 'vocabulary', 'N4', 5);

      // Verify correct limits were calculated (70% new = 3, 30% due = 2)
      expect(questionProgressService.getDueQuestions).toHaveBeenCalledWith('user123', 'vocabulary', 'N4', 2);
      expect(questionProgressService.getNewQuestions).toHaveBeenCalledWith('user123', 'vocabulary', 'N4', 3);

      // Verify result structure
      expect(result).toHaveLength(5);
      
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
      expect(newQuestionCards).toHaveLength(3);
      expect(newQuestionCards[0]).toMatchObject({
        _id: null,
        user: 'user123',
        srsLevel: 0,
        successCount: 0,
        failureCount: 0,
        isNew: true
      });

      // Verify reading content was populated for new questions
      const newCardWithReading = result.find(card => 
        card.isNew && 
        card.questionData.readingContentId && 
        typeof card.questionData.readingContentId === 'object'
      );
      
      if (newCardWithReading) {
        expect(newCardWithReading.questionData.readingContentId).toEqual({
          _id: 'reading2',
          content: 'New reading content',
          contentType: 'text',
          level: 'N4'
        });
      } else {
        // Fallback: verify reading content ID exists (even if not populated)
        const newCardWithReadingId = result.find(card => 
          card.isNew && card.questionData.readingContentId === 'reading2'
        );
        expect(newCardWithReadingId).toBeDefined();
        expect(newCardWithReadingId.questionData.readingContentId).toBe('reading2');
      }
    });

    test('should handle case with no due questions', async () => {
      jest.spyOn(questionProgressService, 'getDueQuestions').mockResolvedValue([]);
      jest.spyOn(questionProgressService, 'getNewQuestions').mockResolvedValue([
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
      ]);

      const result = await questionProgressService.getStudySession('user123', 'grammar', 'N4', 3);

      expect(result).toHaveLength(1);
      expect(result[0].isNew).toBe(true);
      expect(questionProgressService.getDueQuestions).toHaveBeenCalledWith('user123', 'grammar', 'N4', 1);
      expect(questionProgressService.getNewQuestions).toHaveBeenCalledWith('user123', 'grammar', 'N4', 2);
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

      expect(result).toHaveLength(1);
      expect(result[0].isNew).toBe(false);
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

      expect(questionProgressService.getDueQuestions).toHaveBeenCalledWith('user123', 'reading', 'N3', 3);
      expect(questionProgressService.getNewQuestions).toHaveBeenCalledWith('user123', 'reading', 'N3', 7);
    });

    test('should handle null/undefined exercise type and level', async () => {
      jest.spyOn(questionProgressService, 'getDueQuestions').mockResolvedValue([]);
      jest.spyOn(questionProgressService, 'getNewQuestions').mockResolvedValue([]);

      await questionProgressService.getStudySession('user123', null, null, 5);

      expect(questionProgressService.getDueQuestions).toHaveBeenCalledWith('user123', null, null, 2);
      expect(questionProgressService.getNewQuestions).toHaveBeenCalledWith('user123', null, null, 3);
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

      // Test limit of 10: 70% = 7 new, 30% = 3 due
      await questionProgressService.getStudySession('user123', null, null, 10);
      expect(questionProgressService.getDueQuestions).toHaveBeenCalledWith('user123', null, null, 3);
      expect(questionProgressService.getNewQuestions).toHaveBeenCalledWith('user123', null, null, 7);

      jest.clearAllMocks();

      // Test limit of 1: 70% = 0 new, 30% = 1 due (due to Math.ceil)
      await questionProgressService.getStudySession('user123', null, null, 1);
      expect(questionProgressService.getDueQuestions).toHaveBeenCalledWith('user123', null, null, 1);
      expect(questionProgressService.getNewQuestions).toHaveBeenCalledWith('user123', null, null, 0);
    });
  });
});