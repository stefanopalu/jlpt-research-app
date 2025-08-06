const grammarPointProgressService = require('../../services/grammarPointProgressService');

// Mock all dependencies
jest.mock('../../models/userGrammarPointProgress');
jest.mock('../../models/grammarPoint');
jest.mock('../../services/bktService');

const UserGrammarPointProgress = require('../../models/userGrammarPointProgress');
const GrammarPoint = require('../../models/grammarPoint');
const bktService = require('../../services/bktService');

describe('grammarPointProgressService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateProgress', () => {
    test('should find grammar point by name and update existing progress', async () => {
      // Mock GrammarPoint.findOne to return a grammar point
      const mockGrammarPoint = {
        _id: 'gp123',
        name: 'particle-ga',
        priorKnowledge: 0.04,
        learningRate: 0.25,
        slipRate: 0.25,
        guessRate: 0.25
      };
      GrammarPoint.findOne.mockResolvedValue(mockGrammarPoint);

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
          grammarPoint: mockGrammarPoint,
          masteryScore: 0.45,
          successCount: 3,
          failureCount: 1
        }),
      };
      UserGrammarPointProgress.findOne.mockResolvedValue(mockProgress);

      // Mock BKT service - IMPORTANT: Mock GrammarPoint.findById for BKT service
      GrammarPoint.findById.mockResolvedValue(mockGrammarPoint);
      bktService.updateGrammarPointMastery = jest.fn().mockResolvedValue();

      const userId = 'user123';
      const grammarPointName = 'particle-ga';
      const isCorrect = true;

      const result = await grammarPointProgressService.updateProgress(userId, grammarPointName, isCorrect);

      // Verify grammar point lookup by name
      expect(GrammarPoint.findOne).toHaveBeenCalledWith({ name: grammarPointName });
      
      // Verify existing progress lookup
      expect(UserGrammarPointProgress.findOne).toHaveBeenCalledWith({
        user: userId,
        grammarPoint: mockGrammarPoint._id,
      });
      
      // Verify progress update
      expect(mockProgress.updateProgress).toHaveBeenCalledWith(isCorrect, null);
      expect(mockProgress.save).toHaveBeenCalled();
      
      // Verify BKT service called
      expect(bktService.updateGrammarPointMastery).toHaveBeenCalledWith(userId, mockGrammarPoint._id, isCorrect);
      
      // Verify populate
      expect(mockProgress.populate).toHaveBeenCalledWith('grammarPoint');
      expect(result).toBeDefined();
    });

    test('should create new progress when none exists', async () => {
      // Mock GrammarPoint.findOne to return a grammar point
      const mockGrammarPoint = {
        _id: 'gp456',
        name: 'particle-wo',
        priorKnowledge: 0.04,
        learningRate: 0.25,
        slipRate: 0.25,
        guessRate: 0.25
      };
      GrammarPoint.findOne.mockResolvedValue(mockGrammarPoint);

      // Mock no existing progress
      UserGrammarPointProgress.findOne.mockResolvedValue(null);

      // Mock new progress creation
      const mockProgress = {
        updateProgress: jest.fn(),
        save: jest.fn(),
        populate: jest.fn().mockResolvedValue({
          _id: 'newprogress123',
          user: 'user123',
          grammarPoint: mockGrammarPoint,
          masteryScore: 0.04,
          successCount: 1,
          failureCount: 0
        }),
      };
      UserGrammarPointProgress.mockImplementation(() => mockProgress);

      // Mock BKT service - IMPORTANT: Mock GrammarPoint.findById for BKT service
      GrammarPoint.findById.mockResolvedValue(mockGrammarPoint);
      bktService.updateGrammarPointMastery = jest.fn().mockResolvedValue();

      const userId = 'user123';
      const grammarPointName = 'particle-wo';
      const isCorrect = true;

      const result = await grammarPointProgressService.updateProgress(userId, grammarPointName, isCorrect);

      // Verify grammar point lookup
      expect(GrammarPoint.findOne).toHaveBeenCalledWith({ name: grammarPointName });
      
      // Verify progress creation with prior knowledge
      expect(UserGrammarPointProgress).toHaveBeenCalledWith({
        user: userId,
        grammarPoint: mockGrammarPoint._id,
        masteryScore: mockGrammarPoint.priorKnowledge,
      });
      
      // Verify progress update
      expect(mockProgress.updateProgress).toHaveBeenCalledWith(isCorrect, null);
      expect(mockProgress.save).toHaveBeenCalled();
      
      // Verify BKT service called
      expect(bktService.updateGrammarPointMastery).toHaveBeenCalledWith(userId, mockGrammarPoint._id, isCorrect);
      
      // Verify populate
      expect(mockProgress.populate).toHaveBeenCalledWith('grammarPoint');
      expect(result).toBeDefined();
    });

    test('should throw error when grammar point not found', async () => {
      GrammarPoint.findOne.mockResolvedValue(null);

      await expect(
        grammarPointProgressService.updateProgress('user123', 'nonexistent-grammar', true)
      ).rejects.toThrow('Grammar point not found with name: nonexistent-grammar');

      // Should not call any other methods if grammar point not found
      expect(UserGrammarPointProgress.findOne).not.toHaveBeenCalled();
      expect(bktService.updateGrammarPointMastery).not.toHaveBeenCalled();
    });

    test('should handle BKT service errors gracefully', async () => {
      // Mock grammar point
      const mockGrammarPoint = {
        _id: 'gp789',
        name: 'particle-ni',
        priorKnowledge: 0.04,
        learningRate: 0.25,
        slipRate: 0.25,
        guessRate: 0.25
      };
      GrammarPoint.findOne.mockResolvedValue(mockGrammarPoint);
      GrammarPoint.findById.mockResolvedValue(mockGrammarPoint);

      // Mock existing progress
      const mockProgress = {
        updateProgress: jest.fn(),
        save: jest.fn(),
        populate: jest.fn().mockResolvedValue({}),
      };
      UserGrammarPointProgress.findOne.mockResolvedValue(mockProgress);

      // Mock BKT service to throw error
      bktService.updateGrammarPointMastery = jest.fn().mockRejectedValue(new Error('BKT calculation failed'));

      await expect(
        grammarPointProgressService.updateProgress('user123', 'particle-ni', true)
      ).rejects.toThrow('BKT calculation failed');

      // Verify that progress was still updated (BKT runs after progress update)
      expect(mockProgress.updateProgress).toHaveBeenCalledWith(true, null);
      expect(mockProgress.save).toHaveBeenCalled();
    });
  });

  describe('getUserProgress', () => {
    test('should return user progress with populated grammar points', async () => {
      const mockProgress = [
        {
          _id: 'progress1',
          user: 'user123',
          grammarPoint: { name: 'particle-ga', title: 'Subject Marker' },
          masteryScore: 0.75,
          successCount: 3,
          failureCount: 1
        }
      ];

      UserGrammarPointProgress.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockProgress)
      });

      const result = await grammarPointProgressService.getUserProgress('user123');

      expect(UserGrammarPointProgress.find).toHaveBeenCalledWith({ user: 'user123' });
      expect(result).toEqual(mockProgress);
    });
  });

  describe('getProblematicGrammarPoints', () => {
    test('should return grammar points with more failures than successes', async () => {
      const mockAggregateResult = [
        {
          _id: 'gp1',
          title: 'Particle Ga',
          name: 'particle-ga',
          explanation: 'Subject marker',
          grammarStructure: { formation: ['Noun + が'] },
          grammarExamples: [{ japanese: '私が', english: 'I (subject)' }]
        }
      ];

      GrammarPoint.aggregate.mockResolvedValue(mockAggregateResult);

      // Use a valid ObjectId format for testing
      const validUserId = '507f1f77bcf86cd799439011';
      const result = await grammarPointProgressService.getProblematicGrammarPoints(validUserId);

      expect(GrammarPoint.aggregate).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('gp1');
      expect(result[0].name).toBe('particle-ga');
    });

    test('should handle invalid user ID gracefully', async () => {
      // Test with invalid user ID should throw error
      await expect(
        grammarPointProgressService.getProblematicGrammarPoints('invalid-user-id')
      ).rejects.toThrow('input must be a 24 character hex string');
    });
  });
});