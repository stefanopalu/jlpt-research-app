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

export const SIGN_UP = gql`
  mutation SignUp(
    $username: String!
    $password: String!
    $email: String!
    $firstName: String!
    $lastName: String!
    $studyLevel: String!
    $sessionLength: String!
  ) {
    signUp(
      username: $username
      password: $password
      email: $email
      firstName: $firstName
      lastName: $lastName
      studyLevel: $studyLevel
      sessionLength: $sessionLength
    ) {
      value
      user {
        id
        username
        email
        firstName
        lastName
        studyLevel
        sessionLength
        createdAt
      }
    }
  }
`;

export const UPDATE_USER_FLASHCARDS_PROGRESS = gql`
  mutation UpdateUserFlashcardsProgress($wordId: ID!, $isCorrect: Boolean!) {
    updateUserFlashcardsProgress(wordId: $wordId, isCorrect: $isCorrect) {
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
  mutation UpdateUserQuestionProgress($questionId: ID!, $isCorrect: Boolean!, $responseTime: Int) {
    updateUserQuestionProgress(questionId: $questionId, isCorrect: $isCorrect, responseTime: $responseTime) {
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
`;

export const UPDATE_USER_WORD_PROGRESS = gql`
  mutation UpdateUserWordProgress($word: String!, $isCorrect: Boolean!) {
    updateUserWordProgress(word: $word, isCorrect: $isCorrect) {
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