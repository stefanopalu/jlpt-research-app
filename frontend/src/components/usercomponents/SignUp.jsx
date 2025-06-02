import Text from '../Text';
import { TextInput, StyleSheet, Pressable, View } from 'react-native';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-native';
import useSignUp from '../../hooks/useSignUp';
import * as yup from 'yup';
import theme from '../../../theme';

const initialValues = {
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  firstName: '',
  lastName: '',
  studyLevel: '',
};

const validationSchema = yup.object().shape({
  username: yup
    .string()
    .min(3, 'Username must have at least 3 characters')
    .required('Username is required'),
  password: yup
    .string()
    .min(3, 'Password must have at least 3 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Password confirmation is required'),
  email: yup
    .string()
    .email('Please enter a valid email')
    .min(3, 'Email must have at least 3 characters')
    .required('Email is required'),
  firstName: yup
    .string()
    .min(3, 'First name must have at least 3 characters')
    .required('First name is required'),
  lastName: yup
    .string()
    .min(3, 'Last name must have at least 3 characters')
    .required('Last name is required'),
  studyLevel: yup
    .string()
    .oneOf(['N5', 'N4', 'N3', 'N2', 'N1'], 'Please select a study level')
    .required('Study level is required'),
});

const studyLevels = ['N5', 'N4', 'N3', 'N2', 'N1'];

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 3,
  },
  input: {
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  levelContainer: {
    marginBottom: 12,
  },
  levelLabel: {
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.bold,
    marginBottom: 8,
    color: theme.colors.textPrimary,
  },
  levelButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  levelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 8,
    minWidth: 60,
  },
  levelButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  levelButtonText: {
    textAlign: 'center',
    fontSize: theme.fontSizes.body,
    color: theme.colors.textPrimary,
  },
  levelButtonTextSelected: {
    color: 'white',
    fontWeight: theme.fontWeights.bold,
  },
  buttonShape: {
    paddingVertical: 10,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: theme.fontSizes.body,
    fontWeight: theme.fontWeights.bold,
    textAlign: 'center',
  },
  errorText: {
    color: theme.colors.error,
    marginBottom: 12,
  },
});

export const SignUpContainer = ({ navigate, signUp }) => {
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      console.log('Form submitted with:', values);
      
      // Remove confirmPassword from the data sent to backend
      const { confirmPassword, ...userData } = values; // eslint-disable-line no-unused-vars
      console.log('Data being sent to signUp:', userData);
      
      try {
        const data = await signUp(userData);
        console.log('Signed up:', data);
        navigate('/');
      } catch (e) {
        console.log('SignUp error:', e);
      }
    },
  });

  const handleLevelSelect = (level) => {
    formik.setFieldValue('studyLevel', level);
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Username"
        value={formik.values.username}
        onChangeText={formik.handleChange('username')}
        style={[
          styles.input,
          formik.touched.username && formik.errors.username && { borderColor: theme.colors.error },
        ]}
      />
      {formik.touched.username && formik.errors.username && (
        <Text style={styles.errorText}>{formik.errors.username}</Text>
      )}

      <TextInput
        placeholder="Email"
        value={formik.values.email}
        onChangeText={formik.handleChange('email')}
        keyboardType="email-address"
        autoCapitalize="none"
        style={[
          styles.input,
          formik.touched.email && formik.errors.email && { borderColor: theme.colors.error },
        ]}
      />
      {formik.touched.email && formik.errors.email && (
        <Text style={styles.errorText}>{formik.errors.email}</Text>
      )}

      <TextInput
        placeholder="First Name"
        value={formik.values.firstName}
        onChangeText={formik.handleChange('firstName')}
        style={[
          styles.input,
          formik.touched.firstName && formik.errors.firstName && { borderColor: theme.colors.error },
        ]}
      />
      {formik.touched.firstName && formik.errors.firstName && (
        <Text style={styles.errorText}>{formik.errors.firstName}</Text>
      )}

      <TextInput
        placeholder="Last Name"
        value={formik.values.lastName}
        onChangeText={formik.handleChange('lastName')}
        style={[
          styles.input,
          formik.touched.lastName && formik.errors.lastName && { borderColor: theme.colors.error },
        ]}
      />
      {formik.touched.lastName && formik.errors.lastName && (
        <Text style={styles.errorText}>{formik.errors.lastName}</Text>
      )}

      <TextInput
        placeholder="Password"
        secureTextEntry={true}
        value={formik.values.password}
        onChangeText={formik.handleChange('password')}
        style={[
          styles.input,
          formik.touched.password && formik.errors.password && { borderColor: theme.colors.error },
        ]}
      />
      {formik.touched.password && formik.errors.password && (
        <Text style={styles.errorText}>{formik.errors.password}</Text>
      )}

      <TextInput
        placeholder="Confirm Password"
        secureTextEntry={true}
        value={formik.values.confirmPassword}
        onChangeText={formik.handleChange('confirmPassword')}
        style={[
          styles.input,
          formik.touched.confirmPassword && formik.errors.confirmPassword && { borderColor: theme.colors.error },
        ]}
      />
      {formik.touched.confirmPassword && formik.errors.confirmPassword && (
        <Text style={styles.errorText}>{formik.errors.confirmPassword}</Text>
      )}

      <View style={styles.levelContainer}>
        <Text style={styles.levelLabel}>Study Level</Text>
        <View style={styles.levelButtonsContainer}>
          {studyLevels.map((level) => (
            <Pressable
              key={level}
              style={[
                styles.levelButton,
                formik.values.studyLevel === level && styles.levelButtonSelected,
              ]}
              onPress={() => handleLevelSelect(level)}
            >
              <Text
                style={[
                  styles.levelButtonText,
                  formik.values.studyLevel === level && styles.levelButtonTextSelected,
                ]}
              >
                {level}
              </Text>
            </Pressable>
          ))}
        </View>
        {formik.touched.studyLevel && formik.errors.studyLevel && (
          <Text style={styles.errorText}>{formik.errors.studyLevel}</Text>
        )}
      </View>

      <Pressable style={styles.buttonShape} onPress={formik.handleSubmit}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </Pressable>
    </View>
  );
};

const SignUp = () => {
  const navigate = useNavigate();
  const [signUp] = useSignUp();

  return <SignUpContainer navigate={navigate} signUp={signUp} />;
};

export default SignUp;