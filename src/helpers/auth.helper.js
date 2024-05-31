const { Patient, TutorTherapist } = require('@models/index');
const logger = require('@config/logger.config');
const messages = require('@utils/messages.utils');


module.exports = {

  async getPatient(id) {
    try {
      
      const patientResponse = await Patient.findOne({
        where: {
          status: true,
          userId: id,
        }
      });

      if(!patientResponse) {
        return {
          statusCode: 404,
          error: true,
          message: messages.patient.errors.not_found,
        }
      }

      return {
        statusCode: 200,
        error: false,
        id: patientResponse.id,
      }

    } catch (error) {
      logger.error(`${messages.auth.errors.service.me.get_patient}: ${error}`);
      return {
        statusCode: 500,
        error: true,
        message: `${messages.auth.errors.service.me.get_patient}: ${error}`,
      }
    }
  },

  async getTutorTherapist(id) {
    try {
      
      const tutorTherapistResponse = await TutorTherapist.findOne({
        where: {
          status: true,
          userId: id,
        }
      });

      if(!tutorTherapistResponse) {
        return {
          statusCode: 404,
          error: true,
          message: messages.auth.errors.not_found.tutorTherapist,
        }
      }

      return {
        statusCode: 200,
        error: false,
        id: tutorTherapistResponse.id,
      }

    } catch (error) {
      logger.error(`${messages.auth.errors.service.me.get_tutorTherapist}: ${error}`);
      return {
        statusCode: 500,
        error: true,
        message: `${messages.auth.errors.service.me.get_tutorTherapist}: ${error}`,
      }
    }
  }

}