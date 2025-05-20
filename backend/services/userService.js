const jwt = require('jsonwebtoken');
const { GraphQLError } = require('graphql');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET 

const login = async ({ username, password }) => {
  const user = await User.findOne({ username });

  if (!user || password !== user.password) {
    throw new GraphQLError('wrong credentials', {
      extensions: {
        code: 'BAD_USER_INPUT'
      }
    });
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  };

  return {
    value: jwt.sign(userForToken, JWT_SECRET),
    user: {
        username: user.username,
        id: user._id.toString(),
    }
  };
};

module.exports = {
  login,
};