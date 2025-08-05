import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigate } from 'react-router-native';
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

  useEffect(() => {
    if (!user && !userLoading) {
      // Redirect to sign in if not authenticated and loading is finished
      navigate('/signin');
    }
  }, [user, userLoading, navigate]);

  if (userLoading || wordsLoading || isRefetching) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10, fontSize: 16 }}>Preparing your flashcards...</Text>
      </View>
    );
  }
  
  if (error) return <Text>Error loading study session: {error.message}</Text>;

  if (!words || words.length === 0) {
    return (
      <View>
        <Text>No words available for study. Great job - you are up to date!</Text>
        <TouchableOpacity onPress={refetch}>
          <Text>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const sessionSize = words.length;

  // Session complete logic...
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
