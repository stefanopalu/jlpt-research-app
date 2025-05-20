import React from "react";
import { useState } from "react";
import { View, TextInput, Pressable, StyleSheet, Text} from "react-native";
import { useWords } from "../hooks/useWords";
import { useUserProgress } from '../hooks/useUserProgress';
import { useMutation } from "@apollo/client";
import { UPDATE_USER_PROGRESS } from "../graphql/mutations";
import { useDebounce } from 'use-debounce';

import WordCard from './WordCard'
import theme from '../../theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: theme.fontSizes.body,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginRight: 10,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  inputCorrect: {
    backgroundColor: '#d4edda', // light green
    borderColor: '#28a745',     // green
  },
  inputWrong: {
    backgroundColor: '#f8d7da', // light red
    borderColor: '#dc3545',     // red
  },
});

const VocabularyTest = () => {
    const { words, loading, error } = useWords();
    const [index, setIndex] = useState(0);
    const [answer, setAnswer] = useState('');
    const [result, setResult] = useState(null)
    const [debouncedAnswer] = useDebounce(answer, 500);

    const [updateUserProgress] = useMutation(UPDATE_USER_PROGRESS);

    if (loading) return <Text>Loading words...</Text>;
    if (error) return <Text>Error loading words.</Text>;

    const currentWord = words[index];

    const handleSubmit = async () => {
      const isCorrect = currentWord.english.some(e => e.toLowerCase() === debouncedAnswer.trim().toLowerCase());
      setResult(isCorrect ? 'correct' : 'wrong');

      try {
        await updateUserProgress({
          variables: {
            wordId: currentWord.id,
            success: isCorrect,
          },
        });
        console.log('Mutation success!');
      } catch (err) {
        console.error('Mutation error:', err.message);
      }
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % words.length);
        setAnswer('');
        setResult(null);
      }, 1500);
    };

    return (
        <View style={styles.container}>
            <View style={{ flex: 1 }}>
            <WordCard word={currentWord} />
            </View>
            <View style={styles.inputRow}>
              <TextInput 
                  style={[
                    styles.input,
                    result === 'correct' ? styles.inputCorrect :
                    result === 'wrong' ? styles.inputWrong : null
                  ]}
                  value={answer}
                  onChangeText={setAnswer}
                  placeholder="Enter the English meaning"
              />
              <Pressable style={styles.button} onPress={handleSubmit}>
                  <Text style={styles.buttonText}>Check</Text>
              </Pressable>
            </View>
        </View>
    );
};

export default VocabularyTest;