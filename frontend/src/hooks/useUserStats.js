import { useQuery } from '@apollo/client';
import { GET_USER_QUESTION_STATS } from '../graphql/queries';
import { ME } from '../graphql/queries';

export const useUserStats = () => {
  // First get the user with existing ME query
  const { data: userData, loading: userLoading } = useQuery(ME, {
    fetchPolicy: 'cache-and-network',
  });
  
  const user = userData?.me;
  
  console.log('useUserStats - user from ME query:', user);
  
  // Then get stats using the user ID
  const { data: statsData, loading: statsLoading, error } = useQuery(GET_USER_QUESTION_STATS, {
    variables: { userId: user?.id },
    skip: !user?.id,
    fetchPolicy: 'cache-and-network',
  });

  const loading = userLoading || statsLoading;
  const stats = statsData?.getUserQuestionStats;

  console.log('useUserStats - final result:', { user, stats, loading, error });

  return { user, stats, loading, error };
};