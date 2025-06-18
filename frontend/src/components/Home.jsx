import React from 'react';
import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigate } from 'react-router-native';
import theme from '../../theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: theme.colors.tertiary,
    paddingVertical: 20,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: theme.fontSizes.subheading + 8,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  menuContainer: {
    flex: 1,
    padding: 0,
  },
  categoryGroup: {
    marginBottom: 0,
  },
  categoryButton: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  categoryText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  subItemsContainer: {
    backgroundColor: 'transparent',
  },
  subItem: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
  },
  subItemText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
  },
});

const Home = () => {
  const navigate = useNavigate();
  const [expandedCategory, setExpandedCategory] = useState(null);

  const categories = {
    study: {
      title: 'Study Materials',
      color: theme.colors.primary,
      items: [
        { key: 'grammarpoints', label: 'Grammar Points', path: '/grammarpoints' },
        { key: 'words', label: 'Words', path: '/words' },
      ],
    },
    stats: {
      title: 'Stats',
      directPath: '/stats',
      color: theme.colors.primary,
    },
    flashcards: {
      title: 'Vocabulary Flashcards',
      directPath: '/vocabularyflashcards',
      color: theme.colors.primary,
    },
    vocabulary: {
      title: 'Vocabulary',
      color: theme.colors.primaryDark,
      items: [
        { key: 'kanjireading', label: 'Kanji Reading', path: '/questions?exerciseType=kanjireading' },
        { key: 'orthography', label: 'Orthography', path: '/questions?exerciseType=orthography' },
        { key: 'contextexpression', label: 'Contextually-defined expressions', path: '/questions?exerciseType=contextexpression' },
        { key: 'paraphrases', label: 'Paraphrases', path: '/questions?exerciseType=paraphrases' },
        { key: 'usage', label: 'Usage', path: '/questions?exerciseType=usage' },
      ],
    },
    grammar: {
      title: 'Grammar',
      color: theme.colors.primaryLight,
      items: [
        { key: 'grammarform', label: 'Grammar Form', path: '/questions?exerciseType=grammarform' },
        { key: 'sentencecomposition', label: 'Sentence Composition', path: '/questions?exerciseType=sentencecomposition' },
        { key: 'textgrammar', label: 'Text Grammar', path: '/questions?exerciseType=textgrammar' },
      ],
    },
    Reading: {
      title: 'Reading',
      color: theme.colors.secondary,
      items: [
        { key: 'shortpass', label: 'Short Passages', path: '/questions?exerciseType=shortpass' },
        { key: 'mediumpass', label: 'Medium Passages', path: '/questions?exerciseType=mediumpass' },
        { key: 'inforetrieval', label: 'Information Retrieval', path: '/questions?exerciseType=inforetrieval' },
      ],
    },
  };

  const handleCategoryPress = (categoryKey) => {
    const category = categories[categoryKey];
    
    if (category.items && category.items.length > 0) {
      setExpandedCategory(expandedCategory === categoryKey ? null : categoryKey);
    } else {
      navigate(category.directPath);
    }
  };

  const handleSubItemPress = (path) => {
    navigate(path);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>JLPT App</Text>
      </View>
      
      <View style={styles.menuContainer}>
        {Object.entries(categories).map(([categoryKey, category]) => (
          <View key={categoryKey} style={styles.categoryGroup}>
            {/* Main Category Button */}
            <Pressable
              onPress={() => handleCategoryPress(categoryKey)}
              style={[styles.categoryButton, { backgroundColor: category.color }]}
            >
              <Text style={styles.categoryText}>{category.title}</Text>
            </Pressable>

            {/* Sub-items (expanded) */}
            {expandedCategory === categoryKey && category.items && (
              <View style={styles.subItemsContainer}>
                {category.items.map((item) => (
                  <Pressable
                    key={item.key}
                    onPress={() => handleSubItemPress(item.path)}
                    style={[
                      styles.subItem,
                      { backgroundColor: category.color, opacity: 0.8 },
                    ]}
                  >
                    <Text style={styles.subItemText}>{item.label}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

export default Home;
