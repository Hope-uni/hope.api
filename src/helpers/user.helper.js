const logger = require('@config/logger.config');
const { transporter, handlebarsOption } = require('@helpers/mailer.helper');
const hbs = require('nodemailer-express-handlebars');
const messages = require('@utils/messages.utils');
const { domain, userEmail } = require('../config/variables.config');


module.exports = {


  async userSendEmail(body) {
    try {
      // dstructuring object
      const {
        email,
        password,
        username,
      } = body;


      // Building the url
      const url = `${domain}/login?usernameOrEmail=${email}`;

      
      // Template file
      transporter.use('compile', hbs(handlebarsOption));

      // Create Message
      const message = {
        from: userEmail,
        to: email,
        subject: `Esta es tu contraseña`,
        template:'emailPassword',
        context: {
          username,
          email,
          url,
          password,
        }
      }

      // Send Email
      const sendEmail = await transporter.sendMail(message);
      if(sendEmail === null) {
        return {
          error: true,
          message: messages.auth.errors.service.change_default_password.base,
          statusCode: 400
        }
      };


      return {
        error: false,
        message: messages.auth.success.change_default_password,
      }
    } catch (error) {
      logger.error(`${messages.user.errors.service.base}: ${error}`);
      return {
        error: true,
        message: `${messages.user.errors.service.base}: ${error}`,
        statusCode: 500
      }
    }
  }

}