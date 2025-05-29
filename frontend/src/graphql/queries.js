import { gql } from '@apollo/client';

// Fragment for common Word fields
export const WORD_FRAGMENT = gql`
  fragment WordFields on Word {
    id
    kanji
    hiragana
    english
    level
    type
  }
`;

export const GET_ALL_WORDS = gql`
  query GetAllWords($level: String!) {
    allWords(level: $level) {
      ...WordFields
    }
  }
  ${WORD_FRAGMENT}
`;

export const GET_ALL_QUESTIONS = gql`
  query GetAllQuestions($level: String!, $type: String!) {
    allQuestions(level: $level, type: $type) {
      id
      questionText
      answers
      correctAnswer
      level
      type
    }
  }
`;

export const GET_CURRENT_USER = gql`
  query getCurrentUser {
    me {
      id
      username
      userVocabularyProgress {
        id
        srsLevel
        successCount
        failureCount
        lastReviewed
        nextReview
        word {
          ...WordFields
        }
      }
    }
  }
  ${WORD_FRAGMENT}
`;

export const ME = gql`
  query {
    me {
      id
      username
    }
  }
`;

// Get SRS-based study session
export const GET_STUDY_SESSION = gql`
  query GetStudySession($level: String!, $limit: Int) {
    getStudySession(level: $level, limit: $limit) {
      id
      word {
        ...WordFields
      }
      srsLevel
      successCount
      failureCount
      isNew
    }
  }
  ${WORD_FRAGMENT}
`;