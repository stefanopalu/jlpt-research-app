import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocation, useNavigate } from 'react-router-native';
import theme from '../../../theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  header: {
    backgroundColor: theme.colors.tertiary,
    paddingVertical: 10,
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  title: {
    fontSize: theme.fontSizes.subheading + 8,
    fontWeight: theme.fontWeights.bold,
    color: 'white',
    textAlign: 'left',
  },
  content: {
    padding: 18,
  },
  backButton: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  wordCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  kanji: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  hiragana: {
    fontSize: 24,
    color: '#374151',
    marginBottom: 20,
    textAlign: 'center',
  },
  english: {
    fontSize: 20,
    color: '#374151',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  type: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    backgroundColor: '#f8f9fb',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  errorCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  errorSubText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
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
          <Text style={styles.title}>Word Detail</Text>
        </View>
        
        <View style={styles.content}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>Word not found</Text>
            <Text style={styles.errorSubText}>
              The word data may not have been passed correctly.
            </Text>
            <TouchableOpacity onPress={handleGoBackToList} style={styles.backButton}>
              <Text style={styles.backButtonText}>Back to Words List</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Word Detail</Text>
      </View>
      
      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backButtonText}>← Back to Words</Text>
        </TouchableOpacity>
        
        <View style={styles.wordCard}>
          <Text style={styles.sectionTitle}>Kanji</Text>
          <Text style={styles.kanji}>{word.kanji}</Text>
          
          <Text style={styles.sectionTitle}>Hiragana</Text>
          <Text style={styles.hiragana}>{word.hiragana}</Text>
          
          <Text style={styles.sectionTitle}>English Meaning</Text>
          <Text style={styles.english}>{word.english.join(', ')}</Text>
          
          <Text style={styles.type}>Type: {word.type}</Text>
        </View>
      </View>
    </View>
  );
};

export default WordView;