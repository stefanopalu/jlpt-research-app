import { gql } from '@apollo/client';

export const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
      user {
        username
        id
      }
    }
  }
`;

export const UPDATE_USER_VOCABULARY_PROGRESS = gql`
  mutation UpdateUserVocabularyProgress($wordId: ID!, $isCorrect: Boolean!) {
    updateUserVocabularyProgress(wordId: $wordId, isCorrect: $isCorrect) {
      id
      srsLevel
      successCount
      failureCount
      lastReviewed
      nextReview
      word {
        id
      }
    }
  }
`;

export const UPDATE_USER_QUESTION_PROGRESS = gql`
  mutation UpdateUserQuestionProgress($questionId: ID!, $isCorrect: Boolean!) {
    updateUserQuestionProgress(questionId: $questionId, isCorrect: $isCorrect) {
      id
      successCount
      failureCount
      lastReviewed
      question {
        id
      }
    }
  }
`;

export const UPDATE_USER_WORD_PROGRESS = gql`
  mutation UpdateUserWordProgress($wordKanji: String!, $isCorrect: Boolean!) {
    updateUserWordProgress(wordKanji: $wordKanji, isCorrect: $isCorrect) {
      id
      successCount
      failureCount
      lastReviewed
      word {
        id
        kanji
        hiragana
      }
    }
  }
`;

export const UPDATE_USER_GRAMMAR_POINT_PROGRESS = gql`
  mutation UpdateUserGrammarPointProgress($GPname: String!, $isCorrect: Boolean!) {
    updateUserGrammarPointProgress(GPname: $GPname, isCorrect: $isCorrect) {
      id
      successCount
      failureCount
      lastReviewed
      grammarPoint {
        id
        name
      }
    }
  }
`;