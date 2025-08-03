import Text from '../Text';
import { TextInput, StyleSheet, Pressable, View, ScrollView } from 'react-native';
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
  sessionLength: '',
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
  sessionLength: yup
    .string()
    .oneOf(['10', '20', '30'], 'Please select a session length')
    .required('Session length is required'),
});

const studyLevels = ['N5', 'N4', 'N3', 'N2', 'N1'];
const sessionLengths = ['5','10', '20', '30'];
const disabledLevels = ['N3', 'N2', 'N1'];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  headerContainer: {
    backgroundColor: theme.colors.primary,
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'white',
    marginTop: -20,
    marginBottom: 40,
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
  levelContainer: {
    marginBottom: 20,
  },
  levelLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  levelButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  levelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 8,
    minWidth: 50,
    backgroundColor: '#fafafa',
  },
  levelButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  levelButtonText: {
    textAlign: 'center',
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  levelButtonTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  levelButtonDisabled: {
    backgroundColor: '#f0f0f0',
    borderColor: '#d0d0d0',
    opacity: 0.6,
  },
  levelButtonTextDisabled: {
    color: '#999',
  },
  signUpButton: {
    backgroundColor: '#2c3e50',
    paddingVertical: 26,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 10,
  },
  signUpButtonText: {
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

  const handleSessionLengthSelect = (length) => {
    formik.setFieldValue('sessionLength', length);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Sign up now</Text>
      </View>

      {/* Form Container */}
      <View style={styles.formContainer}>
        {/* Email */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            placeholder="winner@email.com"
            value={formik.values.email}
            onChangeText={formik.handleChange('email')}
            keyboardType="email-address"
            autoCapitalize="none"
            style={[
              styles.input,
              formik.touched.email && formik.errors.email && styles.inputError,
            ]}
          />
          {formik.touched.email && formik.errors.email && (
            <Text style={styles.errorText}>{formik.errors.email}</Text>
          )}
        </View>

        {/* Username */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Your username</Text>
          <TextInput
            placeholder="Rookie123"
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
          <Text style={styles.inputLabel}>Your password</Text>
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

        {/* Confirm Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Confirm Password</Text>
          <TextInput
            placeholder="••••••••••••••••••••"
            secureTextEntry={true}
            value={formik.values.confirmPassword}
            onChangeText={formik.handleChange('confirmPassword')}
            style={[
              styles.input,
              formik.touched.confirmPassword && formik.errors.confirmPassword && styles.inputError,
            ]}
          />
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <Text style={styles.errorText}>{formik.errors.confirmPassword}</Text>
          )}
        </View>

        {/* First Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>First Name</Text>
          <TextInput
            placeholder="Enter your first name"
            value={formik.values.firstName}
            onChangeText={formik.handleChange('firstName')}
            style={[
              styles.input,
              formik.touched.firstName && formik.errors.firstName && styles.inputError,
            ]}
          />
          {formik.touched.firstName && formik.errors.firstName && (
            <Text style={styles.errorText}>{formik.errors.firstName}</Text>
          )}
        </View>

        {/* Last Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Last Name</Text>
          <TextInput
            placeholder="Enter your last name"
            value={formik.values.lastName}
            onChangeText={formik.handleChange('lastName')}
            style={[
              styles.input,
              formik.touched.lastName && formik.errors.lastName && styles.inputError,
            ]}
          />
          {formik.touched.lastName && formik.errors.lastName && (
            <Text style={styles.errorText}>{formik.errors.lastName}</Text>
          )}
        </View>

        {/* Study Level */}
        <View style={styles.levelContainer}>
          <Text style={styles.levelLabel}>Study Level</Text>
          <View style={styles.levelButtonsContainer}>
            {studyLevels.map((level) => {
              const isDisabled = disabledLevels.includes(level);
              return (
                <Pressable
                  key={level}
                  style={[
                    styles.levelButton,
                    formik.values.studyLevel === level && styles.levelButtonSelected,
                    isDisabled && styles.levelButtonDisabled,
                  ]}
                  onPress={isDisabled ? null : () => handleLevelSelect(level)}
                  disabled={isDisabled}
                >
                  <Text
                    style={[
                      styles.levelButtonText,
                      formik.values.studyLevel === level && styles.levelButtonTextSelected,
                      isDisabled && styles.levelButtonTextDisabled,
                    ]}
                  >
                    {level}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {formik.touched.studyLevel && formik.errors.studyLevel && (
            <Text style={styles.errorText}>{formik.errors.studyLevel}</Text>
          )}
        </View>

        {/* Study Session Length */}
        <View style={styles.levelContainer}>
          <Text style={styles.levelLabel}>Study Session Length</Text>
          <View style={styles.levelButtonsContainer}>
            {sessionLengths.map((length) => (
              <Pressable
                key={length}
                style={[
                  styles.levelButton,
                  formik.values.sessionLength === length && styles.levelButtonSelected,
                ]}
                onPress={() => handleSessionLengthSelect(length)}
              >
                <Text
                  style={[
                    styles.levelButtonText,
                    formik.values.sessionLength === length && styles.levelButtonTextSelected,
                  ]}
                >
                  {length}
                </Text>
              </Pressable>
            ))}
          </View>
          {formik.touched.sessionLength && formik.errors.sessionLength && (
            <Text style={styles.errorText}>{formik.errors.sessionLength}</Text>
          )}
        </View>

        {/* Sign Up Button */}
        <Pressable style={styles.signUpButton} onPress={formik.handleSubmit}>
          <Text style={styles.signUpButtonText}>Sign up</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const SignUp = () => {
  const navigate = useNavigate();
  const [signUp] = useSignUp();

  return <SignUpContainer navigate={navigate} signUp={signUp} />;
};

export default SignUp;