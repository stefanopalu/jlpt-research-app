const grammarPointProgressService = require('../../services/grammarPointProgressService');

// Mock the dependencies
jest.mock('../../models/grammarPoint');
jest.mock('../../models/userGrammarPointProgress');

const GrammarPoint = require('../../models/grammarPoint');
const UserGrammarPointProgress = require('../../models/userGrammarPointProgress');

describe('grammarPointProgressService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateProgress', () => {
    test('should find grammar point by name and update existing progress', async () => {
      const mockGrammarPoint = {
        _id: 'gp123',
        name: 'particle_について',
        title: 'について particle'
      };

      const mockProgress = {
        _id: 'progress123',
        user: 'user123',
        grammarPoint: 'gp123',
        successCount: 2,
        failureCount: 1,
        updateProgress: jest.fn(),
        save: jest.fn(),
        populate: jest.fn().mockResolvedValue({
          _id: 'progress123',
          user: 'user123',
          grammarPoint: mockGrammarPoint,
          successCount: 3,
          failureCount: 1,
          lastReviewed: new Date()
        })
      };

      GrammarPoint.findOne.mockResolvedValue(mockGrammarPoint);
      UserGrammarPointProgress.findOne.mockResolvedValue(mockProgress);

      const result = await grammarPointProgressService.updateProgress('user123', 'particle_について', true);

      // Verify grammar point lookup
      expect(GrammarPoint.findOne).toHaveBeenCalledWith({ name: 'particle_について' });

      // Verify progress lookup
      expect(UserGrammarPointProgress.findOne).toHaveBeenCalledWith({
        user: 'user123',
        grammarPoint: 'gp123'
      });

      // Verify progress update
      expect(mockProgress.updateProgress).toHaveBeenCalledWith(true);
      expect(mockProgress.save).toHaveBeenCalled();
      expect(mockProgress.populate).toHaveBeenCalledWith('grammarPoint');

      expect(result).toBeDefined();
    });

    test('should create new progress when none exists', async () => {
      const mockGrammarPoint = {
        _id: 'gp456',
        name: 'teform_givereceive',
        title: 'Te-form give/receive'
      };

      const mockNewProgress = {
        _id: 'newprogress456',
        user: 'user123',
        grammarPoint: 'gp456',
        successCount: 0,
        failureCount: 0,
        updateProgress: jest.fn(),
        save: jest.fn(),
        populate: jest.fn().mockResolvedValue({
          _id: 'newprogress456',
          user: 'user123',
          grammarPoint: mockGrammarPoint,
          successCount: 1,
          failureCount: 0,
          lastReviewed: new Date()
        })
      };

      GrammarPoint.findOne.mockResolvedValue(mockGrammarPoint);
      UserGrammarPointProgress.findOne.mockResolvedValue(null); // No existing progress
      UserGrammarPointProgress.mockImplementation(() => mockNewProgress);

      const result = await grammarPointProgressService.updateProgress('user123', 'teform_givereceive', true);

      // Verify grammar point lookup
      expect(GrammarPoint.findOne).toHaveBeenCalledWith({ name: 'teform_givereceive' });

      // Verify progress lookup
      expect(UserGrammarPointProgress.findOne).toHaveBeenCalledWith({
        user: 'user123',
        grammarPoint: 'gp456'
      });

      // Verify new progress creation
      expect(UserGrammarPointProgress).toHaveBeenCalledWith({
        user: 'user123',
        grammarPoint: 'gp456'
      });

      // Verify progress update
      expect(mockNewProgress.updateProgress).toHaveBeenCalledWith(true);
      expect(mockNewProgress.save).toHaveBeenCalled();
      expect(mockNewProgress.populate).toHaveBeenCalledWith('grammarPoint');

      expect(result).toBeDefined();
    });

    test('should handle incorrect answers', async () => {
      const mockGrammarPoint = {
        _id: 'gp789',
        name: 'conjunction_usage',
        title: 'Conjunction Usage'
      };

      const mockProgress = {
        _id: 'progress789',
        user: 'user123',
        grammarPoint: 'gp789',
        successCount: 1,
        failureCount: 0,
        updateProgress: jest.fn(),
        save: jest.fn(),
        populate: jest.fn().mockResolvedValue({
          _id: 'progress789',
          user: 'user123',
          grammarPoint: mockGrammarPoint,
          successCount: 1,
          failureCount: 1,
          lastReviewed: new Date()
        })
      };

      GrammarPoint.findOne.mockResolvedValue(mockGrammarPoint);
      UserGrammarPointProgress.findOne.mockResolvedValue(mockProgress);

      const result = await grammarPointProgressService.updateProgress('user123', 'conjunction_usage', false);

      expect(mockProgress.updateProgress).toHaveBeenCalledWith(false);
      expect(result).toBeDefined();
    });

    test('should throw error when grammar point not found', async () => {
      GrammarPoint.findOne.mockResolvedValue(null);

      await expect(
        grammarPointProgressService.updateProgress('user123', 'nonexistent_grammar', true)
      ).rejects.toThrow('Grammar point not found with name: nonexistent_grammar');

      // Should not attempt to update progress if grammar point doesn't exist
      expect(UserGrammarPointProgress.findOne).not.toHaveBeenCalled();
    });

    test('should handle database errors gracefully', async () => {
      GrammarPoint.findOne.mockRejectedValue(new Error('Database connection failed'));

      await expect(
        grammarPointProgressService.updateProgress('user123', 'particle_について', true)
      ).rejects.toThrow('Database connection failed');
    });

    test('should handle progress save errors', async () => {
      const mockGrammarPoint = {
        _id: 'gp123',
        name: 'particle_について'
      };

      const mockProgress = {
        updateProgress: jest.fn(),
        save: jest.fn().mockRejectedValue(new Error('Save failed')),
        populate: jest.fn()
      };

      GrammarPoint.findOne.mockResolvedValue(mockGrammarPoint);
      UserGrammarPointProgress.findOne.mockResolvedValue(mockProgress);

      await expect(
        grammarPointProgressService.updateProgress('user123', 'particle_について', true)
      ).rejects.toThrow('Save failed');
    });

    test('should handle special characters in grammar point names', async () => {
      const mockGrammarPoint = {
        _id: 'gp999',
        name: 'particle_に/で',
        title: 'に/で particles'
      };

      const mockProgress = {
        updateProgress: jest.fn(),
        save: jest.fn(),
        populate: jest.fn().mockResolvedValue({})
      };

      GrammarPoint.findOne.mockResolvedValue(mockGrammarPoint);
      UserGrammarPointProgress.findOne.mockResolvedValue(mockProgress);

      await grammarPointProgressService.updateProgress('user123', 'particle_に/で', true);

      expect(GrammarPoint.findOne).toHaveBeenCalledWith({ name: 'particle_に/で' });
    });

    test('should handle null user ID by passing to database', async () => {
      const mockGrammarPoint = {
        _id: 'gp123',
        name: 'particle_について'
      };

      const mockProgress = {
        updateProgress: jest.fn(),
        save: jest.fn(),
        populate: jest.fn().mockResolvedValue({})
      };

      GrammarPoint.findOne.mockResolvedValue(mockGrammarPoint);
      UserGrammarPointProgress.findOne.mockResolvedValue(mockProgress);

      // The service doesn't validate user ID - it passes it through to the database
      const result = await grammarPointProgressService.updateProgress(null, 'particle_について', true);

      expect(UserGrammarPointProgress.findOne).toHaveBeenCalledWith({
        user: null,
        grammarPoint: 'gp123'
      });

      expect(result).toBeDefined();
    });

    test('should log grammar point ObjectId for debugging', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const mockGrammarPoint = {
        _id: 'gp123',
        name: 'particle_について'
      };

      const mockProgress = {
        updateProgress: jest.fn(),
        save: jest.fn(),
        populate: jest.fn().mockResolvedValue({})
      };

      GrammarPoint.findOne.mockResolvedValue(mockGrammarPoint);
      UserGrammarPointProgress.findOne.mockResolvedValue(mockProgress);

      await grammarPointProgressService.updateProgress('user123', 'particle_について', true);

      expect(consoleSpy).toHaveBeenCalledWith('GrammarPoint ObjectId:', 'gp123');
      
      consoleSpy.mockRestore();
    });

    test('should handle multiple rapid updates for same grammar point', async () => {
      const mockGrammarPoint = {
        _id: 'gp123',
        name: 'particle_について'
      };

      const mockProgress = {
        updateProgress: jest.fn(),
        save: jest.fn(),
        populate: jest.fn().mockResolvedValue({})
      };

      GrammarPoint.findOne.mockResolvedValue(mockGrammarPoint);
      UserGrammarPointProgress.findOne.mockResolvedValue(mockProgress);

      // Simulate rapid updates
      const promises = [
        grammarPointProgressService.updateProgress('user123', 'particle_について', true),
        grammarPointProgressService.updateProgress('user123', 'particle_について', false),
        grammarPointProgressService.updateProgress('user123', 'particle_について', true)
      ];

      await Promise.all(promises);

      expect(mockProgress.updateProgress).toHaveBeenCalledTimes(3);
      expect(mockProgress.save).toHaveBeenCalledTimes(3);
    });
  });
});