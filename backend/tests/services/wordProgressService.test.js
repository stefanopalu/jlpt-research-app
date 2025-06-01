const wordProgressService = require('../../services/wordProgressService');

// Mock the dependencies
jest.mock('../../models/userWordProgress');
jest.mock('../../models/word');

const UserWordProgress = require('../../models/userWordProgress');
const Word = require('../../models/word');

describe('wordProgressService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateProgress', () => {
    test('should create new progress when none exists', async () => {
      // Mock Word.findOne to return a word
      const mockWord = { _id: 'word123', kanji: '猫' };
      Word.findOne.mockResolvedValue(mockWord);

      // Mock UserWordProgress.findOne to return null (no existing progress)
      UserWordProgress.findOne.mockResolvedValue(null);

      // Mock UserWordProgress constructor and methods
      const mockProgress = {
        updateProgress: jest.fn(),
        save: jest.fn(),
        populate: jest.fn().mockResolvedValue({}),
      };
      UserWordProgress.mockImplementation(() => mockProgress);

      const userId = 'user123';
      const wordKanji = '猫';
      const isCorrect = true;

      await wordProgressService.updateProgress(userId, wordKanji, isCorrect);

      // Verify word lookup
      expect(Word.findOne).toHaveBeenCalledWith({ kanji: wordKanji });
      
      // Verify progress creation
      expect(UserWordProgress).toHaveBeenCalledWith({
        user: userId,
        word: mockWord._id,
      });
      
      // Verify progress update
      expect(mockProgress.updateProgress).toHaveBeenCalledWith(isCorrect);
      expect(mockProgress.save).toHaveBeenCalled();
      expect(mockProgress.populate).toHaveBeenCalledWith('word');
    });

    test('should throw error when word not found', async () => {
      Word.findOne.mockResolvedValue(null);

      await expect(
        wordProgressService.updateProgress('user123', '存在しない', true),
      ).rejects.toThrow('Word not found with kanji: 存在しない');
    });
  });
});