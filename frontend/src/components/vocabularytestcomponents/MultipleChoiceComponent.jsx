import React from 'react';
import Markdown from 'react-native-markdown-display';
import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocation } from 'react-router-native';
import { useQuestions } from "../../hooks/useQuestions";
import { useMutation } from "@apollo/client";
import { UPDATE_USER_PROGRESS } from "../../graphql/mutations";
import theme from '../../../theme';


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.secondary,
  },
  questionContainer: {
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
　questionText: {
    fontSize: 20,
    color: 'white',
    marginBottom: 8,
    padding: 20,
    textAlign: 'center',
  },
  answersContainer: {
    padding: 10,
    gap: 10, 
    },
  answerButton: {
    backgroundColor: 'white',
    padding: 12,
    margin: 10,
    marginHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  answerText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333',
  },
});

const MultipleChoiceQuestions = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const type = params.get('exerciseType');
  const level = params.get('level');

  const { questions, loading, error } = useQuestions(level, type);
  const [index, setIndex] = useState(0);

  const [updateUserProgress] = useMutation(UPDATE_USER_PROGRESS);
  
  if (loading) return <Text>Loading questions...</Text>;
  if (error) return <Text>Error loading questions: {error.message}</Text>;
  
  const currentQuestion = questions[index];

  const handleAnswer = (selectedIndex) => {
    const isCorrect = selectedIndex === currentQuestion.correctAnswer;
    console.log(`Answer selected: ${selectedIndex} — ${isCorrect ? 'Correct' : 'Incorrect'}`);
    if (index + 1 < questions.length) {
      setIndex(index + 1);
    } else {
      console.log('Quiz completed!');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.questionContainer}>
        <Markdown style={{ body: styles.questionText }}>
            {currentQuestion.questionText}
        </Markdown>
      </View>
      <View style={styles.answersContainer}>
      {currentQuestion.answers.map((answer, i) => (
        <TouchableOpacity key={i} style={styles.answerButton} onPress={() => handleAnswer(i)}>
          <Text style={styles.answerText}>{answer}</Text>
        </TouchableOpacity>
      ))}
      </View>
    </View>
  );
};

export default MultipleChoiceQuestions;