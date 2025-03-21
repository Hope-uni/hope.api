const { Pictogram } = require('@models/index');
const { Op } = require('sequelize');
const logger = require('@config/logger.config');
const { messages, formatErrorMessages } = require('@utils/index');


module.exports = {

  async validatePictogram(pictogramSentence) {

    try {

      /* eslint-disable */
      for (const item of pictogramSentence) {
        const getPictogram = await Pictogram.findOne({
          where: {
            id: item,
            status: true
          }
        });

        if(!getPictogram) {
          return {
            error: true,
            message:  messages.activity.errors.service.pictograms,
            statusCode: 404,
            validationErrors: formatErrorMessages('pictograms', messages.activity.errors.service.pictograms),
          }
        }
      }

      return {
        error: false,
      }

    } catch (error) {
      logger.error(`${messages.activity.errors.service.base}: ${error}`);
      return {
        error: true,
        message: messages.generalMessages.server,
        statusCode: 500
      }
    }
  },

  async getPictograms(pictogramSentence) {
    try {

      // get array from the string
      const pictogramArray = pictogramSentence.split('-');

      // GetPictograms
      const pictograms = await Pictogram.findAll({
        where: {
          id: {
            [Op.in]: pictogramArray
          }
        },
        attributes: ['id', 'name', 'imageUrl'],
      });

      if(!pictograms) {
        return {
          error: true,
          message: messages.pictogram.errors.service.all,
          statusCode: 404
        }
      };

      return {
        error: false,
        message: messages.pictogram.success.all,
        pictograms,
      }


    } catch (error) {
      logger.error(`${messages.activity.errors.service.base}: ${error}`);
      return {
        error: true,
        message: messages.generalMessages.server,
        statusCode: 500
      }
    }
  }


}
