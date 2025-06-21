import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigate } from 'react-router-native';
import { useState } from 'react';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useFlashcardStudySession } from '../../hooks/useFlashcardStudySession';
import BeginnerFlashcard from './BeginnerFlashcard';
import AdvancedFlashcard from './AdvancedFlashcard';
import SessionComplete from './SessionComplete';

const FlashcardsManager = () => {
  const { user, loading: userLoading } = useCurrentUser({ required: true });
  const level = user?.studyLevel;
  const navigate = useNavigate();

  const { words, loading: wordsLoading, error, refetch } = useFlashcardStudySession(level, 100);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRefetching, setIsRefetching] = useState(false);

  if (userLoading || wordsLoading || isRefetching) return <Text>Loading study session...</Text>;
  if (error) return <Text>Error loading study session: {error.message}</Text>;
  if (!words || words.length === 0) {
    return (
      <View>
        <Text>No words available for study. Great job - you are up to date!</Text>
        <Pressable onPress={refetch}>
          <Text>Refresh</Text>
        </Pressable>
      </View>
    );
  }

  const sessionSize = words.length;

  // Check if session is complete
  if (currentIndex >= sessionSize) {
    const handleNewSession = async () => {
      setIsRefetching(true);
      setCurrentIndex(0);
      try {
        await refetch();
      } catch (err) {
        console.error('Error fetching new flashcards:', err);
      } finally {
        setIsRefetching(false);
      }
    };

    const handleGoHome = () => {
      navigate('/');
    };

    return (
      <SessionComplete 
        onNewSession={handleNewSession}
        onGoHome={handleGoHome}
        questionsCompleted={sessionSize}
      />
    );
  }

  // Handler for when a flashcard is completed
  const handleCardCompleted = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const isBeginnerLevel = level === 'N4' || level === 'N5';
  
  return isBeginnerLevel ? (
    <BeginnerFlashcard 
      words={words} 
      user={user} 
      onCardCompleted={handleCardCompleted}
    />
  ) : (
    <AdvancedFlashcard 
      words={words} 
      user={user} 
      onCardCompleted={handleCardCompleted}
    />
  );
};

export default FlashcardsManager;