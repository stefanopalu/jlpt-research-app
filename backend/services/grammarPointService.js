const GrammarPoint = require('../models/grammarPoint');

const getAllGrammarPoints = async () => {
  const grammarPoints = await GrammarPoint.find({});
  return grammarPoints.map(grammarPoint => ({
    ...grammarPoint.toObject(),
    id: grammarPoint._id.toString(),
  }));
};

const findGrammarPoints = async (searchParams) => {
  const { name, title } = searchParams;
  
  if (!name && !title ) {
    throw new Error('Must provide name or title');
  }
  
  const filter = {};
  if (name) filter.name = name;
  if (title) filter.title = { $regex: title, $options: 'i' };
  
  return await GrammarPoint.find(filter);
};

const updateGrammarPoint = async (id, updateFields) => {
  const updatedGrammarPoint = await GrammarPoint.findByIdAndUpdate(
    id, 
    updateFields, 
    { new: true, runValidators: true },
  );
  
  if (!updatedGrammarPoint) {
    throw new Error('Grammar point not found');
  }
  
  return {
    ...updatedGrammarPoint.toObject(),
    id: updatedGrammarPoint._id.toString(),
  };
};

const deleteGrammarPoint = async (id) => {
  const deletedGrammarPoint = await GrammarPoint.findByIdAndDelete(id);
  
  if (!deletedGrammarPoint) {
    throw new Error('Grammar point not found');
  }
  
  return true;
};

module.exports = {
  getAllGrammarPoints,
  findGrammarPoints,
  updateGrammarPoint,
  deleteGrammarPoint,
};