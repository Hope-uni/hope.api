const { Patient, TutorTherapist, HealthRecord, Person } = require('@models/index');
const logger = require('@config/logger.config');
const { messages } = require('@utils/index');
const { getFullName } = require('@utils/dataStructure/index');


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
          },
          {
            model: HealthRecord,
            attributes: {
              exclude: ['createdAt','updatedAt','status','patientId']
            },
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

      /// Building the json response structure
      const newPatientStructure = {
        profileId: patientResponse.id,
        fullName: getFullName(patientResponse.Person),
        firstName: patientResponse.Person.firstName,
        secondName: patientResponse.Person.secondName,
        surname: patientResponse.Person.surname,
        secondSurname: patientResponse.Person.secondSurname,
        image: patientResponse.Person.imageProfile,
        address: patientResponse.Person.address,
        birthday: patientResponse.Person.birthday,
        gender: patientResponse.Person.gender,
        isMonochrome: patientResponse.HealthRecord.isMonochrome
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

      /// Building the json response structure
      const newTutorTherapistStructure = {
        profileId: tutorTherapistResponse.id,
        fullName: getFullName(tutorTherapistResponse.Person),
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
