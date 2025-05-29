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
  mutation UpdateUserVocabularyProgress($wordId: ID!, $success: Boolean!) {
    updateUserVocabularyProgress(wordId: $wordId, success: $success) {
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