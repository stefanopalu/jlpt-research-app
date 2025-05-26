import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigate, useLocation } from 'react-router-native';
import theme from '../../theme';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  title: {
    fontSize: 24,
    marginBottom: 32,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginVertical: 10,
  },
  buttonShape: {
    paddingVertical: 20,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.bold,
    textAlign: 'center',
  },
});

const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];

const LevelMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const exerciseType = params.get('exerciseType') || 'vocabulary';

  const handleSelectLevel = (level) => {
    if (exerciseType === 'vocabulary') {
        navigate(`/vocabularytest?level=${level}`);
    } else {
        navigate(`/questions?exerciseType=${exerciseType}&level=${level}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your JLPT Level for {exerciseType}</Text>
      {levels.map((level) => (
        <View key={level} style={styles.buttonContainer}>
          <Pressable
            onPress={() => handleSelectLevel(level)}
            style={styles.buttonShape}
          >
            <Text style={styles.buttonText}>{level}</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
};

export default LevelMenu;