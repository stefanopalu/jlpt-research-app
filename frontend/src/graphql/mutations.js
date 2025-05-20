import { gql } from '@apollo/client';

export const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
      user {
        username
        id
      }
    }
  }
`
export const UPDATE_USER_PROGRESS = gql`
  mutation UpdateUserProgress($wordId: ID!, $success: Boolean!) {
    updateUserProgress(wordId: $wordId, success: $success) {
      id
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