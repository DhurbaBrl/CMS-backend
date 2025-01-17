const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt=require('bcryptjs')
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
        throw new Error('Email is invalid!');
      }
    },
  },
  password: {
    type: String,
    trim: true,
    required: true,
    minlength: 5,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  image: {
    type: Buffer,
  },
});
//to hash password
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    //if the password is modified(created or updated), the plain text password is overwritten by the hashed
    this.password = await bcrypt.hash(this.password, 8)
 }
  next();
});

//schema method to generate authentication token
userSchema.methods.generateToken = async function () {
  const token = await jwt.sign(
    { _id: this._id.toString() },
    process.env.PRIVATE_KEY
  );
  this.tokens.push({ token });
  this.save();
  return token
};

//to create virtual field 'contents' to relate user with contents' author
userSchema.virtual('contents', {
  ref: 'Content',
  localField: '_id',
  foreignField: 'author',
});

//User model
const User = mongoose.model('User', userSchema);

module.exports = User;
