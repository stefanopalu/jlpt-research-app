import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useNavigate } from 'react-router-native';
import { useDebounce } from 'use-debounce';
import { useWords } from '../../hooks/useWords';
import { useCurrentUser } from '../../hooks/useCurrentUser';


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  searchContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    paddingRight: 40,
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
    backgroundColor: '#FF6B35', // Orange-red for problematic words
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  allWordsButton: {
    backgroundColor: '#17a2b8', // Teal for all words
  },
  searchButton: {
    backgroundColor: '#007AFF', // Blue for search results
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  wordInfo: {
    marginTop: 4,
  },
  wordSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  noResultsText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  resultCount: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  searchingText: {
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyState: {
    textAlign: 'center',
    marginTop: 40,
    padding: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  authPrompt: {
    textAlign: 'center',
    marginTop: 20,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  authPromptTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 8,
  },
  authPromptText: {
    fontSize: 16,
    color: '#6c757d',
    lineHeight: 24,
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
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
  let displayData, isLoading, hasError, buttonStyle;

  if (isSearching) {
    // Show search results
    displayData = searchResults;
    isLoading = searchLoading;
    hasError = searchError;
    buttonStyle = styles.searchButton;
  } else if (isAuthenticated) {
    // Show problematic words for authenticated users
    displayData = problematicWords;
    isLoading = problematicLoading;
    hasError = problematicError;
    buttonStyle = styles.button; // Orange-red for problematic
  } else {
    // Show all words for non-authenticated users
    displayData = words;
    isLoading = allLoading;
    hasError = allError;
    buttonStyle = styles.allWordsButton; // Teal for all words
  }

  // Handle loading states
  if (isLoading && !isSearching) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading words...</Text>
      </View>
    );
  }

  // Handle errors
  if (hasError && !isSearching) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {hasError.message}</Text>
      </View>
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

  // Get appropriate empty state message
  const getEmptyStateMessage = () => {
    if (isSearching) {
      return (
        <Text style={styles.noResultsText}>
          No words found matching your search.
        </Text>
      );
    } else if (isAuthenticated) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>🎉 Excellent!</Text>
          <Text style={styles.emptyStateText}>
            {'No problematic words right now. Keep practicing to maintain your vocabulary progress!'}
          </Text>
        </View>
      );
    } else {
      return (
        <Text style={styles.noResultsText}>
          No words available at the moment.
        </Text>
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Words</Text>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
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

      <Text style={styles.subtitle}>{getSubtitle()}</Text>
      {/* Authentication prompt for non-authenticated users */}
      {!isAuthenticated && !isSearching && (
        <View style={styles.authPrompt}>
          <Text style={styles.authPromptTitle}>Get Personalized Learning</Text>
          <Text style={styles.authPromptText}>
            Log in to see words you need to practice based on your performance and get a personalized vocabulary learning experience.
          </Text>
          <TouchableOpacity style={styles.loginButton} onPress={handleLoginPress}>
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>
      )}

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

      <ScrollView>
        {!displayData || displayData.length === 0 ? (
          getEmptyStateMessage()
        ) : (
          displayData.map((word) => (
            <TouchableOpacity
              key={word.id}
              style={[styles.button, buttonStyle]}
              onPress={() => handlePress(word)}
            >
              <Text style={styles.buttonText}>{word.kanji}</Text>
              <View style={styles.wordInfo}>
                <Text style={styles.wordSubtext}>
                  {word.hiragana} • {word.english.join(', ')}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default WordsList;