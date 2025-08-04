import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'react-router-native';
import { ME } from '../graphql/queries';
import { FontAwesome } from '@expo/vector-icons';
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
  iconButton: {
    padding: 8,
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
      <View style={styles.scrollContent}>
        <TouchableOpacity onPress={() => navigate('/')} style={styles.iconButton}>
          <FontAwesome name="home" size={20} color="white" />
        </TouchableOpacity>
        {data?.me && (
          <TouchableOpacity onPress={() => navigate('/stats')} style={styles.iconButton}>
            <FontAwesome name="bar-chart" size={20} color="white" />
          </TouchableOpacity>
        )}
        {data?.me ? (
          <TouchableOpacity onPress={handleSignOut} style={styles.iconButton}>
            <FontAwesome name="sign-out" size={20} color="white" />
          </TouchableOpacity>
        ) : (
          <>
            <Link to="/signin" style={styles.iconButton}>
              <FontAwesome name="sign-in" size={20} color="white" />
            </Link>
            <Link to="/signup" style={styles.iconButton}>
              <FontAwesome name="user-plus" size={20} color="white" />
            </Link>
          </>
        )}
      </View>
    </View>
  );
};

export default AppBar;