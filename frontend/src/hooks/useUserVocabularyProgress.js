import { useQuery } from '@apollo/client';
import { GET_CURRENT_USER } from '../graphql/queries';

const useUserVocabularyProgress = () => {
  const { data, loading, refetch } = useQuery(GET_CURRENT_USER, {
    fetchPolicy: 'cache-and-network',
  });

  const user = data?.me;
  const userVocabularyProgress = user?.userVocabularyProgress || [];

  return { user, userVocabularyProgress, loading, refetch };
};

export { useUserVocabularyProgress };