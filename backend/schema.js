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
    words: [String!]
    grammarPoints: [String!]
    readingContent: ReadingContent
  }

  type User {
    username: String!
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    studyLevel: String!
    createdAt: String!
    userFlashcardsProgress: [UserFlashcardsProgress!]!
    userQuestionProgress: [UserQuestionProgress!]!
    userWordProgress: [UserWordProgress!]!
    userGrammarPointProgress: [UserGrammarPointProgress!]!
  }

  type UserFlashcardsProgress {
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

  type StudyQuestion {
    id: ID
    question: Question!
    srsLevel: Int!
    successCount: Int!
    failureCount: Int!
    isNew: Boolean!
  }

  type GrammarStructure {
    formation: [String!]!
    declinations: [String!]
  }

  type GrammarExample {
    japanese: String!
    english: String!
  }

  type GrammarPoint {
    id: ID!
    title: String!
    name: String!
    explanation: String
    grammarStructure: GrammarStructure
    grammarExamples: [GrammarExample!]!
  }

  input GrammarStructureInput {
    formation: [String!]!
    declinations: [String!]
  }

  input GrammarExampleInput {
    japanese: String!
    english: String!
  }

  type ReadingContent {
    id: ID!
    content: String!
    contentType: String!
    questionType: String!
    level: String!
  }

  type LoginResponse {
    value: String!
    user: User
  }

  type UserQuestionProgress {
    id: ID!
    user: User!
    question: Question!
    srsLevel: Int!
    successCount: Int!
    failureCount: Int!
    lastReviewed: String
    nextReview: String!
    responseTime: Int
    averageResponseTime: Int
  }

  type UserQuestionStats {
    totalAttempted: Int!
    currentlyDue: Int!
    overallAccuracy: Float!
    overallMasteryRate: Float!
    averageSrsLevel: Float!
    byType: [QuestionTypeStats!]!
  }

  type QuestionTypeStats {
    _id: String!
    attempted: Int!
    due: Int!
    totalSuccess: Int!
    totalFailure: Int!
    questionsCorrect: Int!
    avgSrsLevel: Float!
    questionsAtLevel0: Int!
    accuracy: Float!
    masteryRate: Float!
  }

  type UserWordProgress {
    id: ID!
    user: User!
    word: Word!
    successCount: Int!
    failureCount: Int!
    lastReviewed: String
  }

  type UserGrammarPointProgress {
    id: ID!
    user: User!
    grammarPoint: GrammarPoint!
    successCount: Int!
    failureCount: Int!
    lastReviewed: String
  }

  type Query {
    allWords: [Word!]! 
    wordsByLevel(level: String!): [Word!]! 
    findWords(kanji: String, hiragana: String, english: String): [Word!]!
    allGrammarPoints: [GrammarPoint!]!
    findGrammarPoints(name: String, title: String): [GrammarPoint!]!
    allQuestions(level: String!, type: String!): [Question!]!
    findQuestions(level: String, type: String, word: String, grammarPoint: String, questionText: String): [Question!]!
    me: User
    getUserFlashcardsProgress(userId: ID!): [UserFlashcardsProgress!]!
    getFlashcardStudySession(level: String!, limit: Int = 100): [StudyCard!]!
    getQuestionStudySession(exerciseType: String!, level: String!, limit: Int = 50): [StudyQuestion!]!
    getUserQuestionProgress(userId: ID!): [UserQuestionProgress!]!
    getUserQuestionStats(userId: ID!): UserQuestionStats!
    getUserWordProgress(userId: ID!): [UserWordProgress!]!
    getUserGrammarPointProgress(userId: ID!): [UserGrammarPointProgress!]!
    getProblematicGrammarPoints: [GrammarPoint!]!
    getProblematicWords: [Word!]!
  }

  type Mutation {
    login(
      username: String!
      password: String!
    ): LoginResponse
    signUp(
      username: String!
      password: String!
      email: String!
      firstName: String!
      lastName: String!
      studyLevel: String!
    ): LoginResponse
    updateUserFlashcardsProgress(
      wordId: ID!
      isCorrect: Boolean!
    ): UserFlashcardsProgress!
    updateUserQuestionProgress(
      questionId: ID!
      isCorrect: Boolean!
      responseTime: Int
    ): UserQuestionProgress!
    updateUserWordProgress(
      word: String!
      isCorrect: Boolean!
    ): UserWordProgress!
    updateUserGrammarPointProgress(
      GPname: String!
      isCorrect: Boolean!
    ): UserGrammarPointProgress!
    updateWord(
      id: ID!
      hiragana: String
      kanji: String
      english: [String!]
      level: String
      type: String
    ): Word!
    updateQuestion(
      id: ID!
      questionText: String
      answers: [String!]
      correctAnswer: Int
      level: String
      type: String
      words: [String!]
      grammarPoints: [String!]
    ): Question!
    updateGrammarPoint(
      id: ID!
      title: String
      name: String
      explanation: String
      grammarStructure: GrammarStructureInput
      grammarExamples: [GrammarExampleInput!]
    ): GrammarPoint!
    deleteWord(id: ID!): Boolean!
    deleteQuestion(id: ID!): Boolean!
    deleteGrammarPoint(id: ID!): Boolean!
  }
`;

module.exports = typeDefs;