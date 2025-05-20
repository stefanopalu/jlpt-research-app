import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import theme from '../../theme';

const styles = StyleSheet.create({
  container: {
  flex: 1, 
  backgroundColor: theme.colors.primary,
  alignItems: 'center',
  justifyContent: 'center',
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
    textAlign: 'center',
  },
});

const WordCard = ({ word }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.kanji}>{word.kanji} </Text>
       <Text style={styles.hiragana}>{word.hiragana}</Text>
    </View>
  );
};

export default WordCard;