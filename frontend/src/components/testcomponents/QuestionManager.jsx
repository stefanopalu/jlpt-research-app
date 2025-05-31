import { useState } from "react";
import { View, Text, StyleSheet } from 'react-native';
import { useLocation } from 'react-router-native';
import { useQuestions } from "../../hooks/useQuestions";
import QuestionsWithReading from './QuestionsWithReading';
import SimpleQuestions from './SimpleQuestions';
import theme from '../../../theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const QuestionManager = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const type = params.get('exerciseType');
  const level = params.get('level');

  console.log('URL params:', { type, level });

  const { questions, loading, error } = useQuestions(level, type);
  const [currentIndex, setCurrentIndex] = useState(0);

  console.log('Hook results:', { questions, loading, error });

  // Define which types need reading content
  const READING_CONTENT_TYPES = ['textgrammar', 'shortpass', 'mediumpass', 'inforetrieval'];
  const needsReadingContent = READING_CONTENT_TYPES.includes(type);

  if (loading) return <Text>Loading questions...</Text>;
  if (error) return <Text>Error loading questions: {error.message}</Text>;

  if (!questions || questions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No questions available</Text>
      </View>
    );
  }

  const currentQuestion = questions[currentIndex];

  const handleAnswerSelected = (selectedAnswer) => {
    console.log(`Answer selected: ${selectedAnswer}`);
    
    // Short delay and then move to next question
    setTimeout(() => {
        if (currentIndex + 1 < questions.length) {
            setCurrentIndex(currentIndex + 1);
        } else {
            console.log('Quiz completed!');
        }
      }, 1500);
    };

  // Props to pass to child components
  const questionProps = {
    currentQuestion,
    onAnswerSelected: handleAnswerSelected,
  };

  return (
    <View style={styles.container}>
      {needsReadingContent ? (
        <QuestionsWithReading {...questionProps} />
      ) : (
        <SimpleQuestions {...questionProps} />
      )}
    </View>
  );
};

export default QuestionManager;