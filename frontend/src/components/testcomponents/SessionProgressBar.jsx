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
  progressText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },

});

const SessionProgressBar = ({ currentQuestion, totalQuestions }) => {
  const progressPercentage = (currentQuestion / totalQuestions) * 100;
  
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Left side: Progress info and bar */}
        <View style={styles.leftSection}>
          <Text style={styles.progressText}>
            {currentQuestion}/{totalQuestions}
          </Text>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${progressPercentage}%` },
              ]} 
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default SessionProgressBar;