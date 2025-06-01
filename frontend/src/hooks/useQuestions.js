import { useQuery } from '@apollo/client';
import { GET_ALL_QUESTIONS } from '../graphql/queries';

const useQuestions = (level, type) => {
  const { data, error, loading } = useQuery(GET_ALL_QUESTIONS, {
    variables: { level, type },
    fetchPolicy: 'cache-and-network',
  });
  const questions = data?.allQuestions;
  return { questions, error, loading };
};

export { useQuestions };