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
    maxHeight: '40%',
  },
  readingScroll: {
    maxHeight: 200,
  },
  questionWrapper: {
    flex: 1,
  },
});

const readingMarkdownStyles = {
  body: {
    fontSize: 18,        // Increase from default
    lineHeight: 24,      // Increase line height for better readability
    color: '#333',       // Dark text for reading on white background
  },
  text: {
    fontSize: 18,
    lineHeight: 24,
    color: '#333',
  },
  paragraph: {
    fontSize: 18,
    lineHeight: 24,
    marginVertical: 8,
    color: '#333',
  },
  strong: {
    fontWeight: 'bold',
    fontSize: 18,
  },
};


const QuestionsWithReading = ({ currentQuestion, onAnswerSelected }) => {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Reading Content */}
        {currentQuestion?.readingContent && (
          <View style={styles.readingContainer}>
            <ScrollView style={styles.readingScroll} nestedScrollEnabled={true}>
              <Markdown style={readingMarkdownStyles}>
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