import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, ImageBackground } from 'react-native';
import { useNavigate } from 'react-router-native';
import { useDebounce } from 'use-debounce';
import { useGrammarPoints } from '../../hooks/useGrammarPoints';
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
  grammarButton: {
    paddingVertical: 16,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  grammarButtonLast: {
    borderBottomWidth: 0,
  },
  grammarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
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
  let displayData, isLoading, hasError;

  if (isSearching) {
    // Show search results
    displayData = searchResults;
    isLoading = searchLoading;
    hasError = searchError;
  } else if (isAuthenticated) {
    // Show problematic grammar points for authenticated users
    displayData = problematicGrammarPoints;
    isLoading = problematicLoading;
    hasError = problematicError;
  } else {
    // Show all grammar points for non-authenticated users
    displayData = grammarPoints;
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
            <Text style={styles.title}>Grammar Points</Text>
          </View>
          <View style={styles.content}>
            <Text style={styles.loadingText}>Loading grammar points...</Text>
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
            <Text style={styles.title}>Grammar Points</Text>
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

  return (
    <ImageBackground 
      source={require('../../../assets/pagoda.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Grammar Points</Text>
        </View>
        
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Search Bar */}
            <View style={{ position: 'relative' }}>
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

            {/* Authentication prompt for non-authenticated users */}
            {!isAuthenticated && !isSearching && (
              <View style={styles.authPromptCard}>
                <Text style={styles.authPromptTitle}>Get Personalized Learning</Text>
                <Text style={styles.authPromptText}>
                  Log in to see grammar points you need to practice based on your performance and get a personalized learning experience.
                </Text>
                <TouchableOpacity style={styles.loginButton} onPress={handleLoginPress}>
                  <Text style={styles.loginButtonText}>Log In</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Status and Grammar Points Combined Card */}
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

              {/* Grammar Points List */}
              {!displayData || displayData.length === 0 ? (
                <View style={{ marginTop: 10 }}>
                  {isSearching ? (
                    <Text style={styles.noResultsText}>
                      No grammar points found matching your search.
                    </Text>
                  ) : isAuthenticated ? (
                    <View style={{ alignItems: 'center' }}>
                      <Text style={styles.emptyStateTitle}>🎉 Great job!</Text>
                      <Text style={styles.emptyStateText}>
                        {'No problematic grammar points right now. Keep practicing to maintain your progress!'}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.noResultsText}>
                      No grammar points available at the moment.
                    </Text>
                  )}
                </View>
              ) : (
                <View style={{ marginTop: 10 }}>
                  {displayData.map((grammarPoint, index) => (
                    <TouchableOpacity
                      key={grammarPoint.id}
                      style={[
                        styles.grammarButton,
                        index === displayData.length - 1 && styles.grammarButtonLast,
                      ]}
                      onPress={() => handlePress(grammarPoint)}
                    >
                      <Text style={styles.grammarText}>{grammarPoint.title}</Text>
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

export default GrammarPointList;