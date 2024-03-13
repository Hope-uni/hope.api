const { User, Role, Permission } = require('@models/index');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const hbs = require('nodemailer-express-handlebars');
const { secretKey, domain, userEmail } = require('@config/variables.config');
const logger = require('@config/logger.config');
const { transporter, handlebarsOption } = require('@helpers/mailer.helper');

module.exports = {

  /**
   * The function performs user login authentication by verifying username existence, validating
   * password match, generating a JWT token, and handling potential errors.
   * @param body - The `body` parameter in the `async login` function likely contains the user input
   * data for logging in, such as the username and password entered by the user. This data is used to
   * verify the user's credentials during the login process.
   * @returns The `login` function returns an object with different properties based on the outcome of
   * the login process. Here are the possible return values:
   */
  async login(body) {
    try {
      // variables
      let userVerify;

      // Username Exist
      if(body.username) {
        userVerify = await User.findOne({
          where: {
            username: body.username,
            status: true
          }
        });
        if(!userVerify) {
          return {
            error: true,
            message: `Usuario no está regístrado en el sistema`,
            statusCode: 400
          }
        };
      };

      // Email Validation
      if(body.email) {
        userVerify = await User.findOne({
          where: {
            email: body.email,
            status: true,
          }
        });
        if(!userVerify) {
          return {
            error: true,
            message: `Correo no esta registrado o usuario no existe en el sistema`,
            statusCode: 400
          }
        };
      }
      
      // Password Match Validation
      const passwordValid = await bcrypt.compare(body.password, userVerify.password);
      if(!passwordValid) {
        return {
          error: true,
          message: `Usuario o contraseña incorrectos`,
          statusCode: 400
        }
      };

      // Generate Token  with JWT
      const token = jwt.sign(
        {
          id: userVerify.id,
          email: userVerify.email
        },
        secretKey,
        {
          expiresIn: 86400 // 24 hours from now\
        }
      );

      if(!token) {
        return {
          error: true,
          message: `Hubo un error al momento de Iniciar sesión`,
          statusCode: 400
        }
      };
      
      return {
        error: false,
        message: `Inicio de sesión existoso!`,
        token
      };
    } catch (error) {
      logger.error(error);
      return {
        error: true,
        message: `There was an error in login services: ${error}`,
        statusCode: 500
      }
    }
  },


  /**
   * The `forgotPassword` function in JavaScript handles the process of sending a password reset email
   * to a user with error handling and logging.
   * @param body - The `body` parameter in the `forgotPassword` function likely contains information
   * needed to initiate the password reset process. This could include the user's email address, which
   * is used to look up the user in the database and send them a password reset link.
   * @returns The `forgotPassword` function returns an object with either an error or success message
   * based on the outcome of the password reset process. If the process is successful, it returns an
   * object with `error: false` and a success message. If there is an error during the process, it
   * returns an object with `error: true`, an error message, and a status code.
   */
  async forgotPassword(body) {
    try {
      // Verify Email
      const userData = await User.findOne({
        where: {
          email: body.email,
          status: true
        }
      });
      if(!userData) {
        return {
          error: true,
          message: `Correo no esta registrado o usuario no existe en el sistema`,
          statusCode: 400
        }
      };

      const payload = {
        id: userData.id,
        email: userData.email
      };

      // Create token
      const emailToken = jwt.sign(payload,secretKey, {
        expiresIn: 900, // 15 minutes
      });

      // Create Url
      const url = `${domain}/reset-password?token=${encodeURIComponent(emailToken)}&email=${body.email}`;
      
      // Template file with Nodemailer
      transporter.use('compile', hbs(handlebarsOption));

      // Create Message
      const message = {
        from: userEmail,
        to: userData.email,
        subject: `Cambio de Contraseña`,
        template:'email',
        context: {
          name: userData.name,
          email: userData.email, 
          url,
        }
      };

      // Send email
      const send = await transporter.sendMail(message);
      if(send === null) {
        return {
          error: true,
          message: `Hubo un error a enviar el correo para restaurar la contraseña`,
          statusCode: 400
        }
      };

      return {
        error: false,
        message: `Correo enviado satisfactoriamente`
      };
    } catch (error) {
      logger.error(error);
      return {
        error: true,
        message: `There was an error in forgotPassword services: ${error}`,
        statusCode: 500
      }
    }
  },

  /**
   * The function `resetPassword` asynchronously resets a user's password in a database, handling
   * errors and returning appropriate messages.
   * @param body - The `body` parameter likely contains the information needed to reset a user's
   * password. It may include the new password that the user wants to set. This function uses the
   * `bcrypt` library to hash the new password before updating it in the database. The `payload`
   * parameter seems to contain the user
   * @param payload - The `payload` parameter in the `resetPassword` function likely contains
   * information about the user whose password is being reset. It seems to include at least an `id`
   * field, which is used to identify the user whose password is being reset. Additionally, based on
   * the code snippet provided, the `
   * @returns The function `resetPassword` returns an object with properties based on the outcome of
   * the password reset process.
   */
  async resetPassword(body, payload){
    try {
      const salt = await bcrypt.genSalt(10);
      const newPassword = await bcrypt.hash(body.password, salt);

      const userUpdate = await User.update(
        {
          password: newPassword
        },
        {
          where: {
            id: payload.id,
            status: 1
          }
        }
      );

      if(!userUpdate) {
        return {
          error: true,
          message: `Hubo un error al momento de restaurar la contraseña`,
          statusCode: 400
        }
      };

      return {
        error: false,
        message: `Contraseña restaurada`
      }

    } catch (error) {
      logger.error(error);
      return {
        error: true,
        message: `There was an error in resetPassword services: ${error}`,
        statusCode: 500
      }
    }
  },


  /**
   * The function `me` retrieves user data based on a payload, with error handling and logging.
   * @param payload - The code you provided is an asynchronous function that retrieves user data based
   * on the payload provided. The payload should contain an `id` property.
   * @returns The function `me` is returning an object with the following structure:
   * - If the payload is empty, it returns an error object with a message indicating that the payload
   * is empty, along with an error flag and a status code of 400.
   * - If the function executes successfully, it returns an object with an error flag set to false, a
   * message indicating "User data", and the retrieved data from
   */
  async me(payload) {
    try {
      // Payload Validation
      if (!payload) {
        return {
          message: `Payload esta vacio`,
          error: true,
          statusCode: 400
        };
      };

      const data = await User.findOne({
        where: {
          id:payload.id,
          status: true
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status','password'],
        },
        include: [
          {
            model: Role,
            attributes: {
              exclude: ['createdAt','updatedAt','status']
            },
            include: {
              model: Permission,
              as: 'permissions',
              attributes: {
                exclude: ['group','createdAt','updatedAt']
              },
              through: {
                attributes: {
                  exclude: [
                    'id',
                    'createdAt',
                    'updatedAt',
                    'roleId',
                    'permissionId',
                  ]
                }
              }
            }
          }
        ]
      });

      return {
        error: false,
        message: `User data`,
        data
      }

    } catch (error) {
      logger.error(error);
      return {
        error: true,
        message: `There was an error in Me services: ${error}`,
        statusCode: 500
      }
    }
  }

}