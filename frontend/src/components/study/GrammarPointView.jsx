import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocation, useNavigate } from 'react-router-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  backButton: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#007AFF',
  },
  explanation: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
    color: '#666',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
    color: '#333',
  },
  formationItem: {
    fontSize: 16,
    marginBottom: 8,
    paddingLeft: 16,
    color: '#444',
  },
  declinationItem: {
    fontSize: 16,
    marginBottom: 8,
    paddingLeft: 16,
    color: '#444',
  },
  exampleContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  japanese: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  english: {
    fontSize: 16,
    color: '#666',
  },
});

const GrammarPoint = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const grammarPoint = location.state?.grammarPoint;

  const handleBack = () => {
    navigate('/grammarpoints');
  };

  if (!grammarPoint) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Grammar point not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Back to Grammar Points</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backButtonText}>← Back to Grammar Points</Text>
      </TouchableOpacity>
      
      <ScrollView>
        <Text style={styles.title}>{grammarPoint.title}</Text>
        
        {grammarPoint.explanation && (
          <Text style={styles.explanation}>{grammarPoint.explanation}</Text>
        )}

        {grammarPoint.grammarStructure?.formation && (
          <View>
            <Text style={styles.sectionTitle}>Formation</Text>
            {grammarPoint.grammarStructure.formation.map((item, index) => (
              <Text key={index} style={styles.formationItem}>
                • {item}
              </Text>
            ))}
          </View>
        )}

        {grammarPoint.grammarStructure?.declinations && 
         grammarPoint.grammarStructure.declinations.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Declinations</Text>
            {grammarPoint.grammarStructure.declinations.map((item, index) => (
              <Text key={index} style={styles.declinationItem}>
                • {item}
              </Text>
            ))}
          </View>
        )}

        {grammarPoint.grammarExamples && (
          <View>
            <Text style={styles.sectionTitle}>Examples</Text>
            {grammarPoint.grammarExamples.map((example, index) => (
              <View key={index} style={styles.exampleContainer}>
                <Text style={styles.japanese}>{example.japanese}</Text>
                <Text style={styles.english}>{example.english}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default GrammarPoint;