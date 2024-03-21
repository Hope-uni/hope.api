const { Therapist, Person, User } = require('@models/index.js');
const logger = require('@config/logger.config');
const { paginationValidation, getPageData } = require('@utils/pagination.util');


module.exports = {

  async all(query) {
    try {
      
      // Pagination
      const { limit, offset } = paginationValidation(query.page, query.size);


      const data = await Therapist.findAndCountAll({
        limit,
        offset,
        where: {
          status: true
        },
        attributes: {
          exclude: ['createdAt','updatedAt','status']
        },
        include: [
          {
            model: Person,
            attributes: {
              exclude: ['createdAt','updatedAt']
            }
          },
          {
            model: User,
            attributes: {
              exclude: ['createdAt','updatedAt','status']
            }
          }
        ]
      });

      if(data.count === 0) {
        return {
          error: true,
          message: 'No existen terapeutas en el sistema',
          statusCode: 404
        }
      };

      const dataResponse = getPageData(data, query.page, limit);

      return {
        error: false,
        ...dataResponse
      }

    } catch (error) {
      logger.error(`There was an error in Therapiist services: ${error}`);
      return {
        error: true,
        message: `There was an error in Therapist services: ${error}`,
        statusCode: 500
      }
    }
  }

}