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

module.exports = {
  login,
};