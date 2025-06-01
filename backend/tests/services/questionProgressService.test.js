const questionProgressService = require('../../services/questionProgressService');

jest.mock('../../models/userQuestionProgress');
const UserQuestionProgress = require('../../models/userQuestionProgress');

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
      };
      UserQuestionProgress.findOne.mockResolvedValue(mockProgress);

      const userId = 'user123';
      const questionId = 'question123';
      const isCorrect = false;

      await questionProgressService.updateProgress(userId, questionId, isCorrect);

      expect(UserQuestionProgress.findOne).toHaveBeenCalledWith({
        user: userId,
        question: questionId,
      });
      expect(mockProgress.updateProgress).toHaveBeenCalledWith(isCorrect);
      expect(mockProgress.save).toHaveBeenCalled();
    });

    test('should create new progress when none exists', async () => {
      UserQuestionProgress.findOne.mockResolvedValue(null);

      const mockProgress = {
        updateProgress: jest.fn(),
        save: jest.fn(),
      };
      UserQuestionProgress.mockImplementation(() => mockProgress);

      await questionProgressService.updateProgress('user123', 'question123', true);

      expect(UserQuestionProgress).toHaveBeenCalledWith({
        user: 'user123',
        question: 'question123',
      });
      expect(mockProgress.updateProgress).toHaveBeenCalledWith(true);
      expect(mockProgress.save).toHaveBeenCalled();
    });
  });
});