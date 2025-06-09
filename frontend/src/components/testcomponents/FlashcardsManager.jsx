import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useQuery } from '@apollo/client';
import { GET_CURRENT_USER } from '../../graphql/queries';
import { useStudySession } from '../../hooks/useStudySession';
import BeginnerFlashcard from './BeginnerFlashcard';
import AdvancedFlashcard from './AdvancedFlashcard';


const FlashcardsManager = () => {
  const { data: userData, loading: userLoading } = useQuery(GET_CURRENT_USER);
  const user = userData?.me;
  const level = user?.studyLevel;

  const { words, loading: wordsLoading, error, refetch } = useStudySession(level, 100);

  if (userLoading || wordsLoading) return <Text>Loading study session...</Text>;
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

  const isBeginnerLevel = level === 'N4' || level === 'N5';
  
  return isBeginnerLevel ? (
    <BeginnerFlashcard words={words} user={user} />
  ) : (
    <AdvancedFlashcard words={words} user={user} />
  );
};

export default FlashcardsManager;