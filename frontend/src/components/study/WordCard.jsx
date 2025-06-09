import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import theme from '../../../theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  kanji: {
    fontSize: 60,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  hiragana: {
    fontSize: 24,
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  english: {
    fontSize: 20,
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  type: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
});

const WordCard = ({ word }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.kanji}>{word.kanji}</Text>
      <Text style={styles.hiragana}>{word.hiragana}</Text>
      <Text style={styles.english}>{word.english.join(', ')}</Text>
      <Text style={styles.type}>Type: {word.type}</Text>
    </View>
  );
};

export default WordCard;