const { Op } = require('sequelize');
const logger = require('@config/logger.config');
const { TutorTherapist, User, Person, Role, UserRoles, Patient, sequelize } = require('@models/index.js');
const { pagination, messages, userPerson, dataStructure } = require('@utils/index');

const { 
  deleteUser
} = require('./user.service');

module.exports = {
  /* eslint-disable radix */
  /* eslint-disable consistent-return */
  /* eslint-disable no-restricted-syntax */
  /* eslint-disable no-plusplus */
  async all(query) {
    try {

      if(!query.page || !query.size || parseInt(query.page) === 0 && parseInt(query.size) === 0) {
        const data = await TutorTherapist.findAll({
          where: {
            status: true
          },
          attributes: {
            exclude: ['createdAt','updatedAt','status','personId']
          },
          include: [
            {
              model: Person,
              attributes: {
                exclude: ['createdAt','updatedAt','status']
              },
            },
            {
              model: User,
              where: {
                status: true,
              },
              attributes: {
                exclude: ['createdAt','updatedAt','status','password']
              },
              include: [
                {
                  model: UserRoles,
                  where: {
                    roleId: 5,
                  },
                  include: [
                    {
                      model: Role,
                      attributes: {
                        exclude: ['createdAt','updatedAt','status']
                      },
                    }
                  ]
                },
              ]
            },
            {
              model: Patient,
              as: 'patientTutor',
              attributes: {
                exclude: ['createdAt','updatedAt','status']
              },
              include: [
                {
                  model: Person
                },
                {
                  model: User
                }
              ]
            }
          ]
        });

        return {
          error: false,
          message: messages.tutor.success.all,
          data: dataStructure.tutorDataStructure(data),
        }
      }
    
      // Pagination
      const { limit, offset } = pagination.paginationValidation(query.page, query.size);

      const data = await TutorTherapist.findAndCountAll({
        limit,
        offset,
        distinct: true,
        where: {
          status: true
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status', 'personId','userId']
        },
        include: [
          {
            model: Person,
            attributes: {
              exclude: ['createdAt','updatedAt','status']
            },
          },
          {
            model: User,
            where: {
              status: true,
            },
            attributes: {
              exclude: ['createdAt','updatedAt','status','password']
            },
            include: [
              {
                model: UserRoles,
                where: {
                  roleId: 5,
                },
                include: [
                  {
                    model: Role,
                    attributes: {
                      exclude: ['createdAt','updatedAt','status']
                    },
                  }
                ]
              },
            ]
          },
          {
            model: Patient,
            as: 'patientTutor',
            attributes: {
              exclude: ['createdAt','updatedAt','status']
            },
            include: [
              {
                model: Person
              },
              {
                model: User
              }
            ]
          }
        ]
      });

      // Get Tutor Structure
      data.rows = dataStructure.tutorDataStructure(data.rows);

      const dataResponse = pagination.getPageData(data, query.page, limit);

      return {
        error: false,
        message: messages.tutor.success.all,
        ...dataResponse
      }

    } catch (error) {
      logger.error(`${messages.tutor.errors.service.base}: ${error}`);
      return {
        error: true,
        message: `${messages.tutor.errors.service.base}: ${error}`,
        statusCode: 500
      }
    }
  },


  async findOne(id) {
    try {
      
      const data = await TutorTherapist.findOne({
        where: {
          id,
          status: true
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status','userId','personId']
        },
        include: [
          {
            model: Person,
            attributes: {
              exclude: ['createdAt','updatedAt','status']
            },
          },
          {
            model: User,
            where: {
              status: true,
            },
            attributes: {
              exclude: ['createdAt','updatedAt','status','password']
            },
            include: [
              {
                model: UserRoles,
                where: {
                  roleId: 5,
                },
                include: [
                  {
                    model: Role,
                    attributes: {
                      exclude: ['createdAt','updatedAt','status']
                    },
                  }
                ]
              },
            ]
          },
          {
            model: Patient,
            as: 'patientTutor',
            attributes: {
              exclude: ['createdAt','updatedAt','status']
            },
            include: [
              {
                model: Person
              },
              {
                model: User
              }
            ]
          }
        ]
      });

      if(!data) {
        return {
          error: true,
          message: messages.tutor.errors.not_found,
          statusCode: 404,
        }
      };

      return {
        error: false,
        message: messages.tutor.success.found,
        data: dataStructure.findTutorDataStructure(data),
      }

    } catch (error) {
      logger.error(`${messages.tutor.errors.service.base}: ${error}`);
      return {
        error: true,
        message: `${messages.tutor.errors.service.base}: ${error}`,
        statusCode: 500
      }
    }
  },


  async create(body) {
    const transaction = await sequelize.transaction();
    try {

      // Destructuring object
      const { identificationNumber, phoneNumber, telephone, ...resBody } = body;

      // IdentificationNumber validation
      const identificationNumberExist = await TutorTherapist.findOne({
        where: {
          identificationNumber,
          status: true
        }
      });
      if(identificationNumberExist) {
        await transaction.rollback();
        return {
          error: true,
          message: messages.tutor.errors.in_use.identificationNumber,
          statusCode: 400
        };
      };

      // Phone number validation
      const phoneNumberExist = await TutorTherapist.findOne({
        where: {
          phoneNumber,
          status: true
        }
      });
      if(phoneNumberExist) {
        await transaction.rollback();
        return {
          error: true,
          message: messages.tutor.errors.in_use.phoneNumber,
          statusCode: 400
        };
      };

      // Telephone validation
      if(telephone) {
        const telephoneExist = await TutorTherapist.findOne({
          where: {
            telephone,
            status: true
          }
        });
        if(telephoneExist) {
          await transaction.rollback();
          return {
            error: true,
            message: messages.tutor.errors.in_use.phoneNumber,
            statusCode: 400
          };
        };
      }

      /* eslint-disable no-restricted-syntax */
      /* eslint-disable no-await-in-loop */
      /* for (const iterator of resBody.roles) {
        if(iterator !== 5){
          await transaction.rollback();
          return {
            error: true,
            message: messages.tutor.errors.service.not_role,
            statusCode: 400
          }
        }
      } */
      resBody.roles = [5];

      // Validate and create User and Person
      const { error:userPersonError, message, statusCode, data } = await userPerson.createUserPerson(resBody, transaction);
      if(userPersonError) {
        await transaction.rollback();
        return {
          error: userPersonError,
          message,
          statusCode
        };
      }

      // create Tutor
      const tutorResponse = await TutorTherapist.create({
        identificationNumber,
        phoneNumber,
        telephone,
        personId: data.personId,
        userId: data.userId,
      },{transaction});
      if(!tutorResponse) {
        await transaction.rollback();
        return {
          error: true,
          message: messages.tutor.errors.service.create,
          statusCode: 400
        };
      };

      // commit transaction
      await transaction.commit();

      // find Tutor
      const newData = await TutorTherapist.findOne({
        where: {
          id:tutorResponse.id,
          status: true
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status','userId','personId']
        },
        include: [
          {
            model: Person,
            attributes: {
              exclude: ['createdAt','updatedAt','status']
            },
          },
          {
            model: User,
            where: {
              status: true,
            },
            attributes: {
              exclude: ['createdAt','updatedAt','status','password']
            },
            include: [
              {
                model: UserRoles,
                where: {
                  roleId: 5,
                },
                include: [
                  {
                    model: Role,
                    attributes: {
                      exclude: ['createdAt','updatedAt','status']
                    },
                  }
                ]
              },
            ]
          },
          {
            model: Patient,
            as: 'patientTutor',
            attributes: {
              exclude: ['createdAt','updatedAt','status']
            },
            include: [
              {
                model: Person
              },
              {
                model: User
              }
            ]
          }
        ]
      });

      return {
        error: false,
        message: messages.tutor.success.create,
        data: dataStructure.findTutorDataStructure(newData),
      };
    } catch (error) {
      await transaction.rollback();
      logger.error(`${messages.tutor.errors.service.base}: ${error}`);
      return {
        error: true,
        message: `${messages.tutor.errors.service.base}: ${error}`,
        statusCode: 500
      }
    }
  },

  async update(id,body) {
    const transaction = await sequelize.transaction();
    try {
      // validate if tutor exist
      const tutorExist = await TutorTherapist.findOne({
        where: {
          id,
          status: true
        },
        include: [
          {
            model: User,
            where: {
              status: true
            },
            include: {
              model: UserRoles,
              where: {
                roleId: 5,
                userId: {
                  [Op.col]: 'User.id'
                }
              }
            }
          }
        ]
      },{transaction});
      if(!tutorExist) {
        await transaction.rollback();
        return {
          error: true,
          message: messages.tutor.errors.not_found,
          statusCode: 404,
        }
      };

      // destructuring Object
      const {
        identificationNumber,
        phoneNumber,
        telephone,
        ...resData
      } = body;

      // identification number validation
      if(identificationNumber) {
        const identificationNumberExist = await TutorTherapist.findOne({
          where: {
            identificationNumber,
            status: true,
            id: {
              [Op.ne]: id
            }
          }
        });
        if(identificationNumberExist) {
          await transaction.rollback();
          return {
            error: true,
            message: messages.tutor.errors.in_use.identificationNumber,
            statusCode: 400
          };
        };
      }
      // phone number validation
      if(phoneNumber) {
        const phoneNumberExist = await TutorTherapist.findOne({
          where: {
            phoneNumber,
            status: true,
            id: {
              [Op.ne]: id
            }
          }
        });
        if(phoneNumberExist) {
          await transaction.rollback();
          return {
            error: true,
            message: messages.tutor.errors.in_use.phoneNumber,
            statusCode: 400
          };
        };
      }
      // telephone validation
      if(telephone) {
        const telephoneExist = await TutorTherapist.findOne({
          where: {
            telephone,
            status: true,
            id: {
              [Op.ne]: id
            }
          }
        });
        if(telephoneExist) {
          await transaction.rollback();
          return {
            error: true,
            message: messages.tutor.errors.in_use.phoneNumber,
            statusCode: 400
          };
        };
      }

      // Validate and update User and Person
      if(resData) {
        const { error:userPersonError, statusCode, message = messages.tutor.errors.service.update } = await userPerson.updateUserPerson({
          ...resData,
          personId: tutorExist.personId,
          userId: tutorExist.userId,
        }, transaction);
        if(userPersonError) {
          await transaction.rollback();
          return {
            error: userPersonError,
            message,
            statusCode
          };
        };
      }


      // update transaction
      if(identificationNumber || phoneNumber || telephone) {
        const updateTutorResponse = await TutorTherapist.update(
          {
            identificationNumber,
            phoneNumber,
            telephone
          },
          {
            where: {
              id
            },
            transaction
          }
        );
        if(!updateTutorResponse) {
          await transaction.rollback();
          return {
            error: true,
            message: messages.tutor.errors.service.update,
            statusCode: 400
          };
        };
      }

      // Commit Transaction 
      await transaction.commit();

      // find Tutor
      const newData = await TutorTherapist.findOne({
        where: {
          id,
          status: true
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status','userId','personId']
        },
        include: [
          {
            model: Person,
            attributes: {
              exclude: ['createdAt','updatedAt','status']
            },
          },
          {
            model: User,
            where: {
              status: true,
            },
            attributes: {
              exclude: ['createdAt','updatedAt','status','password']
            },
            include: [
              {
                model: UserRoles,
                where: {
                  roleId: 5,
                },
                include: [
                  {
                    model: Role,
                    attributes: {
                      exclude: ['createdAt','updatedAt','status']
                    },
                  }
                ]
              },
            ]
          },
          {
            model: Patient,
            as: 'patientTutor',
            attributes: {
              exclude: ['createdAt','updatedAt','status']
            },
            include: [
              {
                model: Person
              },
              {
                model: User
              }
            ]
          }
        ]
      });



      return {
        error: false,
        message: messages.tutor.success.update,
        data: dataStructure.findTutorDataStructure(newData),
      }
    } catch (error) {
      await transaction.rollback();
      logger.error(`${messages.tutor.errors.service.base}: ${error}`);
      return {
        error: true,
        message: `${messages.tutor.errors.service.base}: ${error}`,
        statusCode: 500
      }
    }
  },

  async removeTutor(id) {
    const transaction = await sequelize.transaction();
    try {
      // validate if tutor exist
      const tutorExist = await TutorTherapist.findOne({
        where: {
          id,
          status: true
        }
      });
      if(!tutorExist) {
        await transaction.rollback();
        return {
          error: true,
          message: messages.tutor.errors.not_found,
          statusCode: 404,
        }
      };

      // remove User
      const { error:userError, statusCode } = await deleteUser(tutorExist.userId, transaction);
      if(userError) {
        await transaction.rollback();
        return {
          error: userError,
          message: messages.tutor.errors.service.delete,
          statusCode
        }
      };

      // update transaction
      const updateTutorResponse = await TutorTherapist.update(
        {
          status: false
        },
        {
          where: {
            id
          },
          transaction
        }
      );
      if(!updateTutorResponse) {
        await transaction.rollback();
        return {
          error: true,
          message: messages.tutor.errors.service.delete,
          statusCode: 400
        };
      };

      // commit transaction
      await transaction.commit();

      return {
        error: false,
        message: messages.tutor.success.delete,
      }
    } catch (error) {
      await transaction.rollback();
      logger.error(`${messages.tutor.errors.service.base}: ${error}`);
      return {
        error: true,
        message: `${messages.tutor.errors.service.base}: ${error}`,
        statusCode: 500
      }
    }
  }

}