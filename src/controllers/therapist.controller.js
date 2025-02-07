const logger = require('@config/logger.config');
const { messages, userPersonEntries } = require('@utils/index');
const { formatJoiMessages, formatErrorMessages } = require('@utils/formatErrorMessages.util');
const { therapistEntry, idEntry } = require('@validations/index');
const {
  all,
  findOne,
  create,
  update,
  removeTherapist,
  assignPatient,
} = require('../services/therapist.service');

module.exports = {

  async all(req,res) {
    try {
      
      const { error, message, statusCode, validationErrors, ...resData } = await all(req.query);

      if(error) {
        return res.status(statusCode).json({
          error,
          statusCode,
          message,
          formatErrorMessages,
        });
      };

      return res.status(statusCode).json({
        error,
        statusCode,
        message,
      ...resData
      });

    } catch (error) {
      logger.error(`${messages.therapist.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }); 
    }
  },


  async findTherapist(req,res) {
    try {
      
      const { error } = idEntry.findOneValidation({id:req.params.id});
      if(error) return res.status(400).json({
        error: true,
        statusCode: 422,
        message: `BAD_REQUEST`, 
        validationErrors: {
          something: error.details[0].message
        }
      });

      const { error:dataError, statusCode, message, validationErrors, data } = await findOne(req.params.id);
      if(dataError) {
        return res.status(statusCode).json({
          error:dataError,
          statusCode,
          message,
          validationErrors,
        });
      };

      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message,
        data
      });

    } catch (error) {
      logger.error(`${messages.therapist.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }); 
    }
  },


  async createTherapist(req,res) {
    try {
      
      // destructuring object
      const { phoneNumber, identificationNumber, ...resBody } = req.body;

      // User and Person joi validation
      const { error:customError } = userPersonEntries.userPersonCreateValidation(resBody);

      // Therapist joi validation
      const { error } = therapistEntry.createTherapistValidation({ phoneNumber, identificationNumber });

      if(error || customError) {
        const personError = customError ? customError.details : [];
        const therapistError = error ? error.details : [];

        const joinError = {
          details: [
            ...personError,
            ...therapistError
          ]
        }

        return res.status(400).json({
          error: true,
          statusCode: 422,
          message: messages.generalMessages.bad_request,
          validationErrors: formatJoiMessages(joinError),
        });
      }


      const { error:dataError, statusCode, validationErrors, message, data } = await create(req.body);
      if(dataError) {
        return res.status(statusCode).json({
          error:dataError,
          statusCode,
          message,
          validationErrors,
        });
      };

      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message,
        data
      });

    } catch (error) {
      logger.error(`${messages.therapist.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }); 
    }
  },

  /* This `async updateTherapist(req, res)` function is responsible for handling the updating of a
  therapist's information. Here is a breakdown of what the function is doing: */
  async updateTherapist(req,res) {
    try {
      
      // destructuring obejct
      const { phoneNumber, identificationNumber,...resBody } = req.body;

      // User and Person joi validation
      const { error:customError } = userPersonEntries.userPersonUpdateValidation(resBody);

      // Therapist joi validation
      const { error } = therapistEntry.updateTherapistValidation({id:req.params.id, phoneNumber, identificationNumber });
      
      if(error || customError) {
        const personError = customError ? customError.details : [];
        const therapistError = error ? error.details : [];

        const joinError = {
          details: [
            ...personError,
            ...therapistError
          ]
        }

        return res.status(400).json({
          error: true,
          statusCode: 422,
          message: messages.generalMessages.bad_request,
          validationErrors: formatJoiMessages(joinError),
        });
      }


      const { error:dataError, message, statusCode,  validationErrors, data } = await update(req.params.id,req.body);
      if(dataError) {
        return res.status(statusCode).json({
          error:dataError,
          statusCode,
          message,
          validationErrors,
        });
      };

      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message,
        data
      });

    } catch (error) {
      logger.error(`${messages.therapist.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }); 
    }
  },


  /* This `async removeTherapist(req, res)` function is responsible for handling the removal of a
  therapist based on the ID provided in the request parameters. Here is a breakdown of what the
  function is doing: */
  async removeTherapist(req,res) {
    try {
      
      // joi validation
      const { error } = idEntry.findOneValidation({id:req.params.id});
      if(error) return res.status(400).json({ 
        error: true,
        statusCode: 422,
        message: messages.generalMessages.bad_request,
        validationErrors: formatJoiMessages(error),
      });

      const { error:dataError, statusCode, message, validationErrors } = await removeTherapist(req.params.id);
      if(dataError) {
        return res.status(statusCode).json({
          error:dataError,
          statusCode,
          message,
          validationErrors,
        });
      };
      
      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message
      });

    } catch (error) {
      logger.error(`${messages.therapist.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }); 
    }
  },

  async assignPatient(req, res) {
    try {
      
      const { error } = therapistEntry.assignPatientValidation(req.body);
      if(error) return res.status(400).json({ 
        error: true,
        statusCode: 422,
        message: messages.generalMessages.bad_request,
        validationErrors: formatJoiMessages(error),
      });

      const { error:dataError, message, statusCode, validationErrors, data } = await assignPatient(req.body);

      if(dataError) {
        return res.status(statusCode).json({
          error:dataError,
          statusCode,
          message,
          validationErrors,
          data: data ?? ''
        });
      };

      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message
      });

    } catch (error) {
      logger.error(`${messages.therapist.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }); 
    }
  }

}