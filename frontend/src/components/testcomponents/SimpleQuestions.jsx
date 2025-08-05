import { View, Text, StyleSheet } from 'react-native';
import QuestionRenderer from './QuestionRenderer';
import theme from '../../../theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  questionNumberContainer: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 0,
    alignItems: 'center',
  },
  questionNumberText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',    
  },
});

const SimpleQuestions = ({ currentQuestion, onAnswerSelected, currentQuestionNumber, isProcessingAnswer }) => {
  return (
    <View style={styles.container}>
      {/* Question Number Header */}
      <View style={styles.questionNumberContainer}>
        <Text style={styles.questionNumberText}>
          Question {currentQuestionNumber}
        </Text>
      </View>
      
      {/* Original Question Renderer */}
      <QuestionRenderer 
        question={currentQuestion} 
        onAnswerSelected={onAnswerSelected}
        isProcessingAnswer={isProcessingAnswer} 
      />
    </View>
  );
};

export default SimpleQuestions;