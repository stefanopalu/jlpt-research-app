import Markdown from 'react-native-markdown-display';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import theme from '../../../theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  questionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  questionText: {
    fontSize: 26,
    color: 'white',
    textAlign: 'left',
    lineHeight: 32,
  },
  answersContainer: {
    padding: 10,
    gap: 10,
    paddingBottom: 20,
  },
  answerButton: {
    backgroundColor: 'white',
    padding: 12,
    margin: 5,
    marginHorizontal: 10,
    borderRadius: 10,
    borderColor: '#ccc',
  },
  answerButtonCorrect: {
    backgroundColor: theme.colors.success,
  },
  answerButtonIncorrect: {
    backgroundColor: theme.colors.error,
  },
  answerText: {
    fontSize: 24,
    textAlign: 'center',
    color: '#333',
  },
  answerTextSelected: {
    fontSize: 24,
    textAlign: 'center',
    color: 'white', 
  },
  boldText: {
    fontWeight: '900',
  },
});

const markdownStyles = {
  body: styles.questionText,
  strong: {
    color: theme.colors.warning, 
    fontWeight: 'bold',
  },
};

const QuestionRenderer = ({ question, onAnswerSelected }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [questionId, setQuestionId] = useState(null);

  useEffect(() => {
    // Only reset if the question ID actually changed
    if (question?.id !== questionId) {
      setSelectedAnswer(null);
      setQuestionId(question?.id);
    }
  }, [question?.id, questionId]);

  if (!question) {
    return <Text>No question available</Text>;
  }

  const handleAnswerPress = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    
    if (onAnswerSelected && typeof onAnswerSelected === 'function') {
      onAnswerSelected(answerIndex);
    }
  };

  const getButtonStyle = (answerIndex) => {    
    if (selectedAnswer === null) return styles.answerButton;
    
    if (answerIndex === selectedAnswer) {
      const isCorrect = answerIndex === question.correctAnswer;
      return isCorrect 
        ? [styles.answerButton, styles.answerButtonCorrect]
        : [styles.answerButton, styles.answerButtonIncorrect];
    }
    
    return styles.answerButton;
  };


  const getTextStyle = (answerIndex) => {
    if (selectedAnswer === null) return styles.answerText;
    
    if (answerIndex === selectedAnswer) {
      return styles.answerTextSelected;
    }
    
    return styles.answerText;
  };

  return (
    <View style={styles.container}>
      {/* Question */}
      <View style={styles.questionContainer}>
        <Markdown style={markdownStyles}>
          {question.questionText}
        </Markdown>
      </View>

      {/* Answers */}
      <View style={styles.answersContainer}>
        {question.answers.map((answer, i) => (
          <TouchableOpacity 
            key={i} 
            style={getButtonStyle(i)} 
            onPress={() => handleAnswerPress(i)}
          >
            <Text style={getTextStyle(i)}>{answer}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default QuestionRenderer;