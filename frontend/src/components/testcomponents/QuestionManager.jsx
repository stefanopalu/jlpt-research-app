import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
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

  useEffect(() => {
    if (!user && !userLoading) {
      // Redirect to sign in if not authenticated and loading is finished
      navigate('/signin');
    }
  }, [user, userLoading, navigate]);

  if (userLoading) return <Text>Loading user data...</Text>;
  if (!level) return <Text>User study level not set...</Text>;

  // Get session length from user, fallback to 10 if not available
  const questionsPerSession = user?.sessionLength ? parseInt(user.sessionLength, 10) : 10;

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
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);

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

  if (loading || isRefetching) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10, fontSize: 16 }}>Loading questions...</Text>
      </View>
    );
  }

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
    if (isProcessingAnswer) return; // Prevent multiple clicks while processing

    setIsProcessingAnswer(true);

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const responseTime = questionStartTime ? Date.now() - questionStartTime : 0;

    if (isCorrect) setCorrectAnswers(prev => prev + 1);
    else setIncorrectAnswers(prev => prev + 1);

    try {
      // Update question progress
      await updateUserQuestionProgress({
        variables: {
          questionId: currentQuestion.id,
          isCorrect,
          responseTime,
        },
      });

      // Parallel update word progress
      if (currentQuestion.words?.length > 0) {
        await Promise.all(
          currentQuestion.words.map(word =>
            updateUserWordProgress({ variables: { word, isCorrect } }),
          ),
        );
      }

      // Parallel update grammar points progress
      if (currentQuestion.grammarPoints?.length > 0) {
        await Promise.all(
          currentQuestion.grammarPoints.map(GPname =>
            updateUserGrammarPointProgress({ variables: { GPname, isCorrect } }),
          ),
        );
      }
    } catch (err) {
      console.error('Error updating progress:', err.message);
    }

    setTimeout(() => {
      setCurrentIndex(prevIndex => {
        if (prevIndex + 1 < sessionTotal) return prevIndex + 1;
        else return prevIndex + 1; // session complete
      });
      setIsProcessingAnswer(false);  // unlock buttons here
    }, 100);
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
        <SimpleQuestions 
          {...questionProps}
          currentQuestionNumber={currentIndex + 1}
          totalQuestions={sessionTotal}
          isProcessingAnswer={isProcessingAnswer}
        />
      )}
    </View>
  );
};

export default QuestionManager;