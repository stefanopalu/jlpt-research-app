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
      words {
        ...WordFields
      }
      grammarPoints {
        id
        name
        explanation
        structure
        examples
      }
      readingContent {
        id
        content
        contentType
        level
      }
    }
  }
  ${WORD_FRAGMENT}
`;

export const GET_ALL_GRAMMAR_POINTS = gql`
  query GetAllGrammarPoints {
    allGrammarPoints {
      id
      title
      name
      explanation
      grammarStructure {
        formation
        declinations
      }
      grammarExamples {
        japanese
        english
      }
    }
  }
`;

// NEW: SRS-based question study session
export const GET_QUESTION_STUDY_SESSION = gql`
  query GetQuestionStudySession($exerciseType: String!, $level: String!, $limit: Int) {
    getQuestionStudySession(exerciseType: $exerciseType, level: $level, limit: $limit) {
      id
      question {
        id
        questionText
        answers
        correctAnswer
        level
        type
        words 
        # grammarPoints 
        readingContent {
          id
          content
          contentType
          level
        }
      }
      srsLevel
      successCount
      failureCount
      isNew
    }
  }
`;

export const GET_CURRENT_USER = gql`
  query getCurrentUser {
    me {
      id
      username
      email
      firstName
      lastName
      studyLevel
      createdAt
      userFlashcardsProgress {
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
      userQuestionProgress {
        id
        srsLevel
        successCount
        failureCount
        lastReviewed
        nextReview
        responseTime
        averageResponseTime
        question {
          id
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

// Get SRS-based study session (for flashcards)
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