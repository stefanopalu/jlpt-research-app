import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocation, useNavigate } from 'react-router-native';
import { useQuestionStudySession } from '../../hooks/useQuestionStudySession';
import QuestionsWithReading from './QuestionsWithReading';
import SimpleQuestions from './SimpleQuestions';
import SessionProgressBar from './SessionProgressBar';
import SessionComplete from './SessionComplete';
import { useMutation } from '@apollo/client';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { UPDATE_USER_QUESTION_PROGRESS, UPDATE_USER_GRAMMAR_POINT_PROGRESS, UPDATE_USER_WORD_PROGRESS } from '../../graphql/mutations';

const QUESTIONS_PER_SESSION = 5;

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

  const { questions, loading, error, refetch } = useQuestionStudySession(level, type, QUESTIONS_PER_SESSION);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [isRefetching, setIsRefetching] = useState(false);

  const [updateUserQuestionProgress] = useMutation(UPDATE_USER_QUESTION_PROGRESS);
  const [updateUserGrammarPointProgress] = useMutation(UPDATE_USER_GRAMMAR_POINT_PROGRESS);
  const [updateUserWordProgress] = useMutation(UPDATE_USER_WORD_PROGRESS);

  useEffect(() => {
    if (questions && questions.length > 0 && currentIndex < QUESTIONS_PER_SESSION) {
      setQuestionStartTime(Date.now());
    }
  }, [currentIndex, questions?.length]);

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

  // Check if session is complete
  if (currentIndex >= QUESTIONS_PER_SESSION) {
    const handleNewSession = async () => {
      console.log('Starting new session...');
      setIsRefetching(true);
      setCurrentIndex(0);
      setQuestionStartTime(null);
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
        questionsCompleted={QUESTIONS_PER_SESSION}
      />
    );
  }

  const handleAnswerSelected = async (selectedAnswer) => {
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const responseTime = questionStartTime ? Date.now() - questionStartTime : 0;

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
      if (currentIndex + 1 < QUESTIONS_PER_SESSION) {
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
  };

  return (
    <View style={styles.container}>
      <SessionProgressBar 
        currentQuestion={currentIndex + 1}
        totalQuestions={QUESTIONS_PER_SESSION}
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