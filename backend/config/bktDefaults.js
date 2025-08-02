const getBKTDefaultsByLevel = (level) => {
  const defaults = {
    'N5': {
      priorKnowledge: 0.06,
      learningRate: 0.35,
      slipRate: 0.18,
      guessRate: 0.25,
    },
    'N4': {
      priorKnowledge: 0.04,
      learningRate: 0.25,
      slipRate: 0.25,
      guessRate: 0.25,
    },
  };
  
  return defaults[level] || defaults['N5'];
};

module.exports = { getBKTDefaultsByLevel };