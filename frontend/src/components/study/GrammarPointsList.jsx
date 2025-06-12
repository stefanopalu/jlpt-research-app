import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigate } from 'react-router-native';
import { useGrammarPoints } from '../../hooks/useGrammarPoints';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

const GrammarPointList = () => {
  const { grammarPoints, error, loading } = useGrammarPoints();
  const navigate = useNavigate();

  const handlePress = (grammarPoint) => {
    navigate(`/grammarpoint/${grammarPoint.name}`, { state: { grammarPoint } });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading grammar points...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Grammar Points</Text>
      <ScrollView>
        {grammarPoints?.map((grammarPoint) => (
          <TouchableOpacity
            key={grammarPoint.id}
            style={styles.button}
            onPress={() => handlePress(grammarPoint)}
          >
            <Text style={styles.buttonText}>{grammarPoint.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default GrammarPointList;