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
    paddingVertical: 40,
  },
  questionText: {
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
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
    margin: 10,
    marginHorizontal: 20,
    borderRadius: 10,
    borderColor: '#ccc',
  },
  answerButtonCorrect: {
    backgroundColor: '#4CAF50', // Green for correct
  },
  answerButtonIncorrect: {
    backgroundColor: '#F44336', // Red for incorrect
  },
  answerText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333',
  },
  answerTextSelected: {
    fontSize: 18,
    textAlign: 'center',
    color: 'white', // White text for selected answers
  },
});

const QuestionRenderer = ({ question, onAnswerSelected }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  useEffect(() => {
    setSelectedAnswer(null);
  }, [question]);

  if (!question) {
    return <Text>No question available</Text>;
  }

  const handleAnswerPress = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    onAnswerSelected(answerIndex);
  };

  const getButtonStyle = (answerIndex) => {
    if (selectedAnswer === null) return styles.answerButton;
    
    if (answerIndex === selectedAnswer) {
      return answerIndex === question.correctAnswer 
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
        <Markdown style={{ body: styles.questionText }}>
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