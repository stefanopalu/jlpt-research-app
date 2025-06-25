import { useQuery } from '@apollo/client';
import { GET_READING_STUDY_SESSION } from '../graphql/queries';

const useReadingStudySession = (level, exerciseType, maxReadings = 3) => {
  console.log('useReadingStudySession called with:', { level, exerciseType, maxReadings });
  
  const { data, error, loading, refetch } = useQuery(GET_READING_STUDY_SESSION, {
    variables: {
      exerciseType,
      level,
      maxReadings,
    },
    fetchPolicy: 'cache-and-network',
  });

  // Transform the data to match the format expected by QuestionManager
  const readingSets = data?.getReadingStudySession || [];
  
  // Calculate total questions across all reading sets
  const totalQuestions = readingSets.reduce((sum, set) => sum + set.totalQuestions, 0);
  
  // Flatten all questions for compatibility with existing QuestionManager logic
  const questions = readingSets.flatMap(set => 
    set.questions.map(studyQuestion => ({
      ...studyQuestion.question,
      // Add SRS metadata for potential future use
      srsLevel: studyQuestion.srsLevel,
      successCount: studyQuestion.successCount,
      failureCount: studyQuestion.failureCount,
      isNew: studyQuestion.isNew,
    })),
  ) || [];

  return { questions, readingSets, totalQuestions, error, loading, refetch };
};

export { useReadingStudySession };