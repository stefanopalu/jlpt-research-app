import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ImageBackground } from 'react-native';
import { useNavigate } from 'react-router-native';
import { useCurrentUser } from '../hooks/useCurrentUser';
import theme from '../../theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  // Featured cards (Study Materials and Flashcards)
  featuredCard: {
    backgroundColor: 'rgba(255,255,255,0.90)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  featuredSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  studyMaterialsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  studyMaterialButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  studyMaterialText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  flashcardButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: 'stretch',
  },
  flashcardButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Categories section
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  categoryCard: {
    backgroundColor: 'rgba(255,255,255,0.80)',
    borderRadius: 16,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  categoryHeader: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  vocabularyHeader: {
    backgroundColor: theme.colors.primaryLight,
  },
  grammarHeader: {
    backgroundColor: theme.colors.primaryLight,
  },
  categoryHeaderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  categoryContent: {
    backgroundColor: 'rgba(255,255,255,0.80)',
  },
  categoryItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoryItemLast: {
    borderBottomWidth: 0,
  },
  categoryItemText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    textAlign: 'center',
  },
});

const Home = () => {
  const navigate = useNavigate();
  const { user } = useCurrentUser({ required: true });
  const level = user?.studyLevel;

  const studyMaterials = [
    { key: 'grammarpoints', label: 'Grammar Points', path: '/grammarpoints' },
    { key: 'words', label: 'Words', path: '/words' },
  ];

  const vocabularyItems = [
    { key: 'kanjireading', label: 'Kanji Reading', path: '/questions?exerciseType=kanjireading' },
    { key: 'orthography', label: 'Orthography', path: '/questions?exerciseType=orthography' },
    { key: 'contextexpression', label: 'Contextually-defined expressions', path: '/questions?exerciseType=contextexpression' },
    { key: 'paraphrases', label: 'Paraphrases', path: '/questions?exerciseType=paraphrases' },
    // Only show Usage if level is not N5
    ...(level !== 'N5' ? [{ key: 'usage', label: 'Usage', path: '/questions?exerciseType=usage' }] : []),
  ];

  const grammarItems = [
    { key: 'grammarform', label: 'Grammar Form', path: '/questions?exerciseType=grammarform' },
    { key: 'sentencecomposition', label: 'Sentence Composition', path: '/questions?exerciseType=sentencecomposition' },
    { key: 'textgrammar', label: 'Text Grammar', path: '/questions?exerciseType=textgrammar' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <View style={styles.container}>
      <ImageBackground 
        source={require('../../assets/pagoda.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Study Materials Featured Card */}
            <View style={styles.featuredCard}>
              <Text style={styles.featuredTitle}>Study Materials</Text>
              <Text style={styles.featuredSubtitle}>Review grammar points and vocabulary words</Text>
              <View style={styles.studyMaterialsGrid}>
                {studyMaterials.map((item) => (
                  <Pressable
                    key={item.key}
                    style={styles.studyMaterialButton}
                    onPress={() => handleNavigation(item.path)}
                  >
                    <Text style={styles.studyMaterialText}>{item.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            {/* Categories Section */}
            <View style={styles.categoriesGrid}>
              {/* Vocabulary Card - Always Expanded */}
              <View style={styles.categoryCard}>
                <View style={[styles.categoryHeader, styles.vocabularyHeader]}>
                  <Text style={styles.categoryHeaderText}>Vocabulary</Text>
                </View>
                <View style={styles.categoryContent}>
                  {vocabularyItems.map((item, index) => (
                    <Pressable
                      key={item.key}
                      style={[
                        styles.categoryItem,
                        index === vocabularyItems.length - 1 && styles.categoryItemLast,
                      ]}
                      onPress={() => handleNavigation(item.path)}
                    >
                      <Text style={styles.categoryItemText}>{item.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Grammar Card - Always Expanded */}
              <View style={styles.categoryCard}>
                <View style={[styles.categoryHeader, styles.grammarHeader]}>
                  <Text style={styles.categoryHeaderText}>Grammar</Text>
                </View>
                <View style={styles.categoryContent}>
                  {grammarItems.map((item, index) => (
                    <Pressable
                      key={item.key}
                      style={[
                        styles.categoryItem,
                        index === grammarItems.length - 1 && styles.categoryItemLast,
                      ]}
                      onPress={() => handleNavigation(item.path)}
                    >
                      <Text style={styles.categoryItemText}>{item.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
            {/* Flashcards Featured Card */}
            <View style={styles.featuredCard}>
              <Text style={styles.featuredTitle}>Vocabulary Flashcards</Text>
              <Text style={styles.featuredSubtitle}>Practice with interactive flashcards</Text>
              <Pressable
                style={styles.flashcardButton}
                onPress={() => handleNavigation('/vocabularyflashcards')}
              >
                <Text style={styles.flashcardButtonText}>Start Practice</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

export default Home;