const express = require('express');
const router = new express.Router();
const authoriseIt = require('../authentication/auth');
const Content = require('../models/content');

router.post('/content', authoriseIt, async (req, res) => {
  //creating new instance of content with author field
  const content = new Content({
    title: req.body.title,
    body: req.body.body,
    author: req.user._id,
  });
  try {
    await content.save();
    res.send(content);
  } catch (e) {
    res.send(e);
  }
});
router.get('/content', authoriseIt, async (req, res) => {
  try {
    const user = req.user;
    //populate contents property from user to get contents from user
    await user.populate('contents').execPopulate();
    res.send(user.contents);
  } catch (e) {
    res.send(e);
  }
});
module.exports = router;
