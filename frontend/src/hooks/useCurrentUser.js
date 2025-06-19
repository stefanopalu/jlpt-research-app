import { useQuery } from '@apollo/client';
import { ME } from '../graphql/queries';

export const useCurrentUser = (options = {}) => {
  const { required = false } = options;
  
  const { data, loading, error } = useQuery(ME, {
    fetchPolicy: 'cache-first',
    errorPolicy: required ? 'all' : 'ignore',
  });

  return { 
    user: data?.me, 
    loading, 
    error,
    isAuthenticated: !!data?.me, 
  };
};
