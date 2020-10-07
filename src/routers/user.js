const express = require('express');
const User = require('../models/user');
const Content = require('../models/content');
const router = new express.Router();
const bcrypt = require('bcryptjs');
const authoriseIt = require('../authentication/auth');
const { sendEmailForSignup, sendEmailForDeletion } = require('../email/email');
const { findByIdAndDelete } = require('../models/user');

router.post('/users/signup', async (req, res) => {
  const user = new User(req.body);
  try {
    //check email if it already exists
    const checkEmail = await User.findOne({ email: req.body.email });
    if (checkEmail) {
      return res.send({
        errorMessage: 'Email already exists.',
      });
    }
    //to hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, 8);
    user.password = hashedPassword;

    //save user
    await user.save();

    //to generate the authentication token
    await user.generateToken();

    //send email
    sendEmailForSignup(user.email, user.name);

    //hide private data
    const publicProfile = user.toObject();
    delete publicProfile.password;

    res.status(201).send(publicProfile);
  } catch (e) {
    res.send(e);
  }
});

router.post('/users/login', async (req, res) => {
  try {
    //find the  user by email
    const findUserByEmail = await User.findOne({ email: req.body.email });
    if (!findUserByEmail) {
      res.send({
        errorMessage: 'Email is not registered',
      });
    } else {
      //compare the password provided with the hashed password in db
      const compared = await bcrypt.compare(
        req.body.password,
        findUserByEmail.password
      );
      if (!compared) {
        res.send({
          errorMessage: 'Password is incorrect!',
        });
      } else {
        //generate authentication token
        await findUserByEmail.generateToken();

        //hide private data
        const publicProfile = findUserByEmail.toObject();
        delete publicProfile.password;
        // delete publicProfile.tokens;

        res.send(publicProfile);
      }
    }
  } catch (e) {
    res.send(e);
  }
});
router.get('/users/self', authoriseIt, (req, res) => {
  //hide private data
  const publicProfile = req.user.toObject();
  delete publicProfile.password;
  delete publicProfile.tokens;
  //send response
  res.send(publicProfile);
});

//to update user details
router.patch('/users/self', authoriseIt, async (req, res) => {
  try {
    const user = req.user;
    //hash the password before updating to the database
    const hashedPassword = await bcrypt.hash(req.body.password, 8);

    //update the user details as a whole
    const updatedUser = await User.findByIdAndUpdate(user._id, {
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });

    res.send(updatedUser);
  } catch (e) {
    res.send(e);
  }
});

//to delete the user
router.delete('/users/self', authoriseIt, async (req, res) => {
  try {
    const user = req.user;
    //delete user
    const deleteUser = await User.findByIdAndDelete(user._id);
    //delete user's content
    await Content.deleteMany({ author: user._id });
    //send email for deletion
    sendEmailForDeletion(deleteUser.email, deleteUser.name);
    res.send(deleteUser);
  } catch (e) {
    res.send(e);
  }
});

module.exports = router;
