import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '../../../theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flex: 1,
    marginRight: 16,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.warning,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoreNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  correctIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981', // Green
  },
  incorrectIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ef4444', // Red
  },
  accuracyText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
    marginLeft: 8,
  },
});

const SessionProgressBar = ({ 
  currentQuestion, 
  totalQuestions, 
  correctAnswers = 0, 
  incorrectAnswers = 0, 
}) => {
  const progressPercentage = (currentQuestion / totalQuestions) * 100;
  const totalAnswered = correctAnswers + incorrectAnswers;
  const accuracy = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;
  
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Left side: Progress info and bar */}
        <View style={styles.leftSection}>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${progressPercentage}%` },
              ]} 
            />
          </View>
        </View>
        
        {/* Right side: Score tracking */}
        <View style={styles.rightSection}>
          <View style={styles.scoreContainer}>
            {/* Correct answers */}
            <View style={styles.scoreItem}>
              <View style={styles.correctIndicator} />
              <Text style={styles.scoreNumber}>{correctAnswers}</Text>
            </View>
            
            {/* Incorrect answers */}
            <View style={styles.scoreItem}>
              <View style={styles.incorrectIndicator} />
              <Text style={styles.scoreNumber}>{incorrectAnswers}</Text>
            </View>
            
            {/* Accuracy percentage (only show if user has answered questions) */}
            {totalAnswered > 0 && (
              <Text style={styles.accuracyText}>
                {accuracy}%
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default SessionProgressBar;