const mongoose = require('mongoose');
const validator = require('validator');

//User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
    minlength: 3,
  },
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
    lowercase: true,
    validate(email) {
      const checkForEmail = validator.isEmail(email);
      if (checkForEmail == false) {
        throw new Error('Emmail is invalid!');
      }
    },
  },
  password: {
    type: String,
    trim: true,
    required: true,
    minlength: 5,
  },
});

//User model
const User = mongoose.model('User', userSchema);

module.exports = User;
