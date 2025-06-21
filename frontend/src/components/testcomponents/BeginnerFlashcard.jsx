import React from 'react';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, View, TextInput, Pressable, StyleSheet, Text, ScrollView} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useMutation } from '@apollo/client';
import { UPDATE_USER_FLASHCARDS_PROGRESS } from '../../graphql/mutations';

import WordCard from '../study/WordCard';
import FlashcardProgressBar from './FlashcardProgressBar';
import theme from '../../../theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  wordcontainer: {
    height: 250, // Fixed height instead of flex
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSection: {
    flex: 1, // This will be the flexible space for keyboard
  },
  keyboardSpace: {
    flex: 1, // This space gets occupied by keyboard
    minHeight: 100, // Minimum space when keyboard is not visible
    backgroundColor: 'white',
  },
  kanjitext: {
    fontSize: 60,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  hiraganatext: {
    fontSize: 24,
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  labelContainer: {
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
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
    fontSize: 22,
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
  solutionContainer: {
    flex: 1, // Takes all available space in bottomSection
    marginTop: 10,
  },
  solutionContent: {
    flexGrow: 1,
  },
});

const BeginnerFlashcard = ({ words, onCardCompleted }) => {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState(null);
  const [showWordCard, setShowWordCard] = useState(false);

  const [updateUserFlashcardsProgress] = useMutation(UPDATE_USER_FLASHCARDS_PROGRESS);

  const currentWord = words[index];

  const handleSubmit = async () => {
    const userAnswerTrimmed = answer.trim().toLowerCase();
    
    const isCorrect = currentWord.english.some(
      e => {
        const expectedAnswer = e.toLowerCase();
        return expectedAnswer === userAnswerTrimmed;
      },
    );

    setResult(isCorrect ? 'correct' : 'wrong');

    // Update progress
    try {
      await updateUserFlashcardsProgress({
        variables: {
          wordId: currentWord.id,
          isCorrect: isCorrect,
        },
      });
      console.log(`Progress updated: ${isCorrect ? 'success' : 'failure'}`);
    } catch (err) {
      console.error('Mutation error:', err.message);
    }

    // If correct, move to next word after a brief delay
    if (isCorrect) {
      setTimeout(() => {
        moveToNextWord();
      }, 1000);
    }
  };

  const moveToNextWord = () => {
    // Notify the parent that this card is completed
    if (onCardCompleted) {
      onCardCompleted();
    }
    
    if (index + 1 < words.length) {
      setIndex(prev => prev + 1);
      // Reset state for new word
      setAnswer('');
      setResult(null);
      setShowWordCard(false);
    }
  };

  const handleNext = () => {
    // On clicking "next" after wrong answer, reset input and result to allow retry
    setAnswer('');
    setResult(null);
    setShowWordCard(false);
  };

  const isInputEditable = result !== 'wrong';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardContainer}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20} 
    >
      <View style={styles.container}>
        {/* Progress indicator */}
        <FlashcardProgressBar 
          currentIndex={index}
          totalWords={words.length}
          currentWord={currentWord}
        />

        <View style={styles.contentContainer}>
          {/* Fixed size word display area */}
          <View style={styles.wordcontainer}>
            <Text style={styles.kanjitext}>{currentWord.kanji}</Text>
            <Text style={styles.hiraganatext}>{currentWord.hiragana}</Text>
          </View>

          {/* Bottom section with input and flexible space */}
          <View style={styles.bottomSection}>
            {/* Fixed input area */}
            <View>
              <View style={styles.labelContainer}>
                <Text style={styles.labelText}>English meaning:</Text>
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
                  style={[
                    styles.input,
                    result === 'correct' ? styles.inputCorrect :
                      result === 'wrong' ? styles.inputWrong : null,
                  ]}
                  value={answer}
                  onChangeText={setAnswer}
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
            </View>

            {/* Flexible area for WordCard or keyboard space */}
            {showWordCard ? (
              <ScrollView style={styles.solutionContainer} contentContainerStyle={styles.solutionContent}>
                <WordCard word={currentWord} />
              </ScrollView>
            ) : (
              /* This space gets occupied by the keyboard when input is focused */
              <View style={styles.keyboardSpace} />
            )}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default BeginnerFlashcard;