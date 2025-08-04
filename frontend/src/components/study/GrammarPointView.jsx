import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { useLocation, useNavigate } from 'react-router-native';
import theme from '../../../theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backgroundImage: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 18,
  },
  backButton: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  mainCard: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  grammarTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#1f2937',
  },
  explanation: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 10,
    textAlign: 'left',
    color: '#6b7280',
  },
  sectionCard: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  formationItem: {
    fontSize: 16,
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fb',
    borderRadius: 6,
    color: '#374151',
  },
  declinationItem: {
    fontSize: 16,
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fb',
    borderRadius: 6,
    color: '#374151',
  },
  exampleContainer: {
    backgroundColor: '#f8f9fb',
    padding: 16,
    marginBottom: 10,
    borderRadius: 8,
    borderLeftWidth: 9,
    borderLeftColor: theme.colors.primaryDark,
  },
  japanese: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1f2937',
  },
  english: {
    fontSize: 16,
    color: '#6b7280',
  },
  notFoundCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 20,
    textAlign: 'center',
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
        <View style={styles.header}>
          <Text style={styles.title}>Grammar Point</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.notFoundCard}>
            <Text style={styles.notFoundText}>Grammar point not found</Text>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>Back to Grammar Points</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ImageBackground 
      source={require('../../../assets/bridge.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
      
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>← Back to Grammar Points</Text>
            </TouchableOpacity>

            {/* Main Grammar Point Card */}
            <View style={styles.mainCard}>
              <Text style={styles.grammarTitle}>{grammarPoint.title}</Text>
            
              {grammarPoint.explanation && (
                <Text style={styles.explanation}>{grammarPoint.explanation}</Text>
              )}
            </View>

            {/* Formation Section */}
            {grammarPoint.grammarStructure?.formation && (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Formation</Text>
                {grammarPoint.grammarStructure.formation.map((item, index) => (
                  <Text key={index} style={styles.formationItem}>
                  • {item}
                  </Text>
                ))}
              </View>
            )}

            {/* Declinations Section */}
            {grammarPoint.grammarStructure?.declinations &&
            grammarPoint.grammarStructure.declinations.length > 0 && (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Declinations</Text>
                {grammarPoint.grammarStructure.declinations.map((item, index) => (
                  <Text key={index} style={styles.declinationItem}>
                  • {item}
                  </Text>
                ))}
              </View>
            )}

            {/* Examples Section */}
            {grammarPoint.grammarExamples && (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Examples</Text>
                {grammarPoint.grammarExamples.map((example, index) => (
                  <View key={index} style={styles.exampleContainer}>
                    <Text style={styles.japanese}>{example.japanese}</Text>
                    <Text style={styles.english}>{example.english}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
};

export default GrammarPoint;