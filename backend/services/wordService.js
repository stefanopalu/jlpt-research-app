const Word = require('../models/word');

const getAllWords = async (level) => {
  const filter = {};
  if (level) filter.level = level;
  const words = await Word.find(filter);
  return words.map(word => ({
    ...word.toObject(),
    id: word._id.toString(),
  }));
};

const findWords = async (searchParams) => {
  const { kanji, hiragana, english } = searchParams;
  
  if (!kanji && !hiragana && !english) {
    throw new Error('Must provide kanji, hiragana, or english search term');
  }
  
  const filter = {};
  if (kanji) filter.kanji = kanji;
  if (hiragana) filter.hiragana = hiragana;
  if (english) filter.english = { $regex: english, $options: 'i' };
  
  return await Word.find(filter);
};

const updateWord = async (id, updateFields) => {
  const updatedWord = await Word.findByIdAndUpdate(
    id, 
    updateFields, 
    { new: true, runValidators: true },
  );
  
  if (!updatedWord) {
    throw new Error('Word not found');
  }
  
  return {
    ...updatedWord.toObject(),
    id: updatedWord._id.toString(),
  };
};

const deleteWord = async (id) => {
  const deletedWord = await Word.findByIdAndDelete(id);
  
  if (!deletedWord) {
    throw new Error('Word not found');
  }
  
  return true;
};

module.exports = { 
  getAllWords,
  findWords,
  updateWord,
  deleteWord,
};