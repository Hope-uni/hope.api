const logger = require('@config/logger.config');
const { messages, userPersonEntries } = require('@utils/index');
const {
  all,
  findOne,
  create,
  update,
  removePatient
} = require('@services/patient.service');
const { patientEntry, idEntry } = require('@validations/index');

module.exports = {

  async all(req,res) {
    try {
      const { error, statusCode, message, ...resData } = await all(req.query);
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
      logger.error(`${messages.patient.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `${messages.patient.errors.controller}: ${error}`
      }); 
    }
  },

  async findPatient(req,res) {
    try {
      
      // joi validation
      const { error } = await idEntry.findOneValidation({id: req.params.id});
      if(error) return res.status(400).json({
        error: true,
        statusCode: 400,
        message: error.details[0].message
      })
      
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
      logger.error(`${messages.patient.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `${messages.patient.errors.controller}: ${error}`
      }); 
    }
  },

  async createPatient(req,res) {
    try {
      // Destructuring Object
      const { age, idTutor, ...resBody } = req.body;

      // Patient joi validation
      const { error } = patientEntry.createPatientValidation({ age, idTutor});
      if(error) return res.status(400).json({
        error: true,
        statusCode: 400,
        message: error.details[0].message
      });

      // User and Person joi validation
      const { error:customError } = userPersonEntries.userPersonCreateValidation(resBody);
      if(customError) return res.status(400).json({
        error: true,
        statusCode: 400,
        message: customError
      });

      const { error:dataError, statusCode, message, data } = await create(req.body);
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
      logger.error(`${messages.patient.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `${messages.patient.errors.controller}: ${error}`
      }); 
    }
  },

  async updatePatient(req,res) {
    try {
      // Destructuring Object
      const { age, idTutor,...resBody } = req.body;
      
      // Patient joi validation
      const { error } = patientEntry.updatePatientValidation({ id: req.params.id, age, idTutor});
      if(error) return res.status(400).json({
        error: true,
        statusCode: 400,
        message: error.details[0].message
      });

      // User and Person joi validation
      const { error:customError } = userPersonEntries.userPersonUpdateValidation(resBody);
      if(customError) return res.status(400).json({
        error: true,
        statusCode: 400,
        message: customError
      });

      const { error:dataError, statusCode, message, data } = await update(req.params.id, req.body);
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
      logger.error(`${messages.patient.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `${messages.patient.errors.controller}: ${error}`
      }); 
    }
  },

  async removePatient(req,res) {
    try {
      // Joi Validation
      const { error } = idEntry.findOneValidation({id: req.params.id});
      if(error) return res.status(400).json({
        error: true,
        statusCode: 400,
        message: error.details[0].message
      });

      const { error:dataError, statusCode, message } = await removePatient(req.params.id);
      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
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
      logger.error(`${messages.patient.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `${messages.patient.errors.controller}: ${error}`
      }); 
    }
  }

}