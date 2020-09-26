const express = require('express');
const User = require('../models/user');
const router = new express.Router();
const bcrypt = require('bcryptjs');

router.post('/users/signup', async (req, res) => {
  const user = new User(req.body);
  console.log(user);
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
    res.status(201).send(user);
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
        res.send(findUserByEmail);
      }
    }
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
