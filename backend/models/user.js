const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 3
  },
  password: {
    type: String,
    required: true,
    minlength: 3
  },
  userProgress: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserProgress'
    }
  ]
})

module.exports = mongoose.model('User', schema)