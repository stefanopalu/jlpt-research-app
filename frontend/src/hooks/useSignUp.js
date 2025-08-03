
import { useMutation } from '@apollo/client';
import { useApolloClient } from '@apollo/client';
import { SIGN_UP } from '../graphql/mutations';
import useAuthStorage from './useAuthStorage';

const useSignUp = () => {
  const authStorage = useAuthStorage();
  const apolloClient = useApolloClient();
  const [mutate, result] = useMutation(SIGN_UP);

  const signUp = async ({ username, password, email, firstName, lastName, studyLevel, sessionLength }) => {
    const { data } = await mutate({
      variables: { username, password, email, firstName, lastName, studyLevel, sessionLength },
    });

    console.log('Returned data:', data);
    console.log('Access token:', data.signUp.value);
    await authStorage.setAccessToken(data.signUp.value);
    apolloClient.resetStore();
    return data.signUp;
  };

  return [signUp, result];
};

export default useSignUp;