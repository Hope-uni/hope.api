const { Patient, TutorTherapist, Person } = require('@models/index');
const logger = require('@config/logger.config');
const messages = require('@utils/messages.utils');


module.exports = {

  async getPatient(id) {
    try {
      
      const patientResponse = await Patient.findOne({
        where: {
          status: true,
          userId: id,
        },
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'status'],
        },
        include: [
          {
            model: Person,
            attributes: {
              exclude: ['createdAt','updatedAt','status']
            }
          }
        ]
      });

      if(!patientResponse) {
        return {
          statusCode: 404,
          error: true,
          message: messages.patient.errors.not_found,
        }
      }

      // Full Name validation
      let fullName = `${patientResponse.Person.firstName} ${patientResponse.Person.secondName} ${patientResponse.Person.surname} ${patientResponse.Person.secondSurname}`; // Patient
      if(!patientResponse.Person.secondName || !patientResponse.Person.secondSurname) {
        fullName = `${patientResponse.Person.firstName} ${patientResponse.Person.surname}`;
      }

      /// Building the json response structure
      const newPatientStructure = {
        profileId: patientResponse.id,
        fullName,
        firstName: patientResponse.Person.firstName,
        secondName: patientResponse.Person.secondName,
        surname: patientResponse.Person.surname,
        secondSurname: patientResponse.Person.secondSurname,
        image: patientResponse.Person.imageProfile,
        address: patientResponse.Person.address,
        birthday: patientResponse.Person.birthday,
        gender: patientResponse.Person.gender,
      }

      return {
        statusCode: 200,
        error: false,
        data: newPatientStructure,
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
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status','personId']
        },
        include: [
          {
            model: Person,
            attributes: {
              exclude: ['createdAt','updatedAt','status']
            }
          }
        ],
      });

      if(!tutorTherapistResponse) {
        return {
          statusCode: 404,
          error: true,
          message: messages.auth.errors.not_found.tutorTherapist,
        }
      }

      // Therapist Fullname validation
      let fullName = `${tutorTherapistResponse.Person.firstName} ${tutorTherapistResponse.Person.secondName} ${tutorTherapistResponse.Person.surname} ${tutorTherapistResponse.Person.secondSurname}`;
      if(!tutorTherapistResponse.Person.secondName || !tutorTherapistResponse.Person.secondSurname) {
        fullName = `${tutorTherapistResponse.Person.firstName} ${tutorTherapistResponse.Person.surname}`;
      }

      /// Building the json response structure
      const newTutorTherapistStructure = {
        profileId: tutorTherapistResponse.id,
        fullName,
        firstName: tutorTherapistResponse.Person.firstName,
        secondName: tutorTherapistResponse.Person.secondName,
        surname: tutorTherapistResponse.Person.surname,
        secondSurname: tutorTherapistResponse.Person.secondSurname,
        image: tutorTherapistResponse.Person.imageProfile,
        identificationNumber: tutorTherapistResponse.identificationNumber,
        phoneNumber: tutorTherapistResponse.phoneNumber ? `${tutorTherapistResponse.phoneNumber}` : null,
        telephone: tutorTherapistResponse.telephone ? `${tutorTherapistResponse.telephone}` : null,
        address: tutorTherapistResponse.Person.address,
        birthday: tutorTherapistResponse.Person.birthday,
        gender: tutorTherapistResponse.Person.gender,
      }

      return {
        statusCode: 200,
        error: false,
        data: newTutorTherapistStructure,
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