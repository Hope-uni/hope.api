const logger = require('@config/logger.config');
const {
  all,
  findOne,
  create,
  update,
  removeTutor
} = require('@services/tutor.service');
const { findOneValidation } = require('@validations/index.validation');
const {
  createTutorValidation,
  updateTutorValidation
} = require('@validations/tutor.validation');
const {
  userPersonCreateValidation,
  userPersonUpdateValidation
} = require('@utils/user-person-entries.util');


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

      return res.status(200).json({
        error,
        statusCode: 200,
        message,
        ...resData
      });

    } catch (error) {
      logger.error(`There was an error in Tutor controller: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `There was an error in Tutor controller: ${error}`
      }); 
    }
  },

  /* The `async findTutor(req, res)` function is a controller method that handles requests related to
  finding a specific tutor by their ID. Here's a breakdown of what the function does: */
  async findTutor(req,res) {
    try {
      
      // Joi validation
      const { error } = findOneValidation({id:req.params.id});
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
      logger.error(`There was an error in Tutor controller: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `There was an error in Tutor controller: ${error}`
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
      const { error:customError } = userPersonCreateValidation(resBody);
      if(customError) return res.status(400).json({ 
        error: true,
        statusCode: 400,
        message: customError
      });
      
      // Tutor joi validation
      const { error } = createTutorValidation({ phoneNumber, telephone, identificationNumber });
      if(error) return res.status(400).json({
        error: true,
        statusCode: 400,
        message: error.details[0].message
      });

      const { error:dataError, statusCode, message, data } = await create(req.body);
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
        message,
        data
      });

    } catch (error) {
      logger.error(`There was an error in Tutor controller: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `There was an error in Tutor controller: ${error}`
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
      const { error:customError } = userPersonUpdateValidation(resBody);
      if(customError) return res.status(400).json({
        error: true,
        statusCode: 400,
        message: customError
      });
      
      // Joi validation
      const { error } = updateTutorValidation({ id:req.params.id, phoneNumber, identificationNumber, telephone});
      if(error) return res.status(400).json({ error: error.details[0].message });

      const { error:dataError, statusCode, message, data } = await update(req.params.id,req.body);
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
      logger.error(`There was an error in Tutor controller: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `There was an error in Tutor controller: ${error}`
      }); 
    }
  },

  /* The `async removeTutor(req, res)` function is an asynchronous function that serves as a controller
  method for handling requests related to removing a tutor. Here's a breakdown of what the function
  does: */
  async removeTutor(req,res) {
    try {

      // joi validation
      const { error } = findOneValidation({id:req.params.id});
      if(error) return res.status(400).json({
        error: true,
        statusCode: 400,
        message: error.details[0].message
      });

      const { error:dataError, statusCode, message } = await removeTutor(req.params.id);
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
      });
      
    } catch (error) {
      logger.error(`There was an error in Tutor controller: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: `There was an error in Tutor controller: ${error}`
      }); 
    }
  },

}