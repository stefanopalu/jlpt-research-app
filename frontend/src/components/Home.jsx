import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'react-router-native';
import theme from '../../theme';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
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

const Home = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the JLPT App</Text>
      <View style={styles.buttonContainer}>
        <Link to="/vocabularytest" style={styles.buttonShape} >
            <Text style={styles.buttonText}>Vocabulary Test</Text>
        </Link>
      </View>
    </View>
  );
};

export default Home;