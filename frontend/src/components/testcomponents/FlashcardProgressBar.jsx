import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
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

const FlashcardProgressBar = ({ 
  currentIndex, 
  totalWords, 
  completedWords, 
  currentWord, 
}) => {
  return (
    <View style={styles.progressContainer}>
      <Text style={styles.progressText}>
        {currentIndex + 1} / {totalWords} ({completedWords} completed)
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
  );
};

export default FlashcardProgressBar;