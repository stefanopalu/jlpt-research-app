const gql = require('graphql-tag');

const typeDefs = gql`
  type Word {
    id: ID!
    hiragana: String!
    kanji: String!
    english: [String!]!
    level: String!
    type: String!
  }

  type Question {
    id: ID!
    questionText: String!
    answers: [String!]!
    correctAnswer: Int!
    level: String!
    type: String!
  }

  type User {
    username: String!
    id: ID!
    userProgress: [UserProgress!]!
  }

  type UserProgress {
    id: ID!
    user: User!
    word: Word!
    successCount: Int!
    failureCount: Int!
    lastReviewed: String!
    nextReview: String
  }
  
  type LoginResponse {
    value: String!
    user: User
  }

  type Query {
    allWords(level: String!): [Word!]!
    allQuestions(level: String!, type: String!): [Question!]!
    me: User
    getUserProgress(userId: ID!): [UserProgress!]!
  }

  
  type Mutation {
    login(
        username: String!
        password: String!
      ): LoginResponse
    updateUserProgress(
        wordId: ID!
        success: Boolean!
      ): UserProgress!
  }
`

module.exports = typeDefs;