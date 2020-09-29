const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authoriseIt = async (req, res, next) => {
  try {
    const token = req.header('Authorization').split(' ')[1];
    const verified = jwt.verify(token, process.env.PRIVATE_KEY);
    const user = await User.findOne({
      _id: verified._id,
      'tokens.token': token,
    });
    if (!user) {
      return res.send({
        errorMessage: 'User is not authenticated!',
      });
    }
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({ errorMessage: 'Authentication failed!' });
  }
  next();
};
module.exports = authoriseIt;
