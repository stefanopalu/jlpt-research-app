import { useQuery } from '@apollo/client';
import { GET_QUESTION_STUDY_SESSION } from '../graphql/queries';

const useQuestionStudySession = (level, exerciseType, limit = 5) => {
  console.log('useQuestionStudySession called with:', { level, exerciseType, limit });
  
  const { data, error, loading, refetch } = useQuery(GET_QUESTION_STUDY_SESSION, {
    variables: {
      exerciseType,
      level,
      limit,
    },
    fetchPolicy: 'cache-and-network',
  });

  // Transform the data to match the format expected by QuestionManager
  const questions = data?.getQuestionStudySession?.map(studyQuestion => ({
    ...studyQuestion.question,
    // Add SRS metadata for potential future use
    srsLevel: studyQuestion.srsLevel,
    successCount: studyQuestion.successCount,
    failureCount: studyQuestion.failureCount,
    isNew: studyQuestion.isNew,
  })) || [];

  return { questions, error, loading, refetch };
};

export { useQuestionStudySession };