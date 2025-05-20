const Word = require('../models/word');

const getAllWords = async () => {
  return await Word.find();
};

module.exports = { getAllWords };