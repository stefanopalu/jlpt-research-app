const jwt = require('jsonwebtoken');
const { GraphQLError } = require('graphql');
const User = require('../models/user');

const login = async ({ username, password }) => {
  console.log('Service login called with:', { username, password });
  
  const JWT_SECRET = process.env.JWT_SECRET; 

  console.log('JWT_SECRET exists:', !!JWT_SECRET);
  
  const user = await User.findOne({ username });
  console.log('Service found user:', user);

  if (!user || password !== user.password) {
    throw new GraphQLError('wrong credentials', {
      extensions: {
        code: 'BAD_USER_INPUT',
      },
    });
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  };
  const token = jwt.sign(userForToken, JWT_SECRET);
  console.log('Service generated token:', token);

  return {
    value: token,
    user: {
      username: user.username,
      id: user._id.toString(),
    },
  };
};

const signUp = async ({ username, password, email, firstName, lastName, studyLevel }) => {
  // Check if user already exists
  const existingUser = await User.findOne({ 
    $or: [{ username }, { email }], 
  });

  if (existingUser) {
    throw new GraphQLError('User with this username or email already exists', {
      extensions: {
        code: 'BAD_USER_INPUT',
      },
    });
  }

  // Create new user
  const user = new User({
    username,
    password, 
    email,
    firstName,
    lastName,
    studyLevel,
  });

  await user.save();

  // Generate JWT token
  const JWT_SECRET = process.env.JWT_SECRET;
  const userForToken = {
    username: user.username,
    id: user._id,
  };

  return {
    value: jwt.sign(userForToken, JWT_SECRET),
    user: {
      username: user.username,
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      studyLevel: user.studyLevel,
      createdAt: user.createdAt.toISOString(),
    },
  };
};

module.exports = {
  login,
  signUp,
};