const grammarPointProgressService = require('../../services/grammarPointProgressService');

jest.mock('../../models/userGrammarPointProgress');
jest.mock('../../models/grammarPoint');

const UserGrammarPointProgress = require('../../models/userGrammarPointProgress');
const GrammarPoint = require('../../models/grammarPoint');

describe('grammarPointProgressService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateProgress', () => {
    test('should create new progress when none exists', async () => {
      const mockGrammarPoint = { _id: 'grammar123', name: 'past tense' };
      GrammarPoint.findOne.mockResolvedValue(mockGrammarPoint);

      UserGrammarPointProgress.findOne.mockResolvedValue(null);

      const mockProgress = {
        updateProgress: jest.fn(),
        save: jest.fn(),
        populate: jest.fn().mockResolvedValue({})
      };
      UserGrammarPointProgress.mockImplementation(() => mockProgress);

      await grammarPointProgressService.updateProgress('user123', 'past tense', true);

      expect(GrammarPoint.findOne).toHaveBeenCalledWith({ name: 'past tense' });
      expect(UserGrammarPointProgress).toHaveBeenCalledWith({
        user: 'user123',
        grammarPoint: mockGrammarPoint._id
      });
      expect(mockProgress.updateProgress).toHaveBeenCalledWith(true);
      expect(mockProgress.save).toHaveBeenCalled();
      expect(mockProgress.populate).toHaveBeenCalledWith('grammarPoint');
    });

    test('should throw error when grammar point not found', async () => {
      GrammarPoint.findOne.mockResolvedValue(null);

      await expect(
        grammarPointProgressService.updateProgress('user123', 'nonexistent', true)
      ).rejects.toThrow('Grammar point not found with name: nonexistent');
    });
  });
});