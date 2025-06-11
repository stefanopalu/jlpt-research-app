import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocation } from 'react-router-native';
import { useQuestions } from '../../hooks/useQuestions';
import QuestionsWithReading from './QuestionsWithReading';
import SimpleQuestions from './SimpleQuestions';
import SessionProgressBar from './SessionProgressBar';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CURRENT_USER } from '../../graphql/queries';
import { UPDATE_USER_QUESTION_PROGRESS, UPDATE_USER_GRAMMAR_POINT_PROGRESS, UPDATE_USER_WORD_PROGRESS } from '../../graphql/mutations';

const QUESTIONS_PER_SESSION = 5;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const QuestionManager = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const type = params.get('exerciseType');

  const { data: userData, loading: userLoading } = useQuery(GET_CURRENT_USER);
  const user = userData?.me;
  const level = user?.studyLevel;

  const { questions, loading, error } = useQuestions(level, type);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [currentQuestionTime, setCurrentQuestionTime] = useState(0);
  const intervalRef = useRef(null);
  const questionTimerRef = useRef(null);

  const [updateUserQuestionProgress] = useMutation(UPDATE_USER_QUESTION_PROGRESS);
  const [updateUserGrammarPointProgress] = useMutation(UPDATE_USER_GRAMMAR_POINT_PROGRESS);
  const [updateUserWordProgress] = useMutation(UPDATE_USER_WORD_PROGRESS);

  // 1. Start SESSION timer when first question loads
useEffect(() => {
  if (questions && questions.length > 0 && !sessionStartTime) {
    const startTime = Date.now();
    setSessionStartTime(startTime);
    
    // Update timer every second
    intervalRef.current = setInterval(() => {
      const currentTime = Date.now();
      const elapsed = Math.floor((currentTime - startTime) / 1000);
      setElapsedTime(elapsed);
    }, 1000);
  }

  // Cleanup interval on unmount
  return () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (questionTimerRef.current) {
      clearInterval(questionTimerRef.current);
    }
  };
}, [questions]);

// 2. Start QUESTION timer when currentIndex changes OR when questions first load
useEffect(() => {
  if (questions && questions.length > 0 && currentIndex < QUESTIONS_PER_SESSION) {
    const questionStart = Date.now();
    setQuestionStartTime(questionStart);
    setCurrentQuestionTime(0);

    // Clear any existing question timer
    if (questionTimerRef.current) {
      clearInterval(questionTimerRef.current);
    }
    
    // Update current question timer every second
    questionTimerRef.current = setInterval(() => {
      const currentTime = Date.now();
      const questionElapsed = Math.floor((currentTime - questionStart) / 1000);
      setCurrentQuestionTime(questionElapsed);
    }, 1000);
  }

  // Cleanup question timer when moving to next question
  return () => {
    if (questionTimerRef.current) {
      clearInterval(questionTimerRef.current);
    }
  };
}, [currentIndex, questions]); // This handles BOTH first question AND question changes

// 3. Stop timers when session is complete
useEffect(() => {
  if (currentIndex >= QUESTIONS_PER_SESSION) {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (questionTimerRef.current) {
      clearInterval(questionTimerRef.current);
      questionTimerRef.current = null;
    }
    console.log(`Session completed in ${elapsedTime} seconds`);
  }
  }, [currentIndex, elapsedTime]);

  // Define which types need reading content
  const READING_CONTENT_TYPES = ['textgrammar', 'shortpass', 'mediumpass', 'inforetrieval'];
  const needsReadingContent = READING_CONTENT_TYPES.includes(type);

  if (userLoading) return <Text>Loading user data...</Text>;
  if (!user) return <Text>User not found...</Text>;
  if (!level) return <Text>User study level not set...</Text>;
  if (loading) return <Text>Loading questions...</Text>;
  if (error) return <Text>Error loading questions: {error.message}</Text>;

  if (!questions || questions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No questions available</Text>
      </View>
    );
  }
  
  const sessionQuestions = questions.slice(0, QUESTIONS_PER_SESSION);
  const currentQuestion = questions[currentIndex];

  // Check if session is complete
  if (currentIndex >= QUESTIONS_PER_SESSION) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', fontSize: 18, marginTop: 50 }}>
          Session Complete! 🎉{'\n'}
          Time: {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
        </Text>
      </View>
    );
  }

  const handleAnswerSelected = async (selectedAnswer) => {
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    const responseTime = questionStartTime ? Date.now() - questionStartTime : 0;
    console.log(`Question answered in ${responseTime}ms (${Math.round(responseTime/1000)}s)`);

    try {
      // Update question progress 
      await updateUserQuestionProgress({
        variables: {
          questionId: currentQuestion.id,
          isCorrect: isCorrect,
        },
      });
      console.log(`Question progress updated: ${isCorrect ? 'correct' : 'incorrect'}`);

      // Update word progress for ALL words in the question
      if (currentQuestion.words && currentQuestion.words.length > 0) {
        for (const word of currentQuestion.words) {
          await updateUserWordProgress({
            variables: {
              wordKanji: word.kanji,
              isCorrect: isCorrect,
            },
          });
          console.log(`Word progress updated for: ${word.kanji}`);
        }
      }

      // Update grammar point progress for ALL grammar points in the question
      if (currentQuestion.grammarPoints && currentQuestion.grammarPoints.length > 0) {
        for (const grammarPoint of currentQuestion.grammarPoints) {
          await updateUserGrammarPointProgress({
            variables: {
              GPname: grammarPoint.name,
              isCorrect: isCorrect,
            },
          });
          console.log(`Grammar point progress updated for: ${grammarPoint.name}`);
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
        elapsedTime={elapsedTime}
        currentQuestionTime={currentQuestionTime}
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