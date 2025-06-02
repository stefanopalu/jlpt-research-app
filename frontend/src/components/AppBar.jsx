import { View, StyleSheet, Pressable, Text, ScrollView } from 'react-native';
import { Link } from 'react-router-native';
import { ME } from '../graphql/queries';
import { useQuery, useApolloClient } from '@apollo/client';
import { useNavigate } from 'react-router-native';
import useAuthStorage from '../hooks/useAuthStorage';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#24292e',
    padding: 10,
  },
  scrollContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    minWidth: '100%',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

const AppBar = () => {
  const { data } = useQuery(ME);
  const apolloClient = useApolloClient();
  const authStorage = useAuthStorage();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await authStorage.removeAccessToken();
    await apolloClient.resetStore();
    navigate('/');
  };

  console.log('ME query data:', data);
  return (
    <View style={styles.container}>
      <ScrollView horizontal>
        <View style={styles.scrollContent}>
          <Link to="/">
            <Text style={styles.text}>Home</Text>
          </Link>
          {data?.me ? (
            <>
              <Pressable onPress={handleSignOut}>
                <Text style={styles.text}>Sign Out</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Link to="/signin">
                <Text style={styles.text}>Sign In</Text>
              </Link>
              <Link to="/signup">
                <Text style={styles.text}>Sign Up</Text>
              </Link>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default AppBar;