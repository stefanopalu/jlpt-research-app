import { useQuery } from '@apollo/client';
import { GET_CURRENT_USER } from '../graphql/queries';

const useUserQuestionProgress = () => {
  const { data, loading, refetch } = useQuery(GET_CURRENT_USER, {
    fetchPolicy: 'cache-and-network',
  });

  const user = data?.me;
  const userQuestionProgress = user?.userQuestionProgress || [];

  return { user, userQuestionProgress, loading, refetch };
};

export { useUserQuestionProgress };