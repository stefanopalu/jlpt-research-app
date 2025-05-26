import React from "react";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, View, TextInput, Pressable, StyleSheet, Text, ScrollView} from "react-native";
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
  labelContainer: {
    alignItems: 'center',
    backgroundColor: '#f1f1f1'
  },
  labelText: {
    textAlign: 'center',
    fontSize: theme.fontSizes.body,   
    padding: 8,   
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    padding: 10,
    textAlign: 'center',
    fontSize: 16,
  },
  iconButton: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 0,
  },
  inputCorrect: {
    color: '#28a745',     // green
  },
  inputWrong: {
    color: '#dc3545',     // red
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
    const [showWordCard, setShowWordCard] = useState(false);

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
          // reset input and result and move to hiragana step on correct English answer
          setAnswer('');
          setResult(null);
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
          // move to next word and reset to English step
          setIndex((prev) => (prev + 1) % words.length);
          setStep('english');
          setAnswer('');
          setResult(null);
        }
      }
    };

    const handleNext = () => {
      // On clicking "next" after wrong answer, reset input & result to allow retry
      setAnswer('');
      setResult(null);
      setShowWordCard(false);
    };

    const isInputEditable = result !== 'wrong';

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
      <View style={styles.container}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.wordcontainer}>
              <Text style={styles.kanjitext}> {currentWord.kanji} </Text>
            </View>
            <View style={styles.labelContainer}>
              <Text style={styles.labelText}>
                {step === 'english' ? 'English meaning:' : 'Hiragana reading:'}
              </Text>
            </View>
            <View style={styles.inputRow}>
              {result === 'wrong' && (
                <Pressable style={styles.iconButton} onPress={() => setShowWordCard(true)}>
                  <FontAwesome name="info-circle" size={24} color={theme.colors.primary} />
                </Pressable>
              )}
              <TextInput 
                  editable={isInputEditable}
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
              {result === 'wrong' ? (
                <Pressable style={styles.iconButton} onPress={handleNext}>
                  <FontAwesome name="arrow-right" size={24} color={theme.colors.primary} />
                </Pressable>
              ) : (
                <Pressable style={styles.iconButton} onPress={handleSubmit}>
                  <FontAwesome name="check" size={24} color={theme.colors.primary} />
                </Pressable>
              )}
            </View>

            {showWordCard && (
              <View style={styles.solutionContainer}>
                <WordCard word={currentWord} />
              </View>
            )}

          </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default VocabularyTest;