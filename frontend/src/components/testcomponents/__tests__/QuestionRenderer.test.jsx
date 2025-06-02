import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import QuestionRenderer from '../QuestionRenderer';

describe('QuestionRenderer', () => {
  const mockQuestion = {
    id: '1',
    questionText: 'What is the Japanese word for cat?',
    answers: ['犬', '猫', '鳥', '魚'],
    correctAnswer: 1,
  };

  const mockOnAnswerSelected = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders question text', () => {
    const { getByText } = render(
      <QuestionRenderer 
        question={mockQuestion}
        onAnswerSelected={mockOnAnswerSelected}
      />,
    );

    expect(getByText('What is the Japanese word for cat?')).toBeTruthy();
  });

  test('renders all answer options', () => {
    const { getByText } = render(
      <QuestionRenderer 
        question={mockQuestion}
        onAnswerSelected={mockOnAnswerSelected}
      />,
    );

    expect(getByText('犬')).toBeTruthy();
    expect(getByText('猫')).toBeTruthy();
    expect(getByText('鳥')).toBeTruthy();
    expect(getByText('魚')).toBeTruthy();
  });

  test('calls onAnswerSelected when answer is pressed', () => {
    const { getByText } = render(
      <QuestionRenderer 
        question={mockQuestion}
        onAnswerSelected={mockOnAnswerSelected}
      />,
    );

    fireEvent.press(getByText('猫'));

    expect(mockOnAnswerSelected).toHaveBeenCalledWith(1);
  });
});