import { useQuery, useLazyQuery } from '@apollo/client';
import { useCurrentUser } from './useCurrentUser';
import { GET_ALL_GRAMMAR_POINTS, FIND_GRAMMAR_POINTS, GET_PROBLEMATIC_GRAMMAR_POINTS } from '../graphql/queries';

const useGrammarPoints = () => {
  const { isAuthenticated } = useCurrentUser();
  
  // Get all grammar points
  const { data: allData, error: allError, loading: allLoading, refetch: refetchAll } = useQuery(GET_ALL_GRAMMAR_POINTS, {
    fetchPolicy: 'cache-and-network',
  });

  // Get problematic grammar points
  const { data: problematicData, error: problematicError, loading: problematicLoading, refetch: refetchProblematic } = useQuery(GET_PROBLEMATIC_GRAMMAR_POINTS, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all', 
    skip: !isAuthenticated,
  });

  // Lazy query for search
  const [searchGrammarPoints, { data: searchData, error: searchError, loading: searchLoading }] = useLazyQuery(FIND_GRAMMAR_POINTS, {
    fetchPolicy: 'cache-and-network',
  });

  const grammarPoints = allData?.allGrammarPoints;
  const problematicGrammarPoints = problematicData?.getProblematicGrammarPoints;
  const searchResults = searchData?.findGrammarPoints;

  return { 
    // All grammar points
    grammarPoints, 
    error: allError, 
    loading: allLoading,
    refetch: refetchAll,

    // Problematic grammar points
    problematicGrammarPoints,
    problematicError,
    problematicLoading,
    refetchProblematic,
    
    // Search functionality
    searchGrammarPoints,
    searchResults,
    searchError,
    searchLoading,
  };
};

export { useGrammarPoints };