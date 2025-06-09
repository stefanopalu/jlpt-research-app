const Question = require('../models/question');

const getAllQuestions = async (level, type) => {
  const filter = { level, type };

  const questions = await Question.find(filter);
  
  // For each question call the method to get the populated data 
  const populatedQuestions = await Promise.all(
    questions.map(q => q.populateByNames()),
  );
  
  // directly return populatedQuestions (plain objects with the needed data about words and grammar points)
  return populatedQuestions; 
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
  
  // Populate the questions
  const populatedQuestions = await Promise.all(
    questions.map(q => q.populateByNames()),
  );
  
  return populatedQuestions;
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
  
  // Return populated question (like other question queries)
  return await updatedQuestion.populateByNames();
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