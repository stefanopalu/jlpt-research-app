import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useNavigate } from 'react-router-native';
import { useDebounce } from 'use-debounce';
import { useGrammarPoints } from '../../hooks/useGrammarPoints';
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
    backgroundColor: '#FF6B35', // Orange-red for problematic items
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  allGrammarButton: {
    backgroundColor: '#007AFF', // Blue for all grammar points
  },
  searchButton: {
    backgroundColor: '#007AFF', // Blue for search results
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
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

const GrammarPointList = () => {
  const { isAuthenticated } = useCurrentUser();

  const { 
    grammarPoints, // All grammar points (fallback for non-authenticated users)
    loading: allLoading,
    error: allError,
    problematicGrammarPoints, // Problematic grammar points (for authenticated users)
    problematicLoading,
    problematicError,
    searchGrammarPoints,
    searchResults,
    searchError,
    searchLoading,
  } = useGrammarPoints();
  
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      searchGrammarPoints({
        variables: { title: debouncedQuery.trim() },
      });
    }
  }, [debouncedQuery, searchGrammarPoints]);

  const handlePress = (grammarPoint) => {
    navigate(`/grammarpoint/${grammarPoint.name}`, { state: { grammarPoint } });
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
    // Show problematic grammar points for authenticated users
    displayData = problematicGrammarPoints;
    isLoading = problematicLoading;
    hasError = problematicError;
    buttonStyle = styles.button; // Orange-red for problematic
  } else {
    // Show all grammar points for non-authenticated users
    displayData = grammarPoints;
    isLoading = allLoading;
    hasError = allError;
    buttonStyle = styles.allGrammarButton; // Blue for all grammar points
  }

  // Handle loading states
  if (isLoading && !isSearching) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading grammar points...</Text>
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
    if (isAuthenticated) return 'Areas that need practice';
    return 'All Grammar Points';
  };

  // Get appropriate results count text
  const getResultsText = () => {
    if (!displayData) return '';
    
    const count = displayData.length;
    if (isSearching) {
      return `${count} search result${count !== 1 ? 's' : ''} found`;
    } else if (isAuthenticated) {
      return `${count} grammar point${count !== 1 ? 's' : ''} needing practice`;
    } else {
      return `${count} grammar point${count !== 1 ? 's' : ''} available`;
    }
  };

  // Get appropriate empty state message
  const getEmptyStateMessage = () => {
    if (isSearching) {
      return (
        <Text style={styles.noResultsText}>
          No grammar points found matching your search.
        </Text>
      );
    } else if (isAuthenticated) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>🎉 Great job!</Text>
          <Text style={styles.emptyStateText}>
            {'No problematic grammar points right now. Keep practicing to maintain your progress!'}
          </Text>
        </View>
      );
    } else {
      return (
        <Text style={styles.noResultsText}>
          No grammar points available at the moment.
        </Text>
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Grammar Points</Text>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search all grammar points..."
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
            Log in to see grammar points you need to practice based on your performance and get a personalized learning experience.
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
          displayData.map((grammarPoint) => (
            <TouchableOpacity
              key={grammarPoint.id}
              style={[styles.button, buttonStyle]}
              onPress={() => handlePress(grammarPoint)}
            >
              <Text style={styles.buttonText}>{grammarPoint.title}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default GrammarPointList;