import { View, StyleSheet } from 'react-native';
import QuestionRenderer from './QuestionRenderer';
import theme from '../../../theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
});

const SimpleQuestions = ({ currentQuestion, onAnswerSelected }) => {
  return (
    <View style={styles.container}>
      <QuestionRenderer 
        question={currentQuestion} 
        onAnswerSelected={onAnswerSelected} 
      />
    </View>
  );
};

export default SimpleQuestions;