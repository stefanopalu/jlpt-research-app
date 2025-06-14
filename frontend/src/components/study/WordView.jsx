import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocation, useNavigate } from 'react-router-native';
import { FontAwesome } from '@expo/vector-icons';
import theme from '../../../theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
    marginRight: 40, // Compensate for back button
  },
  wordContainer: {
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  goBackButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  goBackButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

const WordView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const word = location.state?.word;

  const handleBackPress = () => {
    navigate(-1); // Go back to previous page
  };

  const handleGoBackToList = () => {
    navigate('/words'); // Go back to words list
  };

  if (!word) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <FontAwesome name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Word Detail</Text>
        </View>
        
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Word not found. The word data may not have been passed correctly.
          </Text>
          <TouchableOpacity onPress={handleGoBackToList} style={styles.goBackButton}>
            <Text style={styles.goBackButtonText}>Back to Words List</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{word.kanji}</Text>
      </View>
      
      <View style={styles.wordContainer}>
        <Text style={styles.kanji}>{word.kanji}</Text>
        <Text style={styles.hiragana}>{word.hiragana}</Text>
        <Text style={styles.english}>{word.english.join(', ')}</Text>
        <Text style={styles.type}>Type: {word.type}</Text>
      </View>
    </View>
  );
};

export default WordView;