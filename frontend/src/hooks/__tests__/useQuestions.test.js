import { renderHook } from '@testing-library/react-native';
import { MockedProvider } from '@apollo/client/testing';
import React from 'react';
import { useQuestions } from '../useQuestions';
import { GET_ALL_QUESTIONS } from '../../graphql/queries';

const mocks = [
  {
    request: {
      query: GET_ALL_QUESTIONS,
      variables: {
        level: 'N5',
        type: 'vocabulary',
      },
    },
    result: {
      data: {
        allQuestions: [
          {
            id: '1',
            questionText: 'What is cat in Japanese?',
            answers: ['犬', '猫', '鳥', '魚'],
            correctAnswer: 1,
            level: 'N5',
            type: 'vocabulary',
            words: [],
            grammarPoints: [],
            readingContent: null,
          },
        ],
      },
    },
  },
];

const wrapper = ({ children }) => (
  <MockedProvider mocks={mocks} addTypename={false}>
    {children}
  </MockedProvider>
);

describe('useQuestions', () => {
  test('should return loading initially', () => {
    const { result } = renderHook(() => useQuestions('N5', 'vocabulary'), {
      wrapper,
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.questions).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });
});