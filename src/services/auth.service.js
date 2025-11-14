const {
  User,
  AuthToken,
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
const { userLoginIncludes, meIncludes } = require('@queryIncludes');

module.exports = {

  async login(body) {
    const transaction = await sequelize.transaction();
    try {
      // Variables
      const  userIncludes = userLoginIncludes(); // Includes for user
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
        include: userIncludes
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

  async me(payload) {
    try {

      // Variables
      const userMeIncludes = meIncludes(); // Includes for user

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
        include: userMeIncludes
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
