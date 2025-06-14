import { useQuery, useLazyQuery } from '@apollo/client';
import { 
  GET_ALL_WORDS,
  GET_WORDS_BY_LEVEL, 
  GET_PROBLEMATIC_WORDS,
  FIND_WORDS, 
} from '../graphql/queries';

const useWords = (level) => {
  // Choose the right query based on whether level is provided
  const queryToUse = level ? GET_WORDS_BY_LEVEL : GET_ALL_WORDS;
  const variables = level ? { level } : undefined;

  // Get words (all or by level)
  const { data: allData, error: allError, loading: allLoading, refetch: refetchAll } = useQuery(queryToUse, {
    variables,
    fetchPolicy: 'cache-and-network',
  });

  // Get problematic words
  const { data: problematicData, error: problematicError, loading: problematicLoading, refetch: refetchProblematic } = useQuery(GET_PROBLEMATIC_WORDS, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all', // Handle auth errors gracefully
  });

  // Lazy query for search
  const [searchWords, { data: searchData, error: searchError, loading: searchLoading }] = useLazyQuery(FIND_WORDS, {
    fetchPolicy: 'cache-and-network',
  });

  // Extract words from the correct field based on which query was used
  const words = level ? allData?.wordsByLevel : allData?.allWords;
  const problematicWords = problematicData?.getProblematicWords;
  const searchResults = searchData?.findWords;

  return { 
    // All words
    words, 
    error: allError, 
    loading: allLoading,
    refetch: refetchAll,

    // Problematic words
    problematicWords,
    problematicError,
    problematicLoading,
    refetchProblematic,
    
    // Search functionality
    searchWords,
    searchResults,
    searchError,
    searchLoading,
  };
};

export { useWords };