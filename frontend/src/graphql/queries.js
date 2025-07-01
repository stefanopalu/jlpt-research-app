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

// Fragment for common GrammarPoint fields
export const GRAMMAR_POINT_FRAGMENT = gql`
  fragment GrammarPointFields on GrammarPoint {
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
`;

export const ME = gql`
  query {
    me {
      id
      username
      studyLevel
    }
  }
`;

// SRS-based question study session
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
        grammarPoints 
      }
      srsLevel
      successCount
      failureCount
      isNew
    }
  }
`;

// SRS-based question study session with readings
export const GET_READING_STUDY_SESSION = gql`
  query GetReadingStudySession($exerciseType: String!, $level: String!, $maxReadings: Int) {
    getReadingStudySession(exerciseType: $exerciseType, level: $level, maxReadings: $maxReadings) {
      readingContent {
        id
        content
        contentType
        level
      }
      questions {
        id
        question {
          id
          questionText
          answers
          correctAnswer
          level
          type
          words
          grammarPoints
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
      totalQuestions
    }
  }
`;

// Get SRS-based study session (for flashcards)
export const GET_FLASHCARD_STUDY_SESSION = gql`
  query GetFlashcardStudySession($level: String!, $limit: Int) {
    getFlashcardStudySession(level: $level, limit: $limit) {
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

// Grammar points queries
export const GET_ALL_GRAMMAR_POINTS = gql`
  query GetAllGrammarPoints {
    allGrammarPoints {
      ...GrammarPointFields
    }
  }
  ${GRAMMAR_POINT_FRAGMENT}
`;

export const FIND_GRAMMAR_POINTS = gql`
  query FindGrammarPoints($title: String) {
    findGrammarPoints(title: $title) {
      ...GrammarPointFields
    }
  }
  ${GRAMMAR_POINT_FRAGMENT}
`;

export const GET_PROBLEMATIC_GRAMMAR_POINTS = gql`
  query GetProblematicGrammarPoints {
    getProblematicGrammarPoints {
      ...GrammarPointFields
    }
  }
  ${GRAMMAR_POINT_FRAGMENT}
`;

// Words queries
export const GET_ALL_WORDS_BY_LEVEL = gql`
  query GetAllWords($level: String) {
    allWords(level: $level) {
      ...WordFields
    }
  }
  ${WORD_FRAGMENT}
`;

export const GET_ALL_WORDS = gql`
  query GetAllWords {
    allWords {
      ...WordFields
    }
  }
  ${WORD_FRAGMENT}
`;

export const FIND_WORDS = gql`
  query FindWords($kanji: String, $hiragana: String, $english: String) {
    findWords(kanji: $kanji, hiragana: $hiragana, english: $english) {
      ...WordFields
    }
  }
  ${WORD_FRAGMENT}
`;

export const GET_PROBLEMATIC_WORDS = gql`
  query GetProblematicWords {
    getProblematicWords {
      ...WordFields
    }
  }
  ${WORD_FRAGMENT}
`;

export const GET_USER_QUESTION_STATS = gql`
  query GetUserQuestionStats($userId: ID!) {
    getUserQuestionStats(userId: $userId) {
      totalAttempted
      totalQuestions
      currentlyDue
      overallAccuracy
      overallMasteryRate
      averageSrsLevel
      byType {
        _id
        attempted
        totalAvailable 
        due
        totalSuccess
        totalFailure
        questionsCorrect
        avgSrsLevel
        questionsAtLevel0
        accuracy
        masteryRate
      }
    }
  }
`;