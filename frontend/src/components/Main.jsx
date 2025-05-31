import { gql, useQuery } from '@apollo/client';
import { SafeAreaView, View, StyleSheet } from 'react-native'; 
import { Route, Routes, Navigate } from 'react-router-native';

import AppBar from './AppBar'
import SignIn from './SignIn'
import Home from './Home';
import VocabularyTest from './testcomponents/VocabularyTest';
import LevelMenu from './LevelMenu';
import QuestionManager from './testcomponents/QuestionManager';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const Main = () => {
  return (
     <SafeAreaView style={styles.container}>
      <AppBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/levelmenu" element={<LevelMenu />} />
        <Route path="/vocabularytest" element={<VocabularyTest />} />
        <Route path="/questions" element={<QuestionManager />} />
      </Routes>
    </SafeAreaView>
  );
};

export default Main;