import { useQuery } from '@apollo/client';
import { GET_ALL_GRAMMAR_POINTS } from '../graphql/queries';

const useGrammarPoints = () => {
  const { data, error, loading } = useQuery(GET_ALL_GRAMMAR_POINTS, {
    fetchPolicy: 'cache-and-network',
  });
  
  const grammarPoints = data?.allGrammarPoints;
  return { grammarPoints, error, loading };
};

export { useGrammarPoints };