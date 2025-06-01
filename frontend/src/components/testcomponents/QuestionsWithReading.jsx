import Markdown from 'react-native-markdown-display';
import { View, StyleSheet, ScrollView } from 'react-native';
import QuestionRenderer from './QuestionRenderer';
import theme from '../../../theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  scrollContainer: {
    flex: 1,
  },
  readingContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 10,
    borderRadius: 10,
    marginBottom: 0,
    maxHeight: '40%',
  },
  readingScroll: {
    maxHeight: 200,
  },
  questionWrapper: {
    flex: 1,
  },
});

const QuestionsWithReading = ({ currentQuestion, onAnswerSelected }) => {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Reading Content */}
        {currentQuestion?.readingContent && (
          <View style={styles.readingContainer}>
            <ScrollView style={styles.readingScroll} nestedScrollEnabled={true}>
              <Markdown>
                {currentQuestion.readingContent.content}
              </Markdown>
            </ScrollView>
          </View>
        )}

        {/* Question using QuestionRenderer */}
        <View style={styles.questionWrapper}>
          <QuestionRenderer 
            question={currentQuestion} 
            onAnswerSelected={onAnswerSelected} 
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default QuestionsWithReading;