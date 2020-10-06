const mongoose = require('mongoose');

//Schema for content
const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
});

//model for content
const Content = mongoose.model('Content', contentSchema);

module.exports = Content;
