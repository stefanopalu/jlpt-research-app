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
    words: [Word!]
    grammarPoints: [GrammarPoint!]
    readingContent: ReadingContent
  }

  type User {
    username: String!
    id: ID!
    userVocabularyProgress: [UserVocabularyProgress!]!
  }

  type UserVocabularyProgress {
    id: ID!
    user: User!
    word: Word!
    srsLevel: Int!
    successCount: Int!
    failureCount: Int!
    lastReviewed: String
    nextReview: String!
  }

  type StudyCard {
    id: ID
    word: Word!
    srsLevel: Int!
    successCount: Int!
    failureCount: Int!
    isNew: Boolean!
  }

  type GrammarPoint {
    id: ID!
    name: String!
    explanation: String
    structure: String
    examples: [String!]
  }

  type ReadingContent {
    id: ID!
    content: String!
    contentType: String!
    level: String!
  }

  type LoginResponse {
    value: String!
    user: User
  }

  type Query {
    allWords(level: String!): [Word!]!
    allQuestions(level: String!, type: String!): [Question!]!
    me: User
    getUserVocabularyProgress(userId: ID!): [UserVocabularyProgress!]!
    getStudySession(level: String!, limit: Int = 100): [StudyCard!]!
  }

  type Mutation {
    login(
      username: String!
      password: String!
    ): LoginResponse
    updateUserVocabularyProgress(
      wordId: ID!
      success: Boolean!
    ): UserVocabularyProgress!
  }
`

module.exports = typeDefs;