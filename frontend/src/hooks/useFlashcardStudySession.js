import { useQuery } from '@apollo/client';
import { GET_FLASHCARD_STUDY_SESSION } from '../graphql/queries';

const useFlashcardStudySession = (level, limit = 100) => {
  const { data, error, loading, refetch } = useQuery(GET_FLASHCARD_STUDY_SESSION, {
    variables: { level, limit },
    fetchPolicy: 'cache-and-network',
    // Don't fetch automatically - let component decide when to start
    skip: !level,
  });

  const studyCards = data?.getFlashcardStudySession || [];
  
  // Transform to match your existing word structure
  const words = studyCards.map(card => ({
    ...card.word,
    // Add SRS metadata that might be useful
    srsLevel: card.srsLevel,
    isNew: card.isNew,
    progressId: card.id, // For tracking progress updates
  }));

  return { 
    words, 
    studyCards, // Raw data if you need SRS info
    error, 
    loading, 
    refetch, 
  };
};

export { useFlashcardStudySession };