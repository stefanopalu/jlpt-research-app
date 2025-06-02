import { useQuery } from '@apollo/client';
import { GET_CURRENT_USER } from '../graphql/queries';

const useUserFlashcardsProgress = () => {
  const { data, loading, refetch } = useQuery(GET_CURRENT_USER, {
    fetchPolicy: 'cache-and-network',
  });

  const user = data?.me;
  const userFlashcardsProgress = user?.userFlashcardsProgress || [];

  return { user, userFlashcardsProgress, loading, refetch };
};

export { useUserFlashcardsProgress };