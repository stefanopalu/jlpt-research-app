const questionService = require('../../services/questionService');

// Mock the dependencies
jest.mock('../../models/question');

const Question = require('../../models/question');

describe('questionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllQuestions', () => {
    test('should return questions filtered by level and type', async () => {
      const mockQuestions = [
        { 
          _id: 'question1',
          questionText: 'What is the reading?',
          level: 'N4',
          type: 'vocabulary',
          words: ['単語'],
          grammarPoints: ['grammar_point'],
          readingContentId: null,
          toObject: jest.fn().mockReturnValue({
            _id: 'question1',
            questionText: 'What is the reading?',
            level: 'N4',
            type: 'vocabulary',
            words: ['単語'],
            grammarPoints: ['grammar_point'],
            readingContentId: null
          })
        }
      ];
      
      Question.find.mockResolvedValue(mockQuestions);

      const result = await questionService.getAllQuestions('N4', 'vocabulary');

      expect(Question.find).toHaveBeenCalledWith({ level: 'N4', type: 'vocabulary' });
      expect(result).toEqual([{
        _id: 'question1',
        id: 'question1',
        questionText: 'What is the reading?',
        level: 'N4',
        type: 'vocabulary',
        words: ['単語'],
        grammarPoints: ['grammar_point'],
        readingContentId: null
      }]);
    });

    test('should return multiple questions with correct format', async () => {
      const mockQuestions = [
        { 
          _id: 'question1',
          toObject: jest.fn().mockReturnValue({ _id: 'question1', words: [], grammarPoints: [] })
        },
        { 
          _id: 'question2',
          toObject: jest.fn().mockReturnValue({ _id: 'question2', words: [], grammarPoints: [] })
        }
      ];
      
      Question.find.mockResolvedValue(mockQuestions);

      const result = await questionService.getAllQuestions('N4', 'vocabulary');

      expect(result).toEqual([
        { _id: 'question1', id: 'question1', words: [], grammarPoints: [] },
        { _id: 'question2', id: 'question2', words: [], grammarPoints: [] }
      ]);
    });
  });

  describe('findQuestions', () => {
    test('should find questions by level', async () => {
      const mockQuestions = [
        { 
          _id: 'question1',
          level: 'N4',
          toObject: jest.fn().mockReturnValue({
            _id: 'question1',
            level: 'N4'
          })
        }
      ];
      
      Question.find.mockResolvedValue(mockQuestions);

      const result = await questionService.findQuestions({ level: 'N4' });

      expect(Question.find).toHaveBeenCalledWith({ level: 'N4' });
      expect(result).toEqual([{ _id: 'question1', id: 'question1', level: 'N4' }]);
    });

    test('should find questions by type', async () => {
      const mockQuestions = [
        { 
          _id: 'question1',
          type: 'grammar',
          toObject: jest.fn().mockReturnValue({
            _id: 'question1',
            type: 'grammar'
          })
        }
      ];
      
      Question.find.mockResolvedValue(mockQuestions);

      await questionService.findQuestions({ type: 'grammar' });

      expect(Question.find).toHaveBeenCalledWith({ type: 'grammar' });
    });

    test('should find questions by word in array', async () => {
      const mockQuestions = [
        { 
          _id: 'question1',
          words: ['寒い'],
          toObject: jest.fn().mockReturnValue({
            _id: 'question1',
            words: ['寒い']
          })
        }
      ];
      
      Question.find.mockResolvedValue(mockQuestions);

      await questionService.findQuestions({ word: '寒い' });

      expect(Question.find).toHaveBeenCalledWith({ 
        words: { $in: ['寒い'] } 
      });
    });

    test('should find questions by grammar point in array', async () => {
      const mockQuestions = [
        { 
          _id: 'question1',
          grammarPoints: ['〜ている'],
          toObject: jest.fn().mockReturnValue({
            _id: 'question1',
            grammarPoints: ['〜ている']
          })
        }
      ];
      
      Question.find.mockResolvedValue(mockQuestions);

      await questionService.findQuestions({ grammarPoint: '〜ている' });

      expect(Question.find).toHaveBeenCalledWith({ 
        grammarPoints: { $in: ['〜ている'] } 
      });
    });

    test('should find questions by partial question text match', async () => {
      const mockQuestions = [
        { 
          _id: 'question1',
          questionText: 'Choose the correct reading',
          toObject: jest.fn().mockReturnValue({
            _id: 'question1',
            questionText: 'Choose the correct reading'
          })
        }
      ];
      
      Question.find.mockResolvedValue(mockQuestions);

      await questionService.findQuestions({ questionText: 'choose' });

      expect(Question.find).toHaveBeenCalledWith({ 
        questionText: { $regex: 'choose', $options: 'i' } 
      });
    });

    test('should handle multiple search parameters with AND logic', async () => {
      const mockQuestions = [];
      
      Question.find.mockResolvedValue(mockQuestions);

      await questionService.findQuestions({ 
        level: 'N4', 
        type: 'vocabulary',
        word: '寒い'
      });

      expect(Question.find).toHaveBeenCalledWith({ 
        level: 'N4',
        type: 'vocabulary',
        words: { $in: ['寒い'] }
      });
    });

    test('should throw error when no search parameters provided', async () => {
      await expect(
        questionService.findQuestions({})
      ).rejects.toThrow('Must provide at least one search parameter');
    });
  });

  describe('updateQuestion', () => {
    test('should update question successfully', async () => {
      const mockUpdatedQuestion = {
        _id: 'question1',
        questionText: 'Updated question text',
        words: [],
        grammarPoints: [],
        toObject: jest.fn().mockReturnValue({
          _id: 'question1',
          questionText: 'Updated question text',
          words: [],
          grammarPoints: []
        })
      };

      Question.findByIdAndUpdate.mockResolvedValue(mockUpdatedQuestion);

      const updateData = { questionText: 'Updated question text' };
      const result = await questionService.updateQuestion('question1', updateData);

      expect(Question.findByIdAndUpdate).toHaveBeenCalledWith(
        'question1',
        updateData,
        { new: true, runValidators: true }
      );
      expect(result).toEqual({
        _id: 'question1',
        id: 'question1',
        questionText: 'Updated question text',
        words: [],
        grammarPoints: []
      });
    });

    test('should update question with arrays (answers, words, grammarPoints)', async () => {
      const mockUpdatedQuestion = {
        _id: 'question1',
        answers: ['新しい答え1', '新しい答え2'],
        words: ['新しい', '古い'],
        grammarPoints: ['〜い形容詞'],
        toObject: jest.fn().mockReturnValue({
          _id: 'question1',
          answers: ['新しい答え1', '新しい答え2'],
          words: ['新しい', '古い'],
          grammarPoints: ['〜い形容詞']
        })
      };

      Question.findByIdAndUpdate.mockResolvedValue(mockUpdatedQuestion);

      const updateData = { 
        answers: ['新しい答え1', '新しい答え2'],
        words: ['新しい', '古い'],
        grammarPoints: ['〜い形容詞']
      };

      const result = await questionService.updateQuestion('question1', updateData);

      expect(Question.findByIdAndUpdate).toHaveBeenCalledWith(
        'question1',
        updateData,
        { new: true, runValidators: true }
      );
      
      expect(result).toEqual({
        _id: 'question1',
        id: 'question1',
        answers: ['新しい答え1', '新しい答え2'],
        words: ['新しい', '古い'],
        grammarPoints: ['〜い形容詞']
      });
    });

    test('should throw error when question not found', async () => {
      Question.findByIdAndUpdate.mockResolvedValue(null);

      await expect(
        questionService.updateQuestion('nonexistent', { questionText: 'test' })
      ).rejects.toThrow('Question not found');
    });
  });
});