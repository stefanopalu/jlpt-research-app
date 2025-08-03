const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 3,
    unique: true,  
  },
  password: {
    type: String,
    required: true,
    minlength: 3,
  },
  email: {
    type: String,
    required: true,
    minlength: 3,
    unique: true,  
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  firstName: {
    type: String,
    required: true,
    minlength: 3,
  },
  lastName: {
    type: String,
    required: true,
    minlength: 3,
  },
  studyLevel: {
    type: String,
    required: true,
    enum: ['N5', 'N4', 'N3', 'N2', 'N1'],
  },
  sessionLength: {
    type: String,
    required: true,
    enum: ['5', '10', '20', '30'],
  },
  studySessionType: {
    type: String,
    enum: ['SRS', 'BKT'],
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', schema);