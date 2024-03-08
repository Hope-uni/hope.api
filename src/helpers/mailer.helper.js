const nodemailer = require('nodemailer');
const path = require('path');

const {
  userEmail,
  passwordEmail,
  emailHost,
  emailPort,
  emailSecure
} = require('../config/variables.config');


const transporter = nodemailer.createTransport({
  host: emailHost,
  port: emailPort,
  secure: !emailSecure,
  auth: {
    user: userEmail,
    pass: passwordEmail
  }
});

const handlebarOption = {
  viewEngine: {
    partialsDir: path.resolve('src/views/'),
    defaultLayout: false,
  },
  viewPath: path.resolve('src/views/')
};

module.exports = {
  transporter,
  handlebarOption
}