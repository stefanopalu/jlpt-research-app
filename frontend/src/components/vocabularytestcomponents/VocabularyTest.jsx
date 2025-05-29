import React from "react";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, View, TextInput, Pressable, StyleSheet, Text, ScrollView} from "react-native";
import { FontAwesome } from '@expo/vector-icons';
import { useStudySession } from "../../hooks/useStudySession";
import { useMutation } from "@apollo/client";
import { UPDATE_USER_VOCABULARY_PROGRESS } from "../../graphql/mutations";
import { useDebounce } from 'use-debounce';
import { useLocation } from 'react-router-native';
import { romajiToHiragana } from "../../utils/romajiToHiragana";

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
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f9fa',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  newWordBadge: {
    backgroundColor: '#007bff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newWordText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

const VocabularyTest = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const level = params.get('level');

  const { words, loading, error, refetch } = useStudySession(level, 100);
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState('english')
  const [answer, setAnswer] = useState('');
  const [rawAnswer, setRawAnswer] = useState(''); // Store the raw romaji input
  const [result, setResult] = useState(null)
  const [showWordCard, setShowWordCard] = useState(false);
  const [completedWords, setCompletedWords] = useState(0);
  
  // Track if progress has been updated for current word
  const [progressUpdated, setProgressUpdated] = useState(false);

  const [debouncedAnswer] = useDebounce(answer, 500);
  const [updateUserVocabularyProgress] = useMutation(UPDATE_USER_VOCABULARY_PROGRESS);

  const handleInputChange = (text) => {
    if (step === 'hiragana') {
      // For hiragana step, convert romaji to hiragana
      setRawAnswer(text);
      setAnswer(romajiToHiragana(text));
    } else {
      // For English step, use text as-is
      setAnswer(text);
      setRawAnswer(text);
    }
  };

  if (loading) return <Text>Loading study session...</Text>;
  if (error) return <Text>Error loading study session: {error.message}</Text>;
  if (!words || words.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No words available for study. Great job - you're up to date!</Text>
        <Pressable onPress={() => refetch()}>
          <Text>Refresh</Text>
        </Pressable>
      </View>
    );
  }

  const currentWord = words[index];

  const handleSubmit = async () => {
    if (step === 'english') {
      const isCorrectEnglish = currentWord.english.some(
        e => e.toLowerCase() === debouncedAnswer.trim().toLowerCase()
      );
      
      setResult(isCorrectEnglish ? 'correct' : 'wrong');

      if (isCorrectEnglish) {
        // English correct - move to hiragana step
        setAnswer('');
        setRawAnswer('');
        setResult(null);
        setStep('hiragana');
      } else {
        // English wrong - record failure immediately
        if (!progressUpdated) {
          try {
            await updateUserVocabularyProgress({
              variables: {
                wordId: currentWord.id,
                success: false,
              },
            });
            setProgressUpdated(true);
            console.log('Progress updated: failure (English wrong)');
          } catch (err) {
            console.error('Mutation error:', err.message);
          }
        }
      }
      
    } else if (step === 'hiragana') {
      const isCorrectHiragana = currentWord.hiragana === debouncedAnswer.trim();
      setResult(isCorrectHiragana ? 'correct' : 'wrong');

      if (isCorrectHiragana) {
        // Hiragana correct - check if we can record success
        if (!progressUpdated) {
          // No previous mistakes - record success
          try {
            await updateUserVocabularyProgress({
              variables: {
                wordId: currentWord.id,
                success: true,
              },
            });
            console.log('Progress updated: success (both correct)');
          } catch (err) {
            console.error('Mutation error:', err.message);
          }
        }
        
        // Move to next word (regardless of whether success was recorded)
        moveToNextWord();
        
      } else {
        // Hiragana wrong - record failure if not already done
        if (!progressUpdated) {
          try {
            await updateUserVocabularyProgress({
              variables: {
                wordId: currentWord.id,
                success: false,
              },
            });
            setProgressUpdated(true);
            console.log('Progress updated: failure (Hiragana wrong)');
          } catch (err) {
            console.error('Mutation error:', err.message);
          }
        }
      }
    }
  };

  const moveToNextWord = () => {
    setCompletedWords(prev => prev + 1);
    
    if (index + 1 < words.length) {
      setIndex(prev => prev + 1);
      setStep('english');
      // Reset state for new word
      setAnswer('');
      setRawAnswer('');
      setResult(null);
      setShowWordCard(false);
      setProgressUpdated(false);
    } else {
      // Finished all words
      alert(`Session complete! You studied ${completedWords + 1} words.`);
    }
  };

  const handleNext = () => {
    // On clicking "next" after wrong answer, reset input & result to allow retry
    setAnswer('');
    setRawAnswer('');
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
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {index + 1} / {words.length} ({completedWords} completed)
          </Text>
          {currentWord.isNew && (
            <View style={styles.newWordBadge}>
              <Text style={styles.newWordText}>NEW</Text>
            </View>
          )}
          <Text style={styles.progressText}>
            SRS Level: {currentWord.srsLevel || 0}
          </Text>
        </View>

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
                keyboardType={step === 'hiragana' ? 'ascii-capable' : 'default'}
                style={[
                  styles.input,
                  result === 'correct' ? styles.inputCorrect :
                  result === 'wrong' ? styles.inputWrong : null
                ]}
                value={answer}
                onChangeText={handleInputChange}
                placeholder="Your response"
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