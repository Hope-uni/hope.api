const logger = require('@config/logger.config');
const {
  all,
  findOne,
  create,
  update,
  removeTutor
} = require('@services/tutor.service');
const { messages, userPersonEntries, formatJoiMessages } = require('@utils/index');
const { tutorEntry, idEntry } = require('@validations/index');


module.exports = {

  /* The `async allTutors(req, res)` function is an asynchronous function that serves as a controller
  method for handling requests related to fetching all tutors. Here's a breakdown of what the
  function does: */
  async allTutors(req,res) {
    try {
      
      const { error, message, statusCode, ...resData} = await all(req.query);
      if(error) {
        return res.status(statusCode).json({
          error,
          statusCode,
          message
        });
      };

      return res.status(statusCode).json({
        error,
        statusCode,
        message,
        ...resData
      });

    } catch (error) {
      logger.error(`${messages.tutor.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }); 
    }
  },

  /* The `async findTutor(req, res)` function is a controller method that handles requests related to
  finding a specific tutor by their ID. Here's a breakdown of what the function does: */
  async findTutor(req,res) {
    try {
      
      // Joi validation
      const { error } = idEntry.findOneValidation({id:req.params.id});
      if(error) return res.status(400).json({ 
        error: true,
        statusCode: 422,
        message: messages.generalMessages.bad_request,
        validationErrors: formatJoiMessages(error),
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
      logger.error(`${messages.tutor.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `${messages.tutor.errors.controller}: ${error}`
      }); 
    }
  },

  /* The `async createTutor(req, res)` function is a controller method that handles requests related to
  creating a new tutor. Here's a breakdown of what the function does: */
  async createTutor(req,res) {
    try {
      // destructuring object
      const { phoneNumber, telephone, identificationNumber, ...resBody } = req.body;
      
      // User and Person joi validation
      const { error:customError } = userPersonEntries.userPersonCreateValidation(resBody);
      
      // Tutor joi validation
      const { error } = tutorEntry.createTutorValidation({ phoneNumber, telephone, identificationNumber });

      if(error || customError) {
        const userPersonErrors = customError ? customError.details : [];
        const tutorErrors = error ? error.details : [];

        const joinErrors = {
          details: [
            ...userPersonErrors,
            ...tutorErrors
          ]
        }

        return res.status(400).json({
          error: true,
          statusCode: 422,
          message: messages.generalMessages.bad_request,
          validationErrors: formatJoiMessages(joinErrors),
        });
      }

      const { error:dataError, statusCode, message, validationErrors, data } = await create(req.body);
      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
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
      logger.error(`${messages.tutor.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }); 
    }
  },

  /* The `async update(req, res)` function is a controller method that handles requests related to
  updating a tutor's information. Here's a breakdown of what the function does: */
  async update(req,res) {
    try {
      // destructuring obejct
      const { phoneNumber, identificationNumber, telephone,...resBody } = req.body;
    
      
      // User and person joi validation
      const { error:customError } = userPersonEntries.userPersonUpdateValidation(resBody);
      
      // Joi validation
      const { error } = tutorEntry.updateTutorValidation({id:req.params.id, phoneNumber, identificationNumber, telephone});
      
      if(error || customError) {
        const userPersonErrors = customError ? customError.details : [];
        const tutorErrors = error ? error.details : [];

        const joinErrors = {
          details: [
            ...userPersonErrors,
            ...tutorErrors
          ]
        }

        return res.status(400).json({
          error: true,
          statusCode: 422,
          message: messages.generalMessages.bad_request,
          validationErrors: formatJoiMessages(joinErrors),
        });
      }

      const { error:dataError, statusCode, message, validationErrors, data } = await update(req.params.id,req.body);
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
      logger.error(`${messages.tutor.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }); 
    }
  },

  /* The `async removeTutor(req, res)` function is an asynchronous function that serves as a controller
  method for handling requests related to removing a tutor. Here's a breakdown of what the function
  does: */
  async removeTutor(req,res) {
    try {

      // joi validation
      const { error } = idEntry.findOneValidation({id:req.params.id});
      if(error) return res.status(400).json({
        error: true,
        statusCode: 400,
        message: messages.generalMessages.bad_request,
        validationErrors: formatJoiMessages(error),
      });

      const { error:dataError, statusCode, message, validationErrors } = await removeTutor(req.params.id);
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
      });
      
    } catch (error) {
      logger.error(`${messages.tutor.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      }); 
    }
  },

}