const wordService = require('../../services/wordService');

// Mock the dependencies
jest.mock('../../models/word');

const Word = require('../../models/word');

describe('wordService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllWords', () => {
    test('should return words filtered by level', async () => {
      const mockWords = [
        { 
          _id: 'word1', 
          kanji: '本', 
          hiragana: 'ほん', 
          english: ['book'], 
          level: 'N4',
          toObject: jest.fn().mockReturnValue({
            kanji: '本', 
            hiragana: 'ほん', 
            english: ['book'], 
            level: 'N4'
          })
        }
      ];
      
      Word.find.mockResolvedValue(mockWords);

      const result = await wordService.getAllWords('N4');

      expect(Word.find).toHaveBeenCalledWith({ level: 'N4' });
      expect(result).toEqual([{
        kanji: '本', 
        hiragana: 'ほん', 
        english: ['book'], 
        level: 'N4',
        id: 'word1'
      }]);
    });

    test('should return all words when no level provided', async () => {
      const mockWords = [];
      Word.find.mockResolvedValue(mockWords);

      await wordService.getAllWords();

      expect(Word.find).toHaveBeenCalledWith({});
    });
  });

  describe('findWords', () => {
    test('should find words by exact kanji match', async () => {
      const mockWords = [
        { 
          _id: 'word1', 
          kanji: '本', 
          hiragana: 'ほん', 
          english: ['book'],
          toObject: jest.fn().mockReturnValue({
            kanji: '本', 
            hiragana: 'ほん', 
            english: ['book']
          })
        }
      ];
      
      Word.find.mockResolvedValue(mockWords);

      const result = await wordService.findWords({ kanji: '本' });

      expect(Word.find).toHaveBeenCalledWith({ kanji: '本' });
      expect(result).toHaveLength(1);
      expect(result[0].kanji).toBe('本');
    });

    test('should find words by exact hiragana match', async () => {
      const mockWords = [
        { 
          _id: 'word1', 
          kanji: '本', 
          hiragana: 'ほん', 
          english: ['book'],
          toObject: jest.fn().mockReturnValue({
            kanji: '本', 
            hiragana: 'ほん', 
            english: ['book']
          })
        }
      ];
      
      Word.find.mockResolvedValue(mockWords);

      const result = await wordService.findWords({ hiragana: 'ほん' });

      expect(Word.find).toHaveBeenCalledWith({ hiragana: 'ほん' });
      expect(result).toHaveLength(1);
    });

    test('should find words by partial english match', async () => {
      const mockWords = [
        { 
          _id: 'word1', 
          kanji: '本', 
          hiragana: 'ほん', 
          english: ['book'],
          toObject: jest.fn().mockReturnValue({
            kanji: '本', 
            hiragana: 'ほん', 
            english: ['book']
          })
        }
      ];
      
      Word.find.mockResolvedValue(mockWords);

      const result = await wordService.findWords({ english: 'book' });

      expect(Word.find).toHaveBeenCalledWith({ 
        english: { $regex: 'book', $options: 'i' } 
      });
      expect(result).toHaveLength(1);
    });

    test('should throw error when no search parameters provided', async () => {
      await expect(
        wordService.findWords({})
      ).rejects.toThrow('Must provide kanji, hiragana, or english search term');
    });
  });

  describe('updateWord', () => {
    test('should update word successfully', async () => {
      const mockUpdatedWord = {
        _id: 'word1',
        kanji: '本',
        hiragana: 'ほん',
        english: ['book', 'volume'],
        toObject: jest.fn().mockReturnValue({
          kanji: '本',
          hiragana: 'ほん',
          english: ['book', 'volume']
        })
      };

      Word.findByIdAndUpdate.mockResolvedValue(mockUpdatedWord);

      const updateData = { english: ['book', 'volume'] };
      const result = await wordService.updateWord('word1', updateData);

      expect(Word.findByIdAndUpdate).toHaveBeenCalledWith(
        'word1',
        updateData,
        { new: true, runValidators: true }
      );
      expect(result).toEqual({
        kanji: '本',
        hiragana: 'ほん',
        english: ['book', 'volume'],
        id: 'word1'
      });
    });

    test('should throw error when word not found', async () => {
      Word.findByIdAndUpdate.mockResolvedValue(null);

      await expect(
        wordService.updateWord('nonexistent', { english: ['test'] })
      ).rejects.toThrow('Word not found');
    });
  });
});