import React, { useState } from "react";
import { View, TextInput, Pressable, StyleSheet, Text } from "react-native";

const theme = {
  colors: {
    primary: '#3366FF',
    error: '#FF3333',
  },
  fontSizes: {
    body: 16,
    subheading: 18,
  },
  fontWeights: {
    bold: '700',
  },
};

const WordCard = ({ word }) => (
  <View style={wordCardStyles.container}>
    <Text style={wordCardStyles.kanji}>{word.kanji}</Text>
    <Text style={wordCardStyles.hiragana}>{word.hiragana}</Text>
  </View>
);

const wordCardStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  kanji: {
    fontSize: 60,
    fontWeight: theme.fontWeights.bold,
    color: 'white',
    marginBottom: 8,
  },
  hiragana: {
    fontSize: 24,
    color: 'white',
  },
});

const VocabularyTestLayout = () => {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState(null);

  // Dummy words for testing
  const words = [
    { kanji: '静か', hiragana: 'しずか', english: ['quiet', 'calm'] },
    { kanji: '速い', hiragana: 'はやい', english: ['fast', 'quick'] },
  ];

  const currentWord = words[index];

  const handleSubmit = () => {
    const isCorrect = currentWord.english.some(e => e.toLowerCase() === answer.trim().toLowerCase());
    setResult(isCorrect ? 'correct' : 'wrong');
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
            result === 'correct' && styles.inputCorrect,
            result === 'wrong' && styles.inputWrong,
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

const styles = StyleSheet.create({
  container: {
    flex: 1,               // fill full screen height
    backgroundColor: '#f2f2f2',
    padding: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
    marginTop: 10,
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
    backgroundColor: '#d4edda',
    borderColor: '#28a745',
  },
  inputWrong: {
    backgroundColor: '#f8d7da',
    borderColor: '#dc3545',
  },
});

export default VocabularyTestLayout;