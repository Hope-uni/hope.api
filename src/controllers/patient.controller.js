const logger = require('@config/logger.config');
const {
  all,
  findOne,
  create,
  update,
  removePatient
} = require('@services/patient.service');

const {
  findOneValidation
} = require('@validations/index.validation');
const {
  createPatientValidation,
  updatePatientValidation
} = require('@validations/patient.validation');
const {
  userPersonCreateValidation,
  userPersonUpdateValidation
} = require('@utils/user-person-entries.util');

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
      logger.error(`There was an error in Patient controller: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `There was an error in Patient controller: ${error}`
      }); 
    }
  },

  async findPatient(req,res) {
    try {
      
      // joi validation
      const { error } = await findOneValidation({id: req.params.id});
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
      logger.error(`There was an error in Patient controller: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `There was an error in Patient controller: ${error}`
      }); 
    }
  },

  async createPatient(req,res) {
    try {
      // Destructuring Object
      const { age, idTutor, ...resBody } = req.body;

      // Patient joi validation
      const { error } = createPatientValidation({ age, idTutor});
      if(error) return res.status(400).json({
        error: true,
        statusCode: 400,
        message: error.details[0].message
      });

      // User and Person joi validation
      const { error:customError } = userPersonCreateValidation(resBody);
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
      logger.error(`There was an error in Patient controller: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `There was an error in Patient controller: ${error}`
      }); 
    }
  },

  async updatePatient(req,res) {
    try {
      
      // Destructuring Object
      const { age, idTutor,...resBody } = req.body;
      
      // Patient joi validation
      const { error } = updatePatientValidation({ id: req.params.id, age, idTutor});
      if(error) return res.status(400).json({
        error: true,
        statusCode: 400,
        message: error.details[0].message
      });

      // User and Person joi validation
      const { error:customError } = userPersonUpdateValidation(resBody);
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
      logger.error(`There was an error in Patient controller: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `There was an error in Patient controller: ${error}`
      }); 
    }
  },

  async removePatient(req,res) {
    try {
      // Joi Validation
      const { error } = findOneValidation({id: req.params.id});
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
      logger.error(`There was an error in Patient controller: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `There was an error in Patient controller: ${error}`
      }); 
    }
  }

}