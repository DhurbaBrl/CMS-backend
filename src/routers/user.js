const express = require('express');
const User = require('../models/user');
const Content = require('../models/content');
const router = new express.Router();
const bcrypt = require('bcryptjs');
const sharp = require('sharp');
const authoriseIt = require('../authentication/auth');
const { sendEmailForSignup, sendEmailForDeletion } = require('../email/email');
const { findByIdAndDelete } = require('../models/user');
const multer = require('multer');
const { response } = require('express');

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
    // const hashedPassword = await bcrypt.hash(req.body.password, 8);
    // user.password = hashedPassword;

    //save user
    await user.save();

    //to generate the authentication token
    const token=await user.generateToken();
    //send email
    sendEmailForSignup(user.email, user.name);

    //hide private data
    const publicProfile = user.toObject();
    delete publicProfile.password;
    delete publicProfile.tokens;

    res.status(201).send({publicProfile,token});
  } catch (e) {
    res.send(e);
  }
});

router.post('/users/login', async (req, res) => {
  //console.log(req.body)
  try {
    //find the  user by email
    const findUserByEmail = await User.findOne({ email: req.body.email });
    //console.log(findUserByEmail)
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
       const token = await findUserByEmail.generateToken();

        //hide private data
        const publicProfile = findUserByEmail.toObject();
        delete publicProfile.password;
        delete publicProfile.image;
        delete publicProfile.tokens;

        res.send({publicProfile,token});
      }
    }
  } catch (e) {
    res.send(e);
  }
});

//to get user by id
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const publicProfile = user.toObject();
    //hide private data
    delete publicProfile.password;
    delete publicProfile.tokens;
    delete publicProfile.image;

    //send response
    res.send(publicProfile);
  } catch (e) {
    res.send(e);
  }
});

//to update user details
router.patch('/users/self', authoriseIt, async (req, res) => {
  const user = req.user;
  const keysToUpdate=Object.keys(req.body)
  try {
    //hash the password before updating to the database
    //const hashedPassword = await bcrypt.hash(req.body.password, 8);

    //update the user details as a whole
    // const updatedUser = await User.findByIdAndUpdate(user._id, {
    //   name: req.body.name,
    //   email: req.body.email,
    //   password: hashedPassword,
    // });
    
    keysToUpdate.forEach((update)=>{
      user[update]=req.body[update]
    })

    await user.save()

    //hide private data
    // const publicProfile = user.toObject();
    // delete publicProfile.password;
    // delete publicProfile.tokens;
    // delete publicProfile.image;

    res.send(user);
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

//to upload the profile image
var upload = multer({
  limits: {
    fileSize: 5000000,
  },
  fileFilter: (req, file, cb) => {
    if (file.originalname.match(/\.(jpg|png|jpeg)$/).length === null) {
      return cb(new Error('Please upload an image document.'));
    }
    cb(null, true);
  },
});
router.post(
  '/users/self/image',
  authoriseIt,
  upload.single('image'),
  async (req, res) => {
    try {
      const user = req.user;
      if (!req.file) {
        throw new Error(); //executes the catch block
      }
      const imageBuffer = await sharp(req.file.buffer)
        .resize({ width: 250, height: 250 })
        .png()
        .toBuffer();
      user.image = imageBuffer;
      await user.save();
      res.send();
    } catch (e) {
      res.send(e);
    }
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

//to view image
router.get('/users/:id/image', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.image) {
      return res.send({
        errorMessage: 'There is no user or image.',
      });
    }
    res.set('Content-Type','image/png')
    //console.log(user.image.buffer);
    res.send(user.image);
    // res.send();
  } catch (e) {
    res.send(e);
  }
});

//to update the image
router.patch(
  '/users/self/image',
  authoriseIt,
  upload.single('image'),
  async (req, res) => {
    try {
      const user = req.user;
      const imageBuffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();

      await User.findByIdAndUpdate(user._id, { image: imageBuffer });
      res.send();
    } catch (e) {
      res.send(e);
    }
  }
);

//to delete image
router.delete('/users/self/image', authoriseIt, async (req, res) => {
  try {
    const user = req.user;
    if (!user.image) {
      return res.send({
        errorMessage: 'There is no image to delete.',
      });
    }
    user.image = undefined;
    await user.save();
    res.send();
  } catch (e) {
    res.send(e);
  }
});

//to logout user
router.post('/users/logout',authoriseIt,async(req,res)=>{
  try{
  const user=req.user
  const token=req.token
  const findObjectOfToken=user.tokens.find((tokenObject)=>{
      return tokenObject.token==token
    })
  const index=user.tokens.indexOf(findObjectOfToken)
  if(index>-1){
    user.tokens.splice(index,1)
  }
  await user.save()
  res.send()
  }catch(e){
    res.send(e)
  }
})
module.exports = router;
