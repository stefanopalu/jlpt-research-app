import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, ImageBackground } from 'react-native';
import { useNavigate } from 'react-router-native';
import { useDebounce } from 'use-debounce';
import { useWords } from '../../hooks/useWords';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import theme from '../../../theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backgroundImage: {
    flex: 1,
  },
  header: {
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  title: {
    fontSize: theme.fontSizes.subheading + 22,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.primaryDark,
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 18,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 18,
    fontSize: 16,
    backgroundColor: 'white',
    paddingRight: 40,
    marginBottom: 20,
  },
  clearButton: {
    position: 'absolute',
    right: 10,
    top: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    color: '#666',
  },
  statusCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  resultCount: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 10,
  },
  searchingText: {
    fontSize: 14,
    color: theme.colors.primaryDark,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 20,
  },
  wordsContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  wordButton: {
    paddingVertical: 16,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  wordButtonLast: {
    borderBottomWidth: 0,
  },
  problematicWord: {
    borderLeftColor: '#ef4444', // Red for problematic words
  },
  allWordsWord: {
    borderLeftColor: theme.colors.primaryLight, // Theme color for all words
  },
  searchWord: {
    borderLeftColor: theme.colors.primaryDark, // Darker theme color for search results
  },
  wordText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  wordSubtext: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  emptyStateCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 10,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    textAlign: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  authPromptCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  authPromptTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  authPromptText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: theme.colors.primaryDark,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

const WordsList = () => {
  const { isAuthenticated } = useCurrentUser();

  const { 
    words, // All words (fallback for non-authenticated users)
    loading: allLoading,
    error: allError,
    problematicWords, // Problematic words (for authenticated users)
    problematicLoading,
    problematicError,
    searchWords,
    searchResults,
    searchError,
    searchLoading,
  } = useWords(); // No level filter for now - can add later

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      // Search by english - could enhance to search multiple fields
      searchWords({
        variables: { english: debouncedQuery.trim() },
      });
    }
  }, [debouncedQuery, searchWords]);

  const handlePress = (word) => {
    navigate(`/word/${word.id}`, { state: { word } });
  };

  const handleLoginPress = () => {
    navigate('/signin');
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  // Determine which data to display
  const isSearching = searchQuery.trim();
  let displayData, isLoading, hasError;

  if (isSearching) {
    // Show search results
    displayData = searchResults;
    isLoading = searchLoading;
    hasError = searchError;
  } else if (isAuthenticated) {
    // Show problematic words for authenticated users
    displayData = problematicWords;
    isLoading = problematicLoading;
    hasError = problematicError;
  } else {
    // Show all words for non-authenticated users
    displayData = words;
    isLoading = allLoading;
    hasError = allError;
  }

  // Handle loading states
  if (isLoading && !isSearching) {
    return (
      <ImageBackground 
        source={require('../../../assets/pagoda.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Words</Text>
          </View>
          <View style={styles.content}>
            <Text style={styles.loadingText}>Loading words...</Text>
          </View>
        </View>
      </ImageBackground>
    );
  }

  // Handle errors
  if (hasError && !isSearching) {
    return (
      <ImageBackground 
        source={require('../../../assets/pagoda.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Words</Text>
          </View>
          <View style={styles.content}>
            <Text style={styles.errorText}>Error: {hasError.message}</Text>
          </View>
        </View>
      </ImageBackground>
    );
  }

  // Get appropriate subtitle
  const getSubtitle = () => {
    if (isSearching) return 'Search Results';
    if (isAuthenticated) return 'Words that need practice';
    return 'All Words';
  };

  // Get appropriate results count text
  const getResultsText = () => {
    if (!displayData) return '';
    
    const count = displayData.length;
    if (isSearching) {
      return `${count} search result${count !== 1 ? 's' : ''} found`;
    } else if (isAuthenticated) {
      return `${count} word${count !== 1 ? 's' : ''} needing practice`;
    } else {
      return `${count} word${count !== 1 ? 's' : ''} available`;
    }
  };

  return (
    <ImageBackground 
      source={require('../../../assets/pagoda.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Words</Text>
        </View>
        
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Search Bar */}
            <View style={{ position: 'relative' }}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search all words..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
                clearButtonMode="never"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
                  <Text style={styles.clearButtonText}>×</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Authentication prompt for non-authenticated users */}
            {!isAuthenticated && !isSearching && (
              <View style={styles.authPromptCard}>
                <Text style={styles.authPromptTitle}>Get Personalized Learning</Text>
                <Text style={styles.authPromptText}>
                  Log in to see words you need to practice based on your performance and get a personalized vocabulary learning experience.
                </Text>
                <TouchableOpacity style={styles.loginButton} onPress={handleLoginPress}>
                  <Text style={styles.loginButtonText}>Log In</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Status and Words Combined Card */}
            <View style={styles.statusCard}>
              <Text style={styles.subtitle}>{getSubtitle()}</Text>
              
              {/* Search status */}
              {isSearching && searchLoading && (
                <Text style={styles.searchingText}>Searching...</Text>
              )}
              
              {isSearching && searchError && (
                <Text style={styles.errorText}>Search error: {searchError.message}</Text>
              )}

              {/* Results count */}
              {displayData && (
                <Text style={styles.resultCount}>{getResultsText()}</Text>
              )}

              {/* Words List */}
              {!displayData || displayData.length === 0 ? (
                <View style={{ marginTop: 10 }}>
                  {isSearching ? (
                    <Text style={styles.noResultsText}>
                      No words found matching your search.
                    </Text>
                  ) : isAuthenticated ? (
                    <View style={{ alignItems: 'center' }}>
                      <Text style={styles.emptyStateTitle}>🎉 Excellent!</Text>
                      <Text style={styles.emptyStateText}>
                        {'No problematic words right now. Keep practicing to maintain your vocabulary progress!'}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.noResultsText}>
                      No words available at the moment.
                    </Text>
                  )}
                </View>
              ) : (
                <View style={{ marginTop: 10 }}>
                  {displayData.map((word, index) => (
                    <TouchableOpacity
                      key={word.id}
                      style={[
                        styles.wordButton,
                        index === displayData.length - 1 && styles.wordButtonLast,
                      ]}
                      onPress={() => handlePress(word)}
                    >
                      <Text style={styles.wordText}>{word.kanji}</Text>
                      <Text style={styles.wordSubtext}>
                        {word.hiragana} • {word.english.join(', ')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
};

export default WordsList;