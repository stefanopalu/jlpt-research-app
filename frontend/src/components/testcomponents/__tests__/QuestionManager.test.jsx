import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { MockedProvider } from '@apollo/client/testing';

// Mock react-router-native before any other imports
jest.mock('react-router-native', () => ({
  useLocation: jest.fn(),
}));

// Mock the useQuestions hook
jest.mock('../../../hooks/useQuestions');

import QuestionManager from '../QuestionManager';
import { useLocation } from 'react-router-native';
import { useQuestions } from '../../../hooks/useQuestions';
import {
  UPDATE_USER_QUESTION_PROGRESS,
  UPDATE_USER_WORD_PROGRESS,
  UPDATE_USER_GRAMMAR_POINT_PROGRESS
} from '../../../graphql/mutations';
import { GET_CURRENT_USER } from '../../../graphql/queries';

const mockMutations = [
  {
    request: {
      query: UPDATE_USER_QUESTION_PROGRESS,
      variables: { questionId: '1', isCorrect: true }
    },
    result: { data: { updateUserQuestionProgress: { id: '1' } } }
  },
  // Mock for GET_CURRENT_USER query
  {
    request: {
      query: GET_CURRENT_USER,
      variables: {}
    },
    result: {
      data: {
        me: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          studyLevel: 'N5',
          createdAt: '2023-01-01T00:00:00.000Z',
          userFlashcardsProgress: [],
          userQuestionProgress: []
        }
      }
    }
  }
];

const mockQuestion = {
  id: '1',
  questionText: 'What is cat in Japanese?',
  answers: ['犬', '猫', '鳥', '魚'],
  correctAnswer: 1,
  words: [{ 
    id: '1',
    kanji: '猫',
    hiragana: 'ねこ',
    english: ['cat'],
    level: 'N5',
    type: 'noun'
  }],
  grammarPoints: [{ 
    id: '1',
    name: 'past tense',
    explanation: 'Past tense explanation',
    structure: 'verb + ta',
    examples: ['example1', 'example2']
  }]
};

describe('QuestionManager', () => {
  beforeEach(() => {
    useLocation.mockReturnValue({
      search: '?exerciseType=vocabulary&level=N5'
    });
    
    useQuestions.mockReturnValue({
      questions: [mockQuestion],
      loading: false,
      error: null
    });
  });

  const wrapper = ({ children }) => (
    <MockedProvider mocks={mockMutations} addTypename={false}>
      {children}
    </MockedProvider>
  );

  test('renders question correctly', async () => {
    const { getByText } = render(<QuestionManager />, { wrapper });
    
    // Wait for the component to load user data and render the question
    await waitFor(() => {
      expect(getByText('What is cat in Japanese?')).toBeTruthy();
    });
    
    expect(getByText('猫')).toBeTruthy();
  });

  test('shows loading state', () => {
    useQuestions.mockReturnValue({
      questions: null,
      loading: true,
      error: null
    });

    const { getByText } = render(<QuestionManager />, { wrapper });
    
    // Initially shows "Loading user data..." then should show "Loading questions..."
    // We need to wait for the user data to load first
    waitFor(() => {
      expect(getByText('Loading questions...')).toBeTruthy();
    });
  });
});