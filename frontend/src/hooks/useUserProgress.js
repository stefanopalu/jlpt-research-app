import { useQuery } from '@apollo/client';
import { GET_CURRENT_USER } from '../graphql/queries';

const useUserProgress = () => {
  const { data, loading, refetch } = useQuery(GET_CURRENT_USER, {
    fetchPolicy: 'cache-and-network',
  });

  const user = data?.me;
  const userProgress = user?.userProgress || [];

  return { user, userProgress, loading, refetch };
};

export { useUserProgress };