import { useMutation } from '@apollo/client';
import { useApolloClient } from '@apollo/client';
import { LOGIN } from '../graphql/mutations';
import useAuthStorage from './useAuthStorage';

const useSignIn = () => {
  const authStorage = useAuthStorage();
  const apolloClient = useApolloClient();
  const [mutate, result] = useMutation(LOGIN);

  const signIn = async ({ username, password }) => {
    const { data } = await mutate({
      variables: { username, password },
    });

    console.log('Returned data:', data);
    console.log('Access token:', data.login.value);
    await authStorage.setAccessToken(data.login.value);
    apolloClient.resetStore();
    return data.login;
  };

  return [signIn, result];
};

export default useSignIn;