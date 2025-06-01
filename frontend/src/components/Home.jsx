import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link, useNavigate } from 'react-router-native';
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
  const navigate = useNavigate();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the JLPT App</Text>
      <View style={styles.buttonContainer}>
        <Pressable
          onPress={() => navigate('/levelmenu?exerciseType=vocabulary')}
          style={styles.buttonShape}
        >
          <Text style={styles.buttonText}>Vocabulary Flashcards</Text>
        </Pressable>
      </View>

      <View style={styles.buttonContainer}>
        <Pressable
          onPress={() => navigate('/levelmenu?exerciseType=kanjireading')}
          style={styles.buttonShape}
        >
          <Text style={styles.buttonText}>Kanji Reading</Text>
        </Pressable>
      </View>

      <View style={styles.buttonContainer}>
        <Pressable
          onPress={() => navigate('/levelmenu?exerciseType=orthography')}
          style={styles.buttonShape}
        >
          <Text style={styles.buttonText}>Orthography</Text>
        </Pressable>
      </View>

      <View style={styles.buttonContainer}>
        <Pressable
          onPress={() => navigate('/levelmenu?exerciseType=contextexpression')}
          style={styles.buttonShape}
        >
          <Text style={styles.buttonText}>Contextually-defined expressions</Text>
        </Pressable>
      </View>

      <View style={styles.buttonContainer}>
        <Pressable
          onPress={() => navigate('/levelmenu?exerciseType=paraphrases')}
          style={styles.buttonShape}
        >
          <Text style={styles.buttonText}>Paraphrases</Text>
        </Pressable>
      </View>

      <View style={styles.buttonContainer}>
        <Pressable
          onPress={() => navigate('/levelmenu?exerciseType=usage')}
          style={styles.buttonShape}
        >
          <Text style={styles.buttonText}>Usage</Text>
        </Pressable>
      </View>

      <View style={styles.buttonContainer}>
        <Pressable
          onPress={() => navigate('/levelmenu?exerciseType=grammarform')}
          style={styles.buttonShape}
        >
          <Text style={styles.buttonText}>Grammar Form</Text>
        </Pressable>
      </View>

      <View style={styles.buttonContainer}>
        <Pressable
          onPress={() => navigate('/levelmenu?exerciseType=textgrammar')}
          style={styles.buttonShape}
        >
          <Text style={styles.buttonText}>Text Grammar</Text>
        </Pressable>
      </View>

      <View style={styles.buttonContainer}>
        <Pressable
          onPress={() => navigate('/levelmenu?exerciseType=shortpass')}
          style={styles.buttonShape}
        >
          <Text style={styles.buttonText}>Short Passage</Text>
        </Pressable>
      </View>

    </View>
  );
};

export default Home;