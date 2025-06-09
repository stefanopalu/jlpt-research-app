import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import QuestionRenderer from '../QuestionRenderer';

describe('QuestionRenderer', () => {
  const mockQuestion = {
    id: '1',
    questionText: 'What is the Japanese word for cat?',
    answers: ['犬', '猫', '鳥', '魚'],
    correctAnswer: 1,
  };

  const mockOnAnswerSelected = jest.fn();
  let renderResult;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    // Clean up any rendered components
    if (renderResult) {
      act(() => {
        renderResult.unmount();
      });
      renderResult = null;
    }
    
    // Clean up timers
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  test('renders question text', () => {
    renderResult = render(
      <QuestionRenderer 
        question={mockQuestion}
        onAnswerSelected={mockOnAnswerSelected}
      />,
    );

    const { getByText } = renderResult;
    expect(getByText('What is the Japanese word for cat?')).toBeTruthy();
  });

  test('renders all answer options', () => {
    renderResult = render(
      <QuestionRenderer 
        question={mockQuestion}
        onAnswerSelected={mockOnAnswerSelected}
      />,
    );

    const { getByText } = renderResult;
    expect(getByText('犬')).toBeTruthy();
    expect(getByText('猫')).toBeTruthy();
    expect(getByText('鳥')).toBeTruthy();
    expect(getByText('魚')).toBeTruthy();
  });

  test('calls onAnswerSelected when answer is pressed', () => {
    renderResult = render(
      <QuestionRenderer 
        question={mockQuestion}
        onAnswerSelected={mockOnAnswerSelected}
      />,
    );

    const { getByText } = renderResult;

    act(() => {
      fireEvent.press(getByText('猫'));
    });

    expect(mockOnAnswerSelected).toHaveBeenCalledWith(1);
    expect(mockOnAnswerSelected).toHaveBeenCalledTimes(1);
  });

  test('handles multiple answer selections', () => {
    renderResult = render(
      <QuestionRenderer 
        question={mockQuestion}
        onAnswerSelected={mockOnAnswerSelected}
      />,
    );

    const { getByText } = renderResult;

    act(() => {
      fireEvent.press(getByText('犬')); // First answer (index 0)
      fireEvent.press(getByText('魚')); // Fourth answer (index 3)
    });

    expect(mockOnAnswerSelected).toHaveBeenCalledTimes(2);
    expect(mockOnAnswerSelected).toHaveBeenNthCalledWith(1, 0);
    expect(mockOnAnswerSelected).toHaveBeenNthCalledWith(2, 3);
  });

  test('renders with empty answers array', () => {
    const questionWithNoAnswers = {
      ...mockQuestion,
      answers: [],
    };

    renderResult = render(
      <QuestionRenderer 
        question={questionWithNoAnswers}
        onAnswerSelected={mockOnAnswerSelected}
      />,
    );

    const { getByText } = renderResult;
    expect(getByText('What is the Japanese word for cat?')).toBeTruthy();
    // Should not crash when no answers
  });

  test('handles missing onAnswerSelected prop gracefully', () => {
    renderResult = render(
      <QuestionRenderer 
        question={mockQuestion}
        // onAnswerSelected prop intentionally missing
      />,
    );

    const { getByText } = renderResult;

    // Should not crash when pressing answer without callback
    act(() => {
      fireEvent.press(getByText('猫'));
    });

    // Should render normally
    expect(getByText('What is the Japanese word for cat?')).toBeTruthy();
  });
});