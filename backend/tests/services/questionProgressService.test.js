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
        populate: jest.fn().mockResolvedValue({  // ✅ Add populate method
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
      expect(mockProgress.updateProgress).toHaveBeenCalledWith(isCorrect, null); // Note: includes responseTime parameter
      expect(mockProgress.save).toHaveBeenCalled();
      expect(mockProgress.populate).toHaveBeenCalledWith('question'); // ✅ Check populate was called
      expect(result).toBeDefined(); // ✅ Check result is returned
    });

    test('should create new progress when none exists', async () => {
      UserQuestionProgress.findOne.mockResolvedValue(null);

      const mockProgress = {
        updateProgress: jest.fn(),
        save: jest.fn(),
        populate: jest.fn().mockResolvedValue({  // ✅ Add populate method
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
        srsLevel: 0,  // ✅ Include srsLevel that's in your service
      });
      expect(mockProgress.updateProgress).toHaveBeenCalledWith(true, null); // ✅ Include responseTime parameter
      expect(mockProgress.save).toHaveBeenCalled();
      expect(mockProgress.populate).toHaveBeenCalledWith('question'); // ✅ Check populate was called
      expect(result).toBeDefined(); // ✅ Check result is returned
    });

    test('should include responseTime when provided', async () => {
      const mockProgress = {
        updateProgress: jest.fn(),
        save: jest.fn(),
        populate: jest.fn().mockResolvedValue({})
      };
      UserQuestionProgress.findOne.mockResolvedValue(mockProgress);

      await questionProgressService.updateProgress('user123', 'question123', true, 1500);

      expect(mockProgress.updateProgress).toHaveBeenCalledWith(true, 1500); // ✅ Test with responseTime
    });
  });
});