import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { gql, useQuery } from '@apollo/client';
import WordCard from './WordCard';

import { GET_ALL_WORDS } from '../graphql/queries';

const WordsList = () => {
  const { loading, error, data } = useQuery(GET_ALL_WORDS);

  if (loading) return <Text>Loading words...</Text>;
  if (error) return <Text>Error loading words: {error.message}</Text>;

  return (
    <FlatList
      data={data.allWords}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <WordCard word={item} />}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 12,
  },
});

export default WordsList;