import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import theme from '../../../theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

const SessionComplete = ({ onNewSession, onGoHome, questionsCompleted = 5 }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Session Complete! 🎉</Text>
      <Text style={styles.subtitle}>
        Great job! You completed {questionsCompleted} questions.
      </Text>
      
      <View style={styles.buttonContainer}>
        <Pressable style={styles.primaryButton} onPress={onNewSession}>
          <Text style={styles.primaryButtonText}>Start New Session</Text>
        </Pressable>
        
        <Pressable style={styles.secondaryButton} onPress={onGoHome}>
          <Text style={styles.secondaryButtonText}>Go Home</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default SessionComplete;