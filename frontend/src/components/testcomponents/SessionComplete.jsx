import React from 'react';
import { View, Text, Pressable, StyleSheet, ImageBackground } from 'react-native';
import theme from '../../../theme';

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 20,
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
    backgroundColor: 'white',
    paddingVertical: 20,
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

const SessionComplete = ({ onNewSession, onGoHome }) => {
  return (
    <ImageBackground
      source={require('../../../assets/sakura.png')}
      style={styles.background}
    >
      <View style={styles.buttonContainer}>
        <Pressable style={styles.primaryButton} onPress={onNewSession}>
          <Text style={styles.primaryButtonText}>Start New Session</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={onGoHome}>
          <Text style={styles.secondaryButtonText}>Home</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
};

export default SessionComplete;