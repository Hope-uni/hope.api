const logger = require('@config/logger.config');
const {
  all,
  findOne,
  create,
  update,
  removePatient,
  allPatientsWithoutTherapist,
  allPatientsAvailableForActivities,
  changeTherapist
} = require('@services/patient.service');
const { messages, userPersonEntries, formatJoiMessages } = require('@utils');
const { patientEntry, idEntry, paginationEntry } = require('@validations');

module.exports = {

  async all(req,res) {
    try {

      const { error } = patientEntry.patientFilterValidation(req.query);
      if(error) {
        return res.status(400).json({
          error: true,
          statusCode: 422,
          message: formatJoiMessages(error)
        })
      }

      const { error: dataError, statusCode, message, ...resData } = await all(req.query);
      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message,
        });
      };

      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message,
        ...resData
      });

    } catch (error) {
      logger.error(`${messages.patient.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      });
    }
  },

  async allPatientsWithoutTherapist(req,res) {
    try {

      const { error } = paginationEntry(req.query);
      if(error) {
        return res.status(400).json({
          error: true,
          statusCode: 422,
          message: formatJoiMessages(error)
        });
      }

      const { error:dataError, statusCode, message, ...resData } = await allPatientsWithoutTherapist(req.query);

      if(dataError) {
        return res.status(statusCode).json({
          error:dataError,
          statusCode,
          message,
        });
      }

      return res.status(statusCode).json({
        error:dataError,
        statusCode,
        message,
        ...resData
      });

    } catch (error) {
      logger.error(`${messages.patient.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      });
    }
  },

  async allPatientsAvailableForActivities(req,res) {
    try {

      const { error } = patientEntry.patientAvailableForActivityValidation({
        ...req.query,
        activityId: req.params.id
      });
      if(error) {
        return res.status(400).json({
          error: true,
          statusCode: 422,
          message: formatJoiMessages(error)
        });
      }

      const { error:dataError, message, statusCode, ...data } = await allPatientsAvailableForActivities(
        req.params.id,
        req.query,
        req.payload
      );

      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message
        });
      }

      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message,
        ...data
      });

    } catch(error) {
      logger.error(`${messages.patient.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server
      });
    }
  },

  async findPatient(req,res) {
    try {

      // joi validation
      const { error } = await idEntry.findOneValidation({id: req.params.id},messages.patient.fields.id);
      if(error) return res.status(400).json({
        error: true,
        statusCode: 422,
        message: messages.generalMessages.bad_request,
        validationErrors: formatJoiMessages(error),
      })

      const { error:dataError, statusCode, message, validationErrors, data } = await findOne(req.params.id, req.payload);
      if(dataError) {
        return res.status(statusCode).json({
          error:dataError,
          statusCode,
          message,
          validationErrors
        });
      };

      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message,
        data
      });

    } catch (error) {
      logger.error(`${messages.patient.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      });
    }
  },

  async createPatient(req,res) {
    try {
      // Destructuring Object
      const { tutorId, therapistId, phaseId, teaDegreeId, observations, ...resBody } = req.body;

      // Patient joi validation
      const { error } = patientEntry.createPatientValidation({ tutorId, therapistId, phaseId, teaDegreeId, observations});


      // User and Person joi validation
      const { error:customError } = userPersonEntries.userPersonCreateValidation(resBody);

      if(error || customError) {
        const userPersonErrors = customError ? customError.details : [];
        const patientErrors = error ? error.details : [];

        const joinErrors = {
          details: [
            ...userPersonErrors,
            ...patientErrors
          ]
        }

        return res.status(400).json({
          error: true,
          statusCode: 422,
          message: messages.generalMessages.bad_request,
          validationErrors: formatJoiMessages(joinErrors),
        });
      }


      const { error:dataError, statusCode, message, validationErrors, data } = await create(req.body, req.payload);
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
      logger.error(`${messages.patient.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      });
    }
  },

  async updatePatient(req,res) {
    try {
      // Destructuring Object
      const { tutorId,...resBody } = req.body;

      // Patient joi validation
      const { error } = patientEntry.updatePatientValidation({ id: req.params.id, tutorId});

      // User and Person joi validation
      const { error:customError } = userPersonEntries.userPersonUpdateValidation(resBody);

      if(error || customError) {
        const userPersonErrors = customError ? customError.details : [];
        const patientErrors = error ? error.details : [];

        const joinErrors = {
          details: [
            ...userPersonErrors,
            ...patientErrors
          ]
        }

        return res.status(400).json({
          error: true,
          statusCode: 422,
          message: messages.generalMessages.bad_request,
          validationErrors: formatJoiMessages(joinErrors),
        });
      }

      const { error:dataError, statusCode, message, validationErrors, data } = await update(req.params.id, req.body, req.payload);
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
      logger.error(`${messages.patient.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      });
    }
  },

  async removePatient(req,res) {
    try {
      // Joi Validation
      const { error } = idEntry.findOneValidation({id: req.params.id}, messages.patient.fields.id);
      if(error) return res.status(400).json({
        error: true,
        statusCode: 422,
        message: messages.generalMessages.bad_request,
        validationErrors: formatJoiMessages(error),
      });

      const { error:dataError, statusCode, message, validationErrors } = await removePatient(req.params.id);
      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message,
          validationErrors
        });
      };

      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message
      });

    } catch (error) {
      logger.error(`${messages.patient.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      });
    }
  },

  async changeTherapist(req,res) {
    try {

      const { error } = patientEntry.changeTherapistValidation({ patientId: req.params.id, ...req.body });
      if(error) {
        return res.status(400).json({
          error: true,
          statusCode: 422,
          message: error.details[0].message
        });
      }

      const { error: dataError, statusCode, message } = await changeTherapist({ patientId: req.params.id, ...req.body });

      if(dataError) {
        return res.status(statusCode).json({
          error: dataError,
          statusCode,
          message
        });
      }

      return res.status(statusCode).json({
        error: dataError,
        statusCode,
        message
      });

    } catch(error) {
      logger.error(`${messages.patient.errors.controller}: ${error}`);
      return res.status(500).json({
        error: true,
        statusCode: 500,
        message: messages.generalMessages.server,
      });
    }
  }

}
