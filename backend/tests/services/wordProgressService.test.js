const wordProgressService = require('../../services/wordProgressService');

// Mock the dependencies
jest.mock('../../models/userWordProgress');
jest.mock('../../models/word');
jest.mock('../../services/bktService'); // Add BKT service mock

const UserWordProgress = require('../../models/userWordProgress');
const Word = require('../../models/word');
const bktService = require('../../services/bktService');

describe('wordProgressService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateProgress', () => {
    test('should create new progress when none exists with BKT integration', async () => {
      // Mock Word.findOne to return a word with BKT parameters
      const mockWord = { 
        _id: 'word123', 
        kanji: '猫',
        priorKnowledge: 0.06,
        learningRate: 0.35,
        slipRate: 0.18,
        guessRate: 0.25
      };
      Word.findOne.mockResolvedValue(mockWord);

      // Mock UserWordProgress.findOne to return null (no existing progress)
      UserWordProgress.findOne.mockResolvedValue(null);

      // Mock UserWordProgress constructor and methods
      const mockProgress = {
        updateProgress: jest.fn(),
        save: jest.fn(),
        populate: jest.fn().mockResolvedValue({
          _id: 'progress123',
          user: 'user123',
          word: mockWord,
          masteryScore: 0.06,
          successCount: 1,
          failureCount: 0
        }),
      };
      UserWordProgress.mockImplementation(() => mockProgress);

      // Mock BKT service
      bktService.updateWordMastery = jest.fn().mockResolvedValue();

      const userId = 'user123';
      const wordKanji = '猫';
      const isCorrect = true;

      const result = await wordProgressService.updateProgress(userId, wordKanji, isCorrect);

      // Verify word lookup
      expect(Word.findOne).toHaveBeenCalledWith({ kanji: wordKanji });
      
      // Verify progress creation with prior knowledge as mastery score
      expect(UserWordProgress).toHaveBeenCalledWith({
        user: userId,
        word: mockWord._id,
        masteryScore: mockWord.priorKnowledge, // Should use prior knowledge
      });
      
      // Verify progress update
      expect(mockProgress.updateProgress).toHaveBeenCalledWith(isCorrect);
      expect(mockProgress.save).toHaveBeenCalled();
      
      // Verify BKT service called
      expect(bktService.updateWordMastery).toHaveBeenCalledWith(userId, mockWord._id, isCorrect);
      
      // Verify populate
      expect(mockProgress.populate).toHaveBeenCalledWith('word');
      expect(result).toBeDefined();
    });

    test('should update existing progress with BKT integration', async () => {
      // Mock Word.findOne to return a word with BKT parameters
      const mockWord = { 
        _id: 'word123', 
        kanji: '猫',
        priorKnowledge: 0.06,
        learningRate: 0.35,
        slipRate: 0.18,
        guessRate: 0.25
      };
      Word.findOne.mockResolvedValue(mockWord);

      // Mock existing progress
      const mockProgress = {
        masteryScore: 0.45,
        successCount: 2,
        failureCount: 1,
        updateProgress: jest.fn(),
        save: jest.fn(),
        populate: jest.fn().mockResolvedValue({
          _id: 'progress123',
          user: 'user123',
          word: mockWord,
          masteryScore: 0.45,
          successCount: 3,
          failureCount: 1
        }),
      };
      UserWordProgress.findOne.mockResolvedValue(mockProgress);

      // Mock BKT service
      bktService.updateWordMastery = jest.fn().mockResolvedValue();

      const userId = 'user123';
      const wordKanji = '猫';
      const isCorrect = true;

      const result = await wordProgressService.updateProgress(userId, wordKanji, isCorrect);

      // Verify word lookup
      expect(Word.findOne).toHaveBeenCalledWith({ kanji: wordKanji });
      
      // Verify existing progress lookup
      expect(UserWordProgress.findOne).toHaveBeenCalledWith({
        user: userId,
        word: mockWord._id,
      });
      
      // Verify progress update (should NOT create new progress)
      expect(UserWordProgress).not.toHaveBeenCalled();
      expect(mockProgress.updateProgress).toHaveBeenCalledWith(isCorrect);
      expect(mockProgress.save).toHaveBeenCalled();
      
      // Verify BKT service called
      expect(bktService.updateWordMastery).toHaveBeenCalledWith(userId, mockWord._id, isCorrect);
      
      // Verify populate
      expect(mockProgress.populate).toHaveBeenCalledWith('word');
      expect(result).toBeDefined();
    });

    test('should throw error when word not found', async () => {
      Word.findOne.mockResolvedValue(null);

      await expect(
        wordProgressService.updateProgress('user123', '存在しない', true),
      ).rejects.toThrow('Word not found with kanji: 存在しない');

      // Should not call any other methods if word not found
      expect(UserWordProgress.findOne).not.toHaveBeenCalled();
      expect(bktService.updateWordMastery).not.toHaveBeenCalled();
    });

    test('should handle BKT service errors gracefully', async () => {
      // Mock Word.findOne to return a word
      const mockWord = { 
        _id: 'word123', 
        kanji: '猫',
        priorKnowledge: 0.06,
        learningRate: 0.35,
        slipRate: 0.18,
        guessRate: 0.25
      };
      Word.findOne.mockResolvedValue(mockWord);

      // Mock existing progress
      const mockProgress = {
        updateProgress: jest.fn(),
        save: jest.fn(),
        populate: jest.fn().mockResolvedValue({}),
      };
      UserWordProgress.findOne.mockResolvedValue(mockProgress);

      // Mock BKT service to throw error
      bktService.updateWordMastery = jest.fn().mockRejectedValue(new Error('BKT calculation failed'));

      await expect(
        wordProgressService.updateProgress('user123', '猫', true)
      ).rejects.toThrow('BKT calculation failed');

      // Verify that progress was still updated (BKT runs after progress update)
      expect(mockProgress.updateProgress).toHaveBeenCalledWith(true);
      expect(mockProgress.save).toHaveBeenCalled();
    });

    test('should use correct prior knowledge for different word levels', async () => {
      // Mock N4 word (should have priorKnowledge: 0.04)
      const mockN4Word = { 
        _id: 'word123', 
        kanji: '体',
        level: 'N4',
        priorKnowledge: 0.04,
        learningRate: 0.25,
        slipRate: 0.25,
        guessRate: 0.25
      };
      Word.findOne.mockResolvedValue(mockN4Word);
      UserWordProgress.findOne.mockResolvedValue(null);

      const mockProgress = {
        updateProgress: jest.fn(),
        save: jest.fn(),
        populate: jest.fn().mockResolvedValue({}),
      };
      UserWordProgress.mockImplementation(() => mockProgress);
      bktService.updateWordMastery = jest.fn().mockResolvedValue();

      await wordProgressService.updateProgress('user123', '体', true);

      // Verify N4 prior knowledge used
      expect(UserWordProgress).toHaveBeenCalledWith({
        user: 'user123',
        word: mockN4Word._id,
        masteryScore: 0.04, // N4 prior knowledge
      });
    });
  });

  describe('getUserProgress', () => {
    test('should return user progress with populated words', async () => {
      const mockProgress = [
        {
          _id: 'progress1',
          user: 'user123',
          word: { kanji: '猫', english: ['cat'] },
          masteryScore: 0.75,
          successCount: 3,
          failureCount: 1
        }
      ];

      UserWordProgress.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockProgress)
      });

      const result = await wordProgressService.getUserProgress('user123');

      expect(UserWordProgress.find).toHaveBeenCalledWith({ user: 'user123' });
      expect(result).toEqual(mockProgress);
    });
  });
});