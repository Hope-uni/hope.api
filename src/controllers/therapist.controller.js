const logger = require('@config/logger.config');
const { messages, userPersonEntries } = require('@utils/index');
const { therapistEntry, idEntry } = require('../validations/index');
const {
  all,
  findOne,
  create,
  update,
  removeTherapist,
  assignPatient,
} = require('../services/therapist.service');

module.exports = {

  /* This code snippet is defining an asynchronous function named `all` inside a module.exports object.
  The function is designed to handle a request and response object, likely as part of a controller
  in a Node.js application. */
  async all(req,res) {
    try {
      
      const { error, message, statusCode, ...resData } = await all(req.query);

      if(error) {
        return res.status(statusCode).json({
          error,
          statusCode,
          message
        });
      };

      return res.status(200).json({
        error,
        statusCode: 200,
        message,
      ...resData
      });

    } catch (error) {
      logger.error(`${messages.therapist.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `${messages.therapist.errors.controller}: ${error}`
      }); 
    }
  },

  /* This `async findTherapist(req, res)` function is responsible for handling the logic to find a
  specific therapist based on the ID provided in the request parameters. Here is a breakdown of what
  the function is doing: */
  async findTherapist(req,res) {
    try {
      
      const { error } = idEntry.findOneValidation({id:req.params.id});
      if(error) return res.status(400).json({
        error: true,
        statusCode: 400,
        message: error.details[0].message
      });

      const { error:dataError, statusCode, message, data } = await findOne(req.params.id);
      if(dataError) {
        return res.status(statusCode).json({
          error:dataError,
          statusCode,
          message
        });
      };

      return res.status(200).json({
        error: dataError,
        statusCode: 200,
        message,
        data
      });

    } catch (error) {
      logger.error(`${messages.therapist.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `${messages.therapist.errors.controller}: ${error}`
      }); 
    }
  },

  /* This `async createTherapist(req, res)` function is responsible for handling the creation of a new
  therapist. Here is a breakdown of what the function is doing: */
  async createTherapist(req,res) {
    try {
      
      // destructuring object
      const { phoneNumber, identificationNumber, ...resBody } = req.body;

      // User and Person joi validation
      const { error:customError } = userPersonEntries.userPersonCreateValidation(resBody);
      if(customError) return res.status(422).json({
        error: true,
        statusCode: 422,
        message: customError
      });


      // Therapist joi validation
      const { error } = therapistEntry.createTherapistValidation({ phoneNumber, identificationNumber });
      if(error) return res.status(400).json({
        error: true,
        statusCode: 400,
        message: error.details,
      });

      const { error:dataError, statusCode, message, data } = await create(req.body);
      if(dataError) {
        return res.status(statusCode).json({
          error:dataError,
          statusCode,
          message
        });
      };

      return res.status(201).json({
        error: dataError,
        statusCode: 201,
        message,
        data
      });

    } catch (error) {
      logger.error(`${messages.therapist.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `${messages.therapist.errors.controller}: ${error}`
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
      if(customError) return res.status(400).json({
        error: true,
        statusCode: 400,
        message: customError
      });

      // Therapist joi validation
      const { error } = therapistEntry.updateTherapistValidation({id:req.params.id, phoneNumber, identificationNumber });
      if(error) return res.status(400).json({
        error: true,
        statusCode: 400,
        message: error.details[0].message
      });

      const { error:dataError, message, statusCode, data } = await update(req.params.id,req.body);
      if(dataError) {
        return res.status(statusCode).json({
          error:dataError,
          statusCode,
          message
        });
      };

      return res.status(200).json({
        error: dataError,
        statusCode: 200,
        message,
        data
      });

    } catch (error) {
      logger.error(`${messages.therapist.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `${messages.therapist.errors.controller}: ${error}`
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
      if(error) return res.status(400).json({ error: error.details[0].message });

      const { error:dataError, statusCode, message } = await removeTherapist(req.params.id);
      if(dataError) {
        return res.status(statusCode).json({
          error:dataError,
          statusCode,
          message
        });
      };
      
      return res.status(200).json({
        error: dataError,
        statusCode: 200,
        message
      });

    } catch (error) {
      logger.error(`${messages.therapist.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `${messages.therapist.errors.controller}: ${error}`
      }); 
    }
  },

  async assignPatient(req, res) {
    try {
      
      const { error } = therapistEntry.assignPatientValidation(req.body);
      if(error) return res.status(400).json({ error: error.details[0].message });

      const { error:dataError, message, statusCode, data } = await assignPatient(req.body);

      if(dataError) {
        return res.status(statusCode).json({
          error:dataError,
          statusCode,
          message,
          data: data ?? ''
        });
      };

      return res.status(200).json({
        error: dataError,
        statusCode: 200,
        message
      });

    } catch (error) {
      logger.error(`${messages.therapist.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `${messages.therapist.errors.controller}: ${error}`
      }); 
    }
  }

}