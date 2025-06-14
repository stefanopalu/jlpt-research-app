const Question = require('../models/question');

const getAllQuestions = async (level, type) => {
  const filter = { level, type };

  const questions = await Question.find(filter);
  
  return questions.map(q => ({
    ...q.toObject(),
    id: q._id.toString(),
  }));
};

const findQuestions = async (searchParams) => {
  const { level, type, word, grammarPoint, questionText } = searchParams;
  
  if (!level && !type && !word && !grammarPoint && !questionText) {
    throw new Error('Must provide at least one search parameter');
  }
  
  const filter = {};
  if (level) filter.level = level;
  if (type) filter.type = type;
  // Find questions that include this word
  if (word) filter.words = { $in: [word] };  
  // Find questions that include this grammar point
  if (grammarPoint) filter.grammarPoints = { $in: [grammarPoint] };  
  // Partial match of questionText
  if (questionText) filter.questionText = { $regex: questionText, $options: 'i' };  
  
  const questions = await Question.find(filter);
  
  return questions.map(q => ({
    ...q.toObject(),
    id: q._id.toString(),
  }));
};

const updateQuestion = async (id, updateFields) => {
  const updatedQuestion = await Question.findByIdAndUpdate(
    id, 
    updateFields, 
    { new: true, runValidators: true },
  );
  
  if (!updatedQuestion) {
    throw new Error('Question not found');
  }
  
  return {
    ...updatedQuestion.toObject(),
    id: updatedQuestion._id.toString(),
  };
};

const deleteQuestion = async (id) => {
  const deletedQuestion = await Question.findByIdAndDelete(id);
  
  if (!deletedQuestion) {
    throw new Error('Question not found');
  }
  
  return true;
};

module.exports = { 
  getAllQuestions,
  findQuestions,
  updateQuestion,
  deleteQuestion,
};