import { gql } from '@apollo/client';

export const GET_ALL_WORDS = gql`
  query GetAllWords($level: String) {
    allWords(level: $level) {
      id
      kanji
      hiragana
      english
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
      userProgress {
        id
        successCount
        lastReviewed
        nextReview
        word {
          id
          hiragana
          english
        }
      }
    }
  }
`

export const ME = gql`
  query {
    me {
      id
      username
    }
  }
`