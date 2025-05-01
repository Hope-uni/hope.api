const {
  User,
  Role,
  Permission,
  AuthToken,
  UserRoles,
  Patient,
  TutorTherapist,
  sequelize
} = require('@models/index');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const hbs = require('nodemailer-express-handlebars');
const { Op } = require('sequelize');
const logger = require('@config/logger.config');
const { jwtAccessExpiration, secretKey, domain, userEmail } = require('@config/variables.config');
const { transporter, handlebarsOption } = require('@helpers');
const { messages, formatErrorMessages, dataStructure } = require('@utils');
const { roleConstants } = require('@constants');

module.exports = {


  /**
   * The function performs user authentication by verifying credentials, generating access and refresh
   * tokens using JWT, and handling errors with logging.
   * @param body - The `login` function you provided is an asynchronous function that handles user
   * authentication and generates access and refresh tokens using JWT. Here's a breakdown of the
   * process:
   * @returns The `login` function returns an object with the following properties:
   * - `error`: A boolean indicating if an error occurred during the login process.
   * - `message`: A message describing the outcome of the login attempt.
   * - `accessToken`: A JWT access token generated for the user.
   * - `refreshToken`: The refresh token generated for the user.
   */
  async login(body) {
    const transaction = await sequelize.transaction();
    try {
      const getUserFromDb = await User.findOne({
        where: {
          [Op.and]: [
            {
              status: true,
            },
            {
              [Op.or]: [
                {
                  email: body.email_username,
                },
                {
                  username: body.email_username,
                }
              ]
            }
          ]
        },
        include: [
          {
            model: UserRoles,
            include: [
              {
                model: Role,
                include: [
                  {
                    model: Permission,
                    as: 'permissions'
                  }
                ]
              }
            ]
          }
        ]
      });

      // Verify if user exist
      if(!getUserFromDb) {
        await transaction.rollback();
        return {
          error: true,
          message: messages.auth.errors.not_found.email_username,
          statusCode: 404
        }
      };

      // Password Match Validation
      const passwordValid = await bcrypt.compare(body.password, getUserFromDb.password);
      if(!passwordValid) {
        await transaction.rollback();
        return {
          error: true,
          message: messages.auth.errors.service.login.password_not_match,
          statusCode: 400
        }
      };

      // Verify if user has a Refresh Token
      const refreshTokenData = await AuthToken.findOne({
        where: {
          userId: getUserFromDb.id,
          email: getUserFromDb.email
        }
      });
      if(refreshTokenData) {
        await AuthToken.destroy({
          where: {
            id: refreshTokenData.id
          },
          transaction
        });
      }

      // Generate Token  with JWT
      /* eslint-disable radix */
      /* eslint-disable prefer-const */
      /* eslint-disable no-unused-vars */
      let accessToken;

      const getSuperAdmin = getUserFromDb.UserRoles.map((element ) => {
        if(element.Role.name === 'Superadmin') {
          return element.Role.name;
        }
        return '';
      });

      if(getSuperAdmin[0] !== 'Superadmin') {
        accessToken = jwt.sign(
          {
            id: getUserFromDb.id,
            email: getUserFromDb.email
          },
          secretKey,
          {
            expiresIn: `${parseInt(jwtAccessExpiration)}d`
          }
        );
      }

      if(getSuperAdmin[0] === 'Superadmin') {
        accessToken = jwt.sign(
          {
            id: getUserFromDb.id,
            email: getUserFromDb.email
          },
          secretKey,
          {
            expiresIn: 86400 // 24hrs
          }
        );
      }

      if(!accessToken) {
        await transaction.rollback();
        return {
          error: true,
          message: messages.auth.errors.service.login.generate_token_error,
          statusCode: 400
        }
      };

      // Generate refresh Token
      const refreshToken = jwt.sign(
        {
          id: getUserFromDb.id,
          email: getUserFromDb.email
        },
        secretKey,
        {
          expiresIn: `365d`
        }
      );
      const authtokenReponse = await AuthToken.create({
        token: refreshToken,
        userId: getUserFromDb.id,
        email: getUserFromDb.email,
      },{transaction});

      // Commit the refresh token
      await transaction.commit();

      return {
        error: false,
        statusCode: 200,
        message: messages.auth.success.login,
        data: {
          accessToken,
          refreshToken: authtokenReponse.token,
        },
      };
    } catch (error) {
      await transaction.rollback();
      logger.error(` ${messages.auth.errors.service.login.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
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

      const userData = await User.findOne({
        where: {
          [Op.and]: [
            {
              status: true,
            },
            {
              [Op.or]: [
                {
                  email: body.email_username,
                },
                {
                  username: body.email_username,
                }
              ]
            }
          ]
        }
      });

      if(!userData) {
        return {
          error: true,
          message: messages.auth.errors.not_found.email_username,
          statusCode: 404
        }
      };

      // Creating Payload
      const payload = {
        id: userData.id,
        email: userData.email
      };

      // Create token
      const emailToken = jwt.sign(payload,secretKey, {
        expiresIn: 900, // 15 minutes
      });

      // Create Url
      const url = `${domain}/reset-password?token=${encodeURIComponent(emailToken)}`;

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
          message: messages.auth.errors.service.forgot_password.send_email,
          statusCode: 400
        }
      };

      return {
        error: false,
        statusCode: 200,
        message: messages.auth.success.forgot_password
      };
    } catch (error) {
      logger.error(`${messages.auth.errors.service.forgot_password.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
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
            status: true,
          }
        }
      );

      if(!userUpdate) {
        return {
          error: true,
          statusCode: 409,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('reset_password', messages.auth.errors.service.reset_password.update_password),
        }
      };

      return {
        error: false,
        statusCode: 200,
        message: messages.auth.success.reset_password
      }

    } catch (error) {
      logger.error(`${messages.auth.errors.service.reset_password.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  },

  /**
   * The function `changePassword` updates a user's password after validating the current password and
   * handling potential errors using transactions in a Node.js application.
   * @param body - The `body` parameter in the `changePassword` function likely contains the following
   * information related to changing a user's password:
   * @param payload - The `payload` parameter likely contains information about the user making the
   * request, such as their ID or other identifying details. It is used in this function to find the
   * user in the database and update their password.
   * @returns The `changePassword` function returns an object with properties based on the outcome of
   * the password change operation.
   */
  async changePassword(body, payload) {
    const transaction = await sequelize.transaction();
    try {

      const getUser = await User.findOne({
        where: {
          id: payload.id,
          status: true
        }
      });

      // Password match Validation
      const passwordValid = await bcrypt.compare(body.password, getUser.password);

      if(passwordValid === false) {
        await transaction.rollback();
        return {
          error: true,
          message: messages.auth.errors.service.change_password.incorrect_password,
          statusCode: 400
        }
      }

      const salt = await bcrypt.genSalt(10);
      const hashedNewPassword = await bcrypt.hash(body.newPassword, salt);

      const userResponse = await User.update(
        {
          password:  hashedNewPassword,
          userVerified: true
        },
        {
          where: {
            id: payload.id,
            status: true
          }
        },
        {transaction}
      );

      if(!userResponse) {
        await transaction.rollback();
        return {
          error: true,
          message: messages.auth.errors.service.change_password.update_password,
          statusCode: 400
        }
      }

      // Commit transaction
      await transaction.commit();

      return {
        error: false,
        statusCode: 200,
        message: messages.auth.success.change_password
      }


    } catch (error) {
      logger.error(`${messages.auth.errors.service.change_password.base}: ${error}`);
      await transaction.rollback();
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  },

  /**
   * The function `changePasswordPatient` updates a patient's password after validating the current
   * password and committing the changes in a transaction.
   * @param body - The `body` parameter in the `changePasswordPatient` function likely contains the
   * following information related to changing a patient's password:
   * @param id - The `id` parameter in the `changePasswordPatient` function is used to specify the
   * unique identifier of the patient whose password needs to be changed. This identifier is typically
   * used to locate the specific patient record in the database and perform the password change
   * operation for that patient.
   * @returns The function `changePasswordPatient` returns an object with properties based on the
   * outcome of the password change operation.
   */
  async changePasswordPatient(body, id, payload) {
    const transaction = await sequelize.transaction();
    try {

      // Variables
      let whereCondition = {
        id,
        status: true,
      }

      if(payload.roles.includes(roleConstants.TUTOR_ROLE)) {
        const tutorExist = await TutorTherapist.findOne({
          where: {
            userId: payload.id
          },
        });
        if(!tutorExist) {
          return {
            error: true,
            message: messages.tutor.errors.not_found,
            statusCode: 404
          }
        }

        // udpate whereCondition
        whereCondition = {
          ...whereCondition,
          tutorId: tutorExist.id
        }
      }

      const getPatient = await Patient.findOne({
        where: whereCondition,
        include: [
          {
            model: User,
          }
        ]
      });

      if(!getPatient) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 404,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('change_password', messages.patient.errors.not_found),
        }
      }

      // Password match Validation
      const passwordValid = await bcrypt.compare(body.password, getPatient.User.password);
      if(!passwordValid) {
        await transaction.rollback();
        return {
          error: true,
          message: messages.auth.errors.service.change_password.incorrect_password,
          statusCode: 400
        }
      }

      const salt = await bcrypt.genSalt(10);
      const hashedNewPassword = await bcrypt.hash(body.newPassword, salt);

      const userResponse = await User.update(
        {
          password:  hashedNewPassword,
          userVerified: true
        },
        {
          where: {
            id: getPatient.userId,
            status: true
          }
        },
        {transaction}
      );

      if(!userResponse) {
        await transaction.rollback();
        return {
          error: true,
          statusCode: 409,
          message: messages.generalMessages.base,
          validationErrors: formatErrorMessages('change_password', messages.auth.errors.service.change_password.update_password),
        }
      }

      // Commit transaction
      await transaction.commit();

      return {
        error: false,
        statusCode: 200,
        message: messages.auth.success.change_password
      }
    } catch (error) {
      logger.error(`${messages.auth.errors.service.change_password.base}: ${error}`);
      await transaction.rollback();
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
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
          message: messages.auth.errors.service.me.payload_empty,
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
            model: UserRoles,
            attributes: {
              exclude: ['createdAt','updatedAt','roleId','id']
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
                    exclude: ['group','createdAt','updatedAt','status']
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
          }
        ]
      });

      return {
        error: false,
        statusCode: 200,
        message: messages.auth.success.me,
        data: await dataStructure.meDataStructure(data),
      }

    } catch (error) {
      logger.error(`${messages.auth.errors.service.me.base}: ${error}`);
      return {
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }
    }
  },

  /**
   * The function `refreshAuth` handles the refreshing of access tokens using refresh tokens in a
   * Node.js application.
   * @param refreshToken - The provided code snippet is an asynchronous function named `refreshAuth`
   * that handles the refreshing of authentication tokens. It takes a `refreshToken` as a parameter,
   * which is used to generate a new access token and refresh token for the user.
   * @returns The `refreshAuth` function returns an object with different properties based on the
   * execution flow:
   */
  async refreshAuth(refreshToken) {
    const transaction = await sequelize.transaction();
    // validate if the parameter is empty or not a string
    if(refreshToken === null) {
      await transaction.rollback();
      return {
        error: true,
        message: messages.auth.errors.service.refresh_auth.token_invalid.empty,
        statusCode: 400
      }
    };
    if(typeof refreshToken === 'number') {
      await transaction.rollback();
      return {
        error: true,
        message: messages.auth.errors.service.refresh_auth.token_invalid.base,
        statusCode: 400
      }
    };
    try {

      // Validate if token is valid
      const refreshTokenValid = jwt.verify(refreshToken, secretKey);
      if(!refreshTokenValid) {
        await transaction.rollback();
        return {
          message: messages.auth.errors.service.refresh_auth.token_invalid.base,
          error: true,
          statusCode: 401
        };
      };

      const refreshTokenExist = await AuthToken.findOne({
        where: {
          token: refreshToken
        }
      });

      if(!refreshTokenExist) {
        await transaction.rollback();
        return {
          error: true,
          message: messages.auth.errors.service.login.login_required,
          statusCode: 401
        }
      };

      const newAccessToken = jwt.sign(
        {
          id: refreshTokenExist.userId,
          email: refreshTokenExist.email
        },
        secretKey,
        {
          expiresIn: `${parseInt(jwtAccessExpiration)}d`
        }
      );

      if(!newAccessToken) {
        await transaction.rollback();
        return {
          error: true,
          message: messages.auth.errors.service.refresh_auth.update_token,
          statusCode: 400
        }
      };

      // Remove authToken register
      await AuthToken.destroy({
        where: {
          id: refreshTokenExist.id
        },
        transaction
      });

      // Generate refresh Token
      const newRefreshToken = jwt.sign(
        {
          id: refreshTokenExist.userId,
          email: refreshTokenExist.email
        },
        secretKey,
        {
          expiresIn: `365d`
        }
      );

      // Create new Access Token register
      const authtokenResponse = await AuthToken.create({
        token: newRefreshToken,
        userId: refreshTokenExist.userId,
        email: refreshTokenExist.email
      },{transaction});


      // Commit the refresh token
      await transaction.commit();

      return {
        error: false,
        statusCode: 200,
        message: messages.auth.success.refresh_auth,
        data:{
            accessToken: newAccessToken,
            refreshToken: authtokenResponse.token
          }
      };

    } catch (error) {
      logger.error(`${messages.auth.errors.service.refresh_auth.base}: ${error}`);
      await transaction.rollback();
      if(error.message === 'invalid signature') {
        return {
          error: true,
          message: messages.auth.errors.service.refresh_auth.token_invalid.base,
          statusCode: 401
        }
      }
      if(error.message === 'jwt malformed') {
        return {
          error: true,
          message: messages.auth.errors.service.refresh_auth.token_invalid.base,
          statusCode: 401
        }
      }
      return {
        error: true,
        message: `${messages.auth.errors.service.refresh_auth.base}: ${error}`,
        statusCode: 500
      }
    }
  },


  /**
   * The function `removeRefreshToken` removes a refresh token from the database after validating its
   * authenticity and existence.
   * @param refreshToken - The `removeRefreshToken` function you provided is designed to remove a
   * refresh token from the database. The `refreshToken` parameter is the token that needs to be
   * removed from the database. This token is used for authentication purposes and is typically issued
   * to clients for requesting new access tokens.
   * @returns The `removeRefreshToken` function returns an object with properties based on different
   * scenarios:
   */
  async removeRefreshToken(refreshToken) {
    const transaction = await sequelize.transaction();
    try {

      // validate if the parameter is empty or is not a string
      if(refreshToken === null) {
        await transaction.rollback();
        return {
          error: true,
          message: messages.auth.errors.service.refresh_auth.token_invalid.empty,
          statusCode: 400
        }
      };
      if(typeof refreshToken === 'number') {
        await transaction.rollback();
        return {
          error: true,
          message: messages.auth.errors.service.refresh_auth.token_invalid.base,
          statusCode: 400
        }
      };

      // Validate if token is valid
      const refreshTokenValid = jwt.verify(refreshToken, secretKey);
      if(!refreshTokenValid) {
        await transaction.rollback();
        return {
          message: messages.auth.errors.service.refresh_auth.token_invalid.base,
          error: true,
          statusCode: 401
        };
      };

      const refreshTokenExist = await AuthToken.findOne({
        where: {
          token: refreshToken
        }
      });

      if(!refreshTokenExist) {
        await transaction.rollback();
        return {
          error: true,
          message:  messages.auth.errors.service.login.login_required,
          statusCode: 401
        }
      };

      // Remove authToken register
      await AuthToken.destroy({
        where: {
          id: refreshTokenExist.id
        },
        transaction
      });

      // Commit transaction
      await transaction.commit();

      return {
        error: false,
        statusCode: 200,
        message:  messages.auth.success.refresh_token
      }

    } catch (error) {
      await transaction.rollback();
      logger.error(`${messages.auth.errors.service.refresh_auth.remove_token}: ${error}`);
      if(error.message === 'invalid signature') {
        return {
          error: true,
          message: messages.auth.errors.service.refresh_auth.token_invalid.base,
          statusCode: 401
        }
      }
      if(error.message === 'jwt malformed') {
        return {
          error: true,
          message: messages.auth.errors.service.refresh_auth.token_invalid.base,
          statusCode: 401
        }
      }
      return {
        error: true,
        message: `${messages.auth.errors.service.refresh_auth.remove_token}: ${error}`,
        statusCode: 500
      }
    }
  },

}
