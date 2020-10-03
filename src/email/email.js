const nodemailer = require('nodemailer');
require('dotenv').config();

// create reusable transporter object
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmailForSignup = async (email, name) => {
  // send mail with defined transport object
  await transporter.sendMail(
    {
      from: '"CMS Ices" <cmsices@gmail.com>', // sender address
      to: email, // list of receivers
      subject: 'Hello ✔ ', // Subject line
      text: `Hello ${name}`, // plain text body
      html: `<b>${name}. You have signed up to our account.</b>`, // html body
    },
    (error, message) => {
      if (error) {
        console.log(error);
      } else {
        console.log(message.response);
      }
    }
  );
};

module.exports = sendEmailForSignup;
