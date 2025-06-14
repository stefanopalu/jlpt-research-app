const grammarPointService = require('../../services/grammarPointService');

// Mock the dependencies
jest.mock('../../models/grammarPoint');

const GrammarPoint = require('../../models/grammarPoint');

describe('grammarPointService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllGrammarPoints', () => {
    test('should return all grammar points with id field', async () => {
      const mockGrammarPoints = [
        {
          _id: 'gp1',
          title: 'Present Tense',
          name: 'present_tense',
          explanation: 'Basic present tense',
          grammarStructure: {
            formation: ['verb stem + る'],
            declinations: ['positive', 'negative']
          },
          grammarExamples: [
            { japanese: '食べる', english: 'to eat' }
          ],
          toObject: jest.fn().mockReturnValue({
            _id: 'gp1',
            title: 'Present Tense',
            name: 'present_tense',
            explanation: 'Basic present tense',
            grammarStructure: {
              formation: ['verb stem + る'],
              declinations: ['positive', 'negative']
            },
            grammarExamples: [
              { japanese: '食べる', english: 'to eat' }
            ]
          })
        },
        {
          _id: 'gp2',
          title: 'Past Tense',
          name: 'past_tense',
          explanation: 'Basic past tense',
          grammarStructure: {
            formation: ['verb stem + た'],
            declinations: ['positive', 'negative']
          },
          grammarExamples: [
            { japanese: '食べた', english: 'ate' }
          ],
          toObject: jest.fn().mockReturnValue({
            _id: 'gp2',
            title: 'Past Tense',
            name: 'past_tense',
            explanation: 'Basic past tense',
            grammarStructure: {
              formation: ['verb stem + た'],
              declinations: ['positive', 'negative']
            },
            grammarExamples: [
              { japanese: '食べた', english: 'ate' }
            ]
          })
        }
      ];

      GrammarPoint.find.mockResolvedValue(mockGrammarPoints);

      const result = await grammarPointService.getAllGrammarPoints();

      expect(GrammarPoint.find).toHaveBeenCalledWith({});
      expect(result).toEqual([
        {
          _id: 'gp1',
          id: 'gp1',
          title: 'Present Tense',
          name: 'present_tense',
          explanation: 'Basic present tense',
          grammarStructure: {
            formation: ['verb stem + る'],
            declinations: ['positive', 'negative']
          },
          grammarExamples: [
            { japanese: '食べる', english: 'to eat' }
          ]
        },
        {
          _id: 'gp2',
          id: 'gp2',
          title: 'Past Tense',
          name: 'past_tense',
          explanation: 'Basic past tense',
          grammarStructure: {
            formation: ['verb stem + た'],
            declinations: ['positive', 'negative']
          },
          grammarExamples: [
            { japanese: '食べた', english: 'ate' }
          ]
        }
      ]);
    });

    test('should return empty array when no grammar points exist', async () => {
      GrammarPoint.find.mockResolvedValue([]);

      const result = await grammarPointService.getAllGrammarPoints();

      expect(result).toEqual([]);
    });
  });

  describe('findGrammarPoints', () => {
    test('should find grammar points by name', async () => {
      const mockGrammarPoints = [
        {
          _id: 'gp1',
          name: 'present_tense',
          title: 'Present Tense'
        }
      ];

      GrammarPoint.find.mockResolvedValue(mockGrammarPoints);

      const result = await grammarPointService.findGrammarPoints({ name: 'present_tense' });

      expect(GrammarPoint.find).toHaveBeenCalledWith({ name: 'present_tense' });
      expect(result).toEqual(mockGrammarPoints);
    });

    test('should find grammar points by title with regex', async () => {
      const mockGrammarPoints = [
        {
          _id: 'gp1',
          name: 'present_tense',
          title: 'Present Tense'
        }
      ];

      GrammarPoint.find.mockResolvedValue(mockGrammarPoints);

      const result = await grammarPointService.findGrammarPoints({ title: 'present' });

      expect(GrammarPoint.find).toHaveBeenCalledWith({ 
        title: { $regex: 'present', $options: 'i' } 
      });
      expect(result).toEqual(mockGrammarPoints);
    });

    test('should find grammar points by both name and title', async () => {
      const mockGrammarPoints = [
        {
          _id: 'gp1',
          name: 'present_tense',
          title: 'Present Tense'
        }
      ];

      GrammarPoint.find.mockResolvedValue(mockGrammarPoints);

      const result = await grammarPointService.findGrammarPoints({ 
        name: 'present_tense',
        title: 'present'
      });

      expect(GrammarPoint.find).toHaveBeenCalledWith({ 
        name: 'present_tense',
        title: { $regex: 'present', $options: 'i' }
      });
      expect(result).toEqual(mockGrammarPoints);
    });

    test('should throw error when no search parameters provided', async () => {
      await expect(
        grammarPointService.findGrammarPoints({})
      ).rejects.toThrow('Must provide name or title');

      expect(GrammarPoint.find).not.toHaveBeenCalled();
    });

    test('should throw error when search parameters are null/undefined', async () => {
      await expect(
        grammarPointService.findGrammarPoints({ name: null, title: undefined })
      ).rejects.toThrow('Must provide name or title');

      expect(GrammarPoint.find).not.toHaveBeenCalled();
    });
  });

  describe('updateGrammarPoint', () => {
    test('should update grammar point successfully', async () => {
      const mockUpdatedGrammarPoint = {
        _id: 'gp1',
        title: 'Updated Present Tense',
        name: 'present_tense',
        explanation: 'Updated explanation',
        grammarStructure: {
          formation: ['updated formation'],
          declinations: ['positive']
        },
        grammarExamples: [
          { japanese: '食べる', english: 'to eat (updated)' }
        ],
        toObject: jest.fn().mockReturnValue({
          _id: 'gp1',
          title: 'Updated Present Tense',
          name: 'present_tense',
          explanation: 'Updated explanation',
          grammarStructure: {
            formation: ['updated formation'],
            declinations: ['positive']
          },
          grammarExamples: [
            { japanese: '食べる', english: 'to eat (updated)' }
          ]
        })
      };

      GrammarPoint.findByIdAndUpdate.mockResolvedValue(mockUpdatedGrammarPoint);

      const updateData = {
        title: 'Updated Present Tense',
        explanation: 'Updated explanation'
      };

      const result = await grammarPointService.updateGrammarPoint('gp1', updateData);

      expect(GrammarPoint.findByIdAndUpdate).toHaveBeenCalledWith(
        'gp1',
        updateData,
        { new: true, runValidators: true }
      );

      expect(result).toEqual({
        _id: 'gp1',
        id: 'gp1',
        title: 'Updated Present Tense',
        name: 'present_tense',
        explanation: 'Updated explanation',
        grammarStructure: {
          formation: ['updated formation'],
          declinations: ['positive']
        },
        grammarExamples: [
          { japanese: '食べる', english: 'to eat (updated)' }
        ]
      });
    });

    test('should update grammar structure', async () => {
      const mockUpdatedGrammarPoint = {
        _id: 'gp1',
        title: 'Present Tense',
        name: 'present_tense',
        grammarStructure: {
          formation: ['new formation rule'],
          declinations: ['positive', 'negative', 'polite']
        },
        toObject: jest.fn().mockReturnValue({
          _id: 'gp1',
          title: 'Present Tense',
          name: 'present_tense',
          grammarStructure: {
            formation: ['new formation rule'],
            declinations: ['positive', 'negative', 'polite']
          }
        })
      };

      GrammarPoint.findByIdAndUpdate.mockResolvedValue(mockUpdatedGrammarPoint);

      const updateData = {
        grammarStructure: {
          formation: ['new formation rule'],
          declinations: ['positive', 'negative', 'polite']
        }
      };

      await grammarPointService.updateGrammarPoint('gp1', updateData);

      expect(GrammarPoint.findByIdAndUpdate).toHaveBeenCalledWith(
        'gp1',
        updateData,
        { new: true, runValidators: true }
      );
    });

    test('should update grammar examples', async () => {
      const mockUpdatedGrammarPoint = {
        _id: 'gp1',
        title: 'Present Tense',
        name: 'present_tense',
        grammarExamples: [
          { japanese: '飲む', english: 'to drink' },
          { japanese: '読む', english: 'to read' }
        ],
        toObject: jest.fn().mockReturnValue({
          _id: 'gp1',
          title: 'Present Tense',
          name: 'present_tense',
          grammarExamples: [
            { japanese: '飲む', english: 'to drink' },
            { japanese: '読む', english: 'to read' }
          ]
        })
      };

      GrammarPoint.findByIdAndUpdate.mockResolvedValue(mockUpdatedGrammarPoint);

      const updateData = {
        grammarExamples: [
          { japanese: '飲む', english: 'to drink' },
          { japanese: '読む', english: 'to read' }
        ]
      };

      await grammarPointService.updateGrammarPoint('gp1', updateData);

      expect(GrammarPoint.findByIdAndUpdate).toHaveBeenCalledWith(
        'gp1',
        updateData,
        { new: true, runValidators: true }
      );
    });

    test('should throw error when grammar point not found', async () => {
      GrammarPoint.findByIdAndUpdate.mockResolvedValue(null);

      await expect(
        grammarPointService.updateGrammarPoint('nonexistent', { title: 'test' })
      ).rejects.toThrow('Grammar point not found');
    });
  });

  describe('deleteGrammarPoint', () => {
    test('should delete grammar point successfully', async () => {
      const mockDeletedGrammarPoint = {
        _id: 'gp1',
        title: 'Present Tense',
        name: 'present_tense'
      };

      GrammarPoint.findByIdAndDelete.mockResolvedValue(mockDeletedGrammarPoint);

      const result = await grammarPointService.deleteGrammarPoint('gp1');

      expect(GrammarPoint.findByIdAndDelete).toHaveBeenCalledWith('gp1');
      expect(result).toBe(true);
    });

    test('should throw error when grammar point not found', async () => {
      GrammarPoint.findByIdAndDelete.mockResolvedValue(null);

      await expect(
        grammarPointService.deleteGrammarPoint('nonexistent')
      ).rejects.toThrow('Grammar point not found');
    });
  });
});