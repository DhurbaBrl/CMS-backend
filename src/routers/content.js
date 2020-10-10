const express = require('express');
const router = new express.Router();
const authoriseIt = require('../authentication/auth');
const { findById } = require('../models/content');
const Content = require('../models/content');
const User = require('../models/user');

router.post('/content', authoriseIt, async (req, res) => {
  //creating new instance of content with author field
  const content = new Content({
    title: req.body.title,
    body: req.body.body,
    author: req.user._id,
  });
  try {
    await content.save();
    res.status(201).send(content);
  } catch (e) {
    res.send(e);
  }
});

//to get all contents of user by id of user
router.get('/content/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if(!user){
      return res.send({
        errorMessage:'There is no user with this id.'
      })
    }
    //populate contents property from user to get array of contents from user
    await user.populate('contents').execPopulate();
    //console.log(user.contents);
    if (user.contents.length === 0) {
      return res.send({
        errorMessage: 'User has not created any posts!',
      });
    }
    res.send(user.contents);
  } catch (e) {
    res.send(e);
  }
});

//to get one content by id
router.get('/content/:id', async (req, res) => {
  try {
    //console.log(req.params.id);
    const content = await Content.findById(req.params.id);
    //console.log(content);
    if (!content) {
      return res.send({
        errorMessage: 'Content not found.',
      });
    }
    res.send(content);
  } catch (e) {
    res.send(e);
  }
});

//to update the content by id
router.patch('/content/:id', authoriseIt, async (req, res) => {
  try {
    const content = await Content.findOneAndUpdate({
      _id: req.params.id,
      author: req.user._id,
    }, req.body);
    if (!content) {
      return res.send({
        errorMessage: 'Content not found.',
      });
    }
    res.send(content);
  } catch (e) {
    res.send(e);
  }
});

//to delete content
router.delete('/content/:id', authoriseIt, async (req, res) => {
  try {
    const deleteContent = await Content.findOneAndDelete({
      _id: req.params.id,
      author: req.user._id,
    });
    if (!deleteContent) {
      return res.send({
        errorMessage: 'Content not found.',
      });
    }
    res.send(deleteContent);
  } catch (e) {
    res.send(e);
  }
});
module.exports = router;
