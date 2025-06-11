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
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
    color: "white",
    fontFamily: 'monospace',
    textAlign: 'center',
    minWidth: 55,
  },
});

const SessionProgressBar = ({ currentQuestion, totalQuestions, elapsedTime, currentQuestionTime }) => {
  const progressPercentage = (currentQuestion / totalQuestions) * 100;
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Left side: Progress info and bar */}
        <View style={styles.leftSection}>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${progressPercentage}%` }
              ]} 
            />
          </View>
        </View>
        
        {/* Right side: Timers */}
        <View style={styles.rightSection}>
          <Text style={styles.timeText}>
            {formatTime(elapsedTime)}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default SessionProgressBar;