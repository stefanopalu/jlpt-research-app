const flashcardsProgressService = require('../../services/flashcardsProgressService');

jest.mock('../../models/userFlashcardsProgress');
jest.mock('../../models/word');

const UserFlashcardsProgress = require('../../models/userFlashcardsProgress');
const Word = require('../../models/word');

describe('flashcardsProgressService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateProgress', () => {
    test('should update existing progress', async () => {
      const mockProgress = {
        updateProgress: jest.fn(),
        save: jest.fn(),
        populate: jest.fn().mockResolvedValue({}),
      };
      UserFlashcardsProgress.findOne.mockResolvedValue(mockProgress);

      await flashcardsProgressService.updateProgress('user123', 'word123', true);

      expect(UserFlashcardsProgress.findOne).toHaveBeenCalledWith({
        user: 'user123',
        word: 'word123',
      });
      expect(mockProgress.updateProgress).toHaveBeenCalledWith(true);
      expect(mockProgress.save).toHaveBeenCalled();
      expect(mockProgress.populate).toHaveBeenCalledWith('word');
    });

    test('should create new progress when none exists', async () => {
      UserFlashcardsProgress.findOne.mockResolvedValue(null);

      const mockProgress = {
        updateProgress: jest.fn(),
        save: jest.fn(),
        populate: jest.fn().mockResolvedValue({}),
      };
      UserFlashcardsProgress.mockImplementation(() => mockProgress);

      await flashcardsProgressService.updateProgress('user123', 'word123', false);

      expect(UserFlashcardsProgress).toHaveBeenCalledWith({
        user: 'user123',
        word: 'word123',
        srsLevel: 0,
      });
      expect(mockProgress.updateProgress).toHaveBeenCalledWith(false);
      expect(mockProgress.save).toHaveBeenCalled();
    });
  });

  describe('getDueCards', () => {
    test('should return due cards with correct aggregation', async () => {
      const mockDueCards = [
        { _id: 'progress1', user: 'user123', wordData: { kanji: '猫' } },
      ];
      UserFlashcardsProgress.aggregate.mockResolvedValue(mockDueCards);

      const result = await flashcardsProgressService.getDueCards('user123', 'N5', 10);

      expect(UserFlashcardsProgress.aggregate).toHaveBeenCalledWith([
        { $match: { user: 'user123', nextReview: { $lte: expect.any(Date) } } },
        { $lookup: { from: 'words', localField: 'word', foreignField: '_id', as: 'wordData' } },
        { $unwind: '$wordData' },
        { $match: { 'wordData.level': 'N5' } },
        { $sample: { size: 10 } },
      ]);
      expect(result).toEqual(mockDueCards);
    });
  });

  describe('getNewWords', () => {
    test('should return words not in user progress', async () => {
      const mockWordIds = ['word1', 'word2'];
      const mockNewWords = [{ _id: 'word3', kanji: '犬' }];

      UserFlashcardsProgress.distinct.mockResolvedValue(mockWordIds);
      
      // Mock both countDocuments (for totalAvailable) and aggregate
      Word.countDocuments.mockResolvedValue(10); // Mock total available count
      Word.aggregate.mockResolvedValue(mockNewWords);

      const result = await flashcardsProgressService.getNewWords('user123', 'N5', 5);

      expect(UserFlashcardsProgress.distinct).toHaveBeenCalledWith('word', { user: 'user123' });
      
      // Verify countDocuments was called to get totalAvailable
      expect(Word.countDocuments).toHaveBeenCalledWith({
        _id: { $nin: mockWordIds },
        level: 'N5',
      });
      
      // Verify aggregate was called with Math.min(5, 10) = 5
      expect(Word.aggregate).toHaveBeenCalledWith([
        { 
          $match: { 
            _id: { $nin: mockWordIds },
            level: 'N5',
          } 
        },
        { $sample: { size: 5 } } // Should be Math.min(5, 10) = 5
      ]);
      expect(result).toEqual(mockNewWords);
    });

    test('should handle case when totalAvailable is less than limit', async () => {
      const mockWordIds = ['word1', 'word2'];
      const mockNewWords = [{ _id: 'word3', kanji: '犬' }];

      UserFlashcardsProgress.distinct.mockResolvedValue(mockWordIds);
      
      // Mock fewer available words than requested
      Word.countDocuments.mockResolvedValue(3); // Only 3 available
      Word.aggregate.mockResolvedValue(mockNewWords);

      const result = await flashcardsProgressService.getNewWords('user123', 'N5', 10);

      expect(Word.countDocuments).toHaveBeenCalledWith({
        _id: { $nin: mockWordIds },
        level: 'N5',
      });
      
      // Should use Math.min(10, 3) = 3
      expect(Word.aggregate).toHaveBeenCalledWith([
        { 
          $match: { 
            _id: { $nin: mockWordIds },
            level: 'N5',
          } 
        },
        { $sample: { size: 3 } } // Should be Math.min(10, 3) = 3
      ]);
      expect(result).toEqual(mockNewWords);
    });

    test('should handle case with no level filter', async () => {
      const mockWordIds = ['word1', 'word2'];
      const mockNewWords = [{ _id: 'word3', kanji: '犬' }];

      UserFlashcardsProgress.distinct.mockResolvedValue(mockWordIds);
      Word.countDocuments.mockResolvedValue(15);
      Word.aggregate.mockResolvedValue(mockNewWords);

      const result = await flashcardsProgressService.getNewWords('user123', null, 8);

      expect(Word.countDocuments).toHaveBeenCalledWith({
        _id: { $nin: mockWordIds },
      });
      
      expect(Word.aggregate).toHaveBeenCalledWith([
        { 
          $match: { 
            _id: { $nin: mockWordIds },
          } 
        },
        { $sample: { size: 8 } } // Math.min(8, 15) = 8
      ]);
      expect(result).toEqual(mockNewWords);
    });
  });

  describe('getStudySession', () => {
    test('should return mixed session with proper ratio', async () => {
      const mockDueCards = [
        { _id: 'progress1', user: 'user123', wordData: { kanji: '猫' } }
      ];
      const mockNewWords = [
        { _id: 'word3', kanji: '犬' },
        { _id: 'word4', kanji: '鳥' }
      ];

      jest.spyOn(flashcardsProgressService, 'getDueCards').mockResolvedValue(mockDueCards);
      jest.spyOn(flashcardsProgressService, 'getNewWords').mockResolvedValue(mockNewWords);

      const result = await flashcardsProgressService.getStudySession('user123', 'N5', 10);

      // Should request 30% due (3) and 70% new (7)
      expect(flashcardsProgressService.getDueCards).toHaveBeenCalledWith('user123', 'N5', 3);
      expect(flashcardsProgressService.getNewWords).toHaveBeenCalledWith('user123', 'N5', 7);

      // Should return combined results
      expect(result).toHaveLength(3); // 1 due + 2 new
      
      // Check structure of new cards
      const newCards = result.filter(card => card.isNew);
      expect(newCards).toHaveLength(2);
      expect(newCards[0]).toMatchObject({
        _id: null,
        user: 'user123',
        srsLevel: 0,
        successCount: 0,
        failureCount: 0,
        isNew: true
      });
    });
  });
});