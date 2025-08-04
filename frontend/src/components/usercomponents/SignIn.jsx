import Text from '../Text';
import { TextInput, StyleSheet, Pressable, View, ScrollView, ImageBackground } from 'react-native';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-native';
import useSignIn from '../../hooks/useSignIn';
import * as yup from 'yup';
import theme from '../../../theme';

const initialValues = {
  username: '',
  password: '',
};

const validationSchema = yup.object().shape({
  username: yup
    .string()
    .min(2, 'Username must have at least 2 characters')
    .required('Username is required'),
  password: yup
    .string()
    .min(5, 'Password must have at least 5 characters')
    .required('Password is required'),
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'trasnparent',
  },
  backgroundImage: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: theme.fontSizes.subheading + 18,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.primaryDark,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.90)',
    marginTop: -20,
    marginBottom: 40,
    marginLeft: 20,
    marginRight: 20,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  signInButton: {
    backgroundColor: '#2c3e50',
    paddingVertical: 26,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 10,
  },
  signInButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: 4,
  },
});

export const SignInContainer = ({ navigate, signIn }) => {
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      console.log('Form submitted with:', values);
      const { username, password } = values;

      try {
        const data = await signIn({ username, password });
        console.log('Signed in:', data);
        navigate('/');
      } catch (e) {
        console.log(e);
      }
    },
  });

  return (
    <ImageBackground 
      source={require('../../../assets/sakura.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Sign in now</Text>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          {/* Username */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              placeholder="Enter your username"
              value={formik.values.username}
              onChangeText={formik.handleChange('username')}
              style={[
                styles.input,
                formik.touched.username && formik.errors.username && styles.inputError,
              ]}
            />
            {formik.touched.username && formik.errors.username && (
              <Text style={styles.errorText}>{formik.errors.username}</Text>
            )}
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              placeholder="••••••••••••••••••••"
              secureTextEntry={true}
              value={formik.values.password}
              onChangeText={formik.handleChange('password')}
              style={[
                styles.input,
                formik.touched.password && formik.errors.password && styles.inputError,
              ]}
            />
            {formik.touched.password && formik.errors.password && (
              <Text style={styles.errorText}>{formik.errors.password}</Text>
            )}
          </View>

          {/* Sign In Button */}
          <Pressable style={styles.signInButton} onPress={formik.handleSubmit}>
            <Text style={styles.signInButtonText}>Sign In</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const SignIn = () => {
  const navigate = useNavigate();
  const [signIn] = useSignIn();

  return <SignInContainer navigate={navigate} signIn={signIn} />;
};

export default SignIn;