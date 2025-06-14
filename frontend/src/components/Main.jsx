import { SafeAreaView, StyleSheet } from 'react-native'; 
import { Route, Routes } from 'react-router-native';

import AppBar from './AppBar';
import SignIn from './usercomponents/SignIn';
import SignUp from './usercomponents/SignUp';
import Home from './Home';
import FlashcardsManager from './testcomponents/FlashcardsManager';
import QuestionManager from './testcomponents/QuestionManager';
import GrammarPointList from './study/GrammarPointsList';
import GrammarPointView from './study/GrammarPointView';
import WordsList from './study/WordsList';
import WordView from './study/WordView';

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
        <Route path="/signup" element={<SignUp />} />
        <Route path="/vocabularyflashcards" element={<FlashcardsManager />} />
        <Route path="/questions" element={<QuestionManager />} />
        <Route path="/grammarpoints" element={<GrammarPointList />} />
        <Route path="/grammarpoint/:name" element={<GrammarPointView />} />
        <Route path="/words" element={<WordsList />} />
        <Route path="/word/:id" element={<WordView />} />
      </Routes>
    </SafeAreaView>
  );
};

export default Main;