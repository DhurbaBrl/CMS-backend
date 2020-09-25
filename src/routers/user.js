const express = require('express');
const User = require('../models/user');
const router = new express.Router();

router.post('/users/signup', async (req, res) => {
  const user = new User(req.body);
  console.log(user);
  try {
    await user.save();
    res.status(201).send(user);
  } catch (e) {
    res.send(e);
  }
});

router.post('/users/login', async (req, res) => {
  try {
    const findUserByEmail = await User.findOne({ email: req.body.email });
    if (!findUserByEmail) {
      res.send({
        errorMessage: 'Email is not registered',
      });
    } else {
      if (findUserByEmail.password != req.body.password) {
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
