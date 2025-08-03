import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocation, useNavigate } from 'react-router-native';
import { useQuestionStudySession } from '../../hooks/useQuestionStudySession';
import { useReadingStudySession } from '../../hooks/useReadingStudySession'; 
import QuestionsWithReading from './QuestionsWithReading';
import SimpleQuestions from './SimpleQuestions';
import SessionProgressBar from './SessionProgressBar';
import SessionComplete from './SessionComplete';
import { useMutation } from '@apollo/client';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { UPDATE_USER_QUESTION_PROGRESS, UPDATE_USER_GRAMMAR_POINT_PROGRESS, UPDATE_USER_WORD_PROGRESS } from '../../graphql/mutations';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const QuestionManager = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const type = params.get('exerciseType');

  const { user, loading: userLoading } = useCurrentUser({ required: true });
  const level = user?.studyLevel;
  // Add debug logging for user data
  console.log('=== USER DATA DEBUG ===');
  console.log('User sessionLength:', user?.sessionLength);
  console.log('User studySessionType:', user?.studySessionType);
  console.log('User studyLevel:', user?.studyLevel);
  console.log('========================');
  
  // Get session length from user, fallback to 10 if not available
  const questionsPerSession = user?.sessionLength ? parseInt(user.sessionLength, 10) : 10;
  console.log('Calculated questionsPerSession:', questionsPerSession);

  // Use different hooks based on exercise type
  const isReadingBased = type === 'textgrammar';
  
  const questionHookResult = isReadingBased 
    ? useReadingStudySession(level, type, 2) // Max 2 readings for reading-based
    : useQuestionStudySession(level, type, questionsPerSession);
    
  const { 
    questions, 
    loading, 
    error, 
    refetch,
    // Additional properties for reading-based sessions
    readingSets,
    totalQuestions: readingTotalQuestions,
  } = questionHookResult;

  // Use the appropriate total count
  const sessionTotal = isReadingBased ? readingTotalQuestions : questionsPerSession;
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [isRefetching, setIsRefetching] = useState(false);

  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);

  const [updateUserQuestionProgress] = useMutation(UPDATE_USER_QUESTION_PROGRESS);
  const [updateUserGrammarPointProgress] = useMutation(UPDATE_USER_GRAMMAR_POINT_PROGRESS);
  const [updateUserWordProgress] = useMutation(UPDATE_USER_WORD_PROGRESS);

  useEffect(() => {
    if (questions && questions.length > 0 && currentIndex < sessionTotal) {
      setQuestionStartTime(Date.now());
    }
  }, [currentIndex, questions?.length, sessionTotal]);

  // Define which types need reading content
  const READING_CONTENT_TYPES = ['textgrammar', 'shortpass', 'mediumpass', 'inforetrieval'];
  const needsReadingContent = READING_CONTENT_TYPES.includes(type);

  if (userLoading) return <Text>Loading user data...</Text>;
  if (!user) return <Text>User not found...</Text>;
  if (!level) return <Text>User study level not set...</Text>;
  if (loading || isRefetching) return <Text>Loading questions...</Text>;
  if (error) return <Text>Error loading questions: {error.message}</Text>;

  if (!questions || questions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No questions available</Text>
      </View>
    );
  }
  
  const currentQuestion = questions[currentIndex];

  // Check if session is complete - use dynamic session total
  if (currentIndex >= sessionTotal) {
    const handleNewSession = async () => {
      console.log('Starting new session...');
      setIsRefetching(true);
      setCurrentIndex(0);
      setQuestionStartTime(null);
      setCorrectAnswers(0);
      setIncorrectAnswers(0);
      try {
        await refetch(); // Refetch new questions from the server
        console.log('New questions fetched successfully');
      } catch (err) {
        console.error('Error fetching new questions:', err);
      } finally {
        setIsRefetching(false);
      }
    };

    const handleGoHome = () => {
      navigate('/');
    };

    return (
      <SessionComplete 
        onNewSession={handleNewSession}
        onGoHome={handleGoHome}
        questionsCompleted={sessionTotal} // Use dynamic total
      />
    );
  }

  const handleAnswerSelected = async (selectedAnswer) => {
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const responseTime = questionStartTime ? Date.now() - questionStartTime : 0;

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    } else {
      setIncorrectAnswers(prev => prev + 1);
    }

    try {
      // Update question progress 
      console.log('About to update question progress with:', {
        questionId: currentQuestion.id,
        isCorrect: isCorrect,
        responseTime: responseTime,
      });
      await updateUserQuestionProgress({
        variables: {
          questionId: currentQuestion.id,
          isCorrect: isCorrect,
          responseTime: responseTime,
        },
      });
      console.log(`Question progress updated: ${isCorrect ? 'correct' : 'incorrect'}`);

      // Update word progress for ALL words in the question
      if (currentQuestion.words && currentQuestion.words.length > 0) {
        for (const word of currentQuestion.words) {
          await updateUserWordProgress({
            variables: {
              word: word,
              isCorrect: isCorrect,
            },
          });
          console.log(`Word progress updated for: ${word}`);
        }
      }

      // Update grammar point progress for ALL grammar points in the question
      if (currentQuestion.grammarPoints && currentQuestion.grammarPoints.length > 0) {
        console.log('=== GRAMMAR PROGRESS UPDATE ===');
        console.log('About to update grammar progress for:', currentQuestion.grammarPoints);
        for (const grammarPoint of currentQuestion.grammarPoints) {
          await updateUserGrammarPointProgress({
            variables: {
              GPname: grammarPoint,
              isCorrect: isCorrect,
            },
          });
          console.log(`Grammar point progress updated for: ${grammarPoint}`);
        }
      }

    } catch (err) {
      console.error('Error updating progress:', err.message);
    }

    // Short delay and then move to next question
    setTimeout(() => {
      if (currentIndex + 1 < sessionTotal) { // Use dynamic total
        setCurrentIndex(currentIndex + 1);
      } else {
        //Session complete
        console.log('Quiz completed!');
        setCurrentIndex(currentIndex + 1);
      }
    }, 1500);
  };

  // Props to pass to child components
  const questionProps = {
    currentQuestion,
    onAnswerSelected: handleAnswerSelected,
    // Pass reading sets for enhanced reading experience
    ...(isReadingBased && { readingSets, currentIndex }),
  };

  return (
    <View style={styles.container}>
      <SessionProgressBar 
        currentQuestion={currentIndex + 1}
        totalQuestions={sessionTotal}
        correctAnswers={correctAnswers} 
        incorrectAnswers={incorrectAnswers} 
      /> 
      {needsReadingContent ? (
        <QuestionsWithReading {...questionProps} />
      ) : (
        <SimpleQuestions {...questionProps} />
      )}
    </View>
  );
};

export default QuestionManager;