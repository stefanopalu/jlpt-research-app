import React from "react";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, View, TextInput, Pressable, StyleSheet, Text} from "react-native";
import { FontAwesome } from '@expo/vector-icons';
import { useWords } from "../../hooks/useWords";
import { useMutation } from "@apollo/client";
import { UPDATE_USER_PROGRESS } from "../../graphql/mutations";
import { useDebounce } from 'use-debounce';
import { useLocation } from 'react-router-native';

import WordCard from '../study/WordCard'
import theme from '../../../theme';

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
  wordcontainer: {
    flex: 1, 
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
    kanjitext: {
      fontSize: 60,
      fontWeight: 'bold',
      color: 'white',
      marginBottom: 8,
      textAlign: 'center',
    },
  labelText: {
    textAlign: 'center',
    fontSize: 16,   
    padding: 8,   
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
  iconButton: {
    backgroundColor: theme.colors.primary,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
    borderRadius: 5,
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
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const level = params.get('level');

    const { words, loading, error } = useWords(level);
    const [index, setIndex] = useState(0);
    const [step, setStep] = useState('english')
    const [answer, setAnswer] = useState('');
    const [result, setResult] = useState(null)
    const [debouncedAnswer] = useDebounce(answer, 500);

    const [updateUserProgress] = useMutation(UPDATE_USER_PROGRESS);

    if (loading) return <Text>Loading words...</Text>;
    if (error) return <Text>Error loading words.</Text>;

    const currentWord = words[index];

    const handleSubmit = async () => {
      if (step === 'english') {
        const isCorrectEnglish = currentWord.english.some(
          e => e.toLowerCase() === debouncedAnswer.trim().toLowerCase()
        );
        setResult(isCorrectEnglish ? 'correct' : 'wrong');

        if (isCorrectEnglish) {
          setAnswer('');
          setStep('hiragana');
        }
        
      
      } else if (step === 'hiragana') {
        const isCorrectHiragana = currentWord.hiragana === debouncedAnswer.trim();
        setResult(isCorrectHiragana ? 'correct' : 'wrong');

        if (isCorrectHiragana) {
          try {
            await updateUserProgress({
              variables: {
                wordId: currentWord.id,
                success: true,
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
            setStep('english');
          }, 1500);
        }
      }
    };

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
            <View style={{ flex: 1 }}>
              <View style={styles.wordcontainer}>
                <Text style={styles.kanjitext}> {currentWord.kanji} </Text>
              </View>
              <View>
              <Text style={styles.labelText}>
                {step === 'english' ? 'English meaning:' : 'Hiragana reading:'}
              </Text>
              </View>
            <View style={styles.inputRow}>

              <TextInput 
                  autoCorrect={false}   
                  autoComplete="off"
                  spellCheck={false}
                  keyboardType="default"
                  style={[
                    styles.input,
                    result === 'correct' ? styles.inputCorrect :
                    result === 'wrong' ? styles.inputWrong : null
                  ]}
                  value={answer}
                  onChangeText={setAnswer}
                  placeholder={step === 'english' ? "Enter the English meaning" : "Enter the hiragana reading"}
              />
              <Pressable style={styles.iconButton} onPress={handleSubmit}>
                  <FontAwesome name="check" size={24} color="white"/>
              </Pressable>
            </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default VocabularyTest;