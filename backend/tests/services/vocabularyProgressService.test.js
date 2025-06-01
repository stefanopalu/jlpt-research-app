const vocabularyProgressService = require('../../services/vocabularyProgressService');

jest.mock('../../models/userVocabularyProgress');
jest.mock('../../models/word');

const UserVocabularyProgress = require('../../models/userVocabularyProgress');
const Word = require('../../models/word');

describe('vocabularyProgressService', () => {
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
      UserVocabularyProgress.findOne.mockResolvedValue(mockProgress);

      await vocabularyProgressService.updateProgress('user123', 'word123', true);

      expect(UserVocabularyProgress.findOne).toHaveBeenCalledWith({
        user: 'user123',
        word: 'word123',
      });
      expect(mockProgress.updateProgress).toHaveBeenCalledWith(true);
      expect(mockProgress.save).toHaveBeenCalled();
      expect(mockProgress.populate).toHaveBeenCalledWith('word');
    });

    test('should create new progress when none exists', async () => {
      UserVocabularyProgress.findOne.mockResolvedValue(null);

      const mockProgress = {
        updateProgress: jest.fn(),
        save: jest.fn(),
        populate: jest.fn().mockResolvedValue({}),
      };
      UserVocabularyProgress.mockImplementation(() => mockProgress);

      await vocabularyProgressService.updateProgress('user123', 'word123', false);

      expect(UserVocabularyProgress).toHaveBeenCalledWith({
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
      UserVocabularyProgress.aggregate.mockResolvedValue(mockDueCards);

      const result = await vocabularyProgressService.getDueCards('user123', 'N5', 10);

      expect(UserVocabularyProgress.aggregate).toHaveBeenCalledWith([
        { $match: { user: 'user123', nextReview: { $lte: expect.any(Date) } } },
        { $lookup: { from: 'words', localField: 'word', foreignField: '_id', as: 'wordData' } },
        { $unwind: '$wordData' },
        { $match: { 'wordData.level': 'N5' } },
        { $limit: 10 },
      ]);
      expect(result).toEqual(mockDueCards);
    });
  });

  describe('getNewWords', () => {
    test('should return words not in user progress', async () => {
      const mockWordIds = ['word1', 'word2'];
      const mockNewWords = [{ _id: 'word3', kanji: '犬' }];

      UserVocabularyProgress.distinct.mockResolvedValue(mockWordIds);
      Word.find.mockReturnValue({
        limit: jest.fn().mockResolvedValue(mockNewWords),
      });

      const result = await vocabularyProgressService.getNewWords('user123', 'N5', 5);

      expect(UserVocabularyProgress.distinct).toHaveBeenCalledWith('word', { user: 'user123' });
      expect(Word.find).toHaveBeenCalledWith({
        _id: { $nin: mockWordIds },
        level: 'N5',
      });
      expect(result).toEqual(mockNewWords);
    });
  });
});