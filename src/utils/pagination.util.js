module.exports = {

  paginationValidation(page, size) {
    /* eslint-disable no-param-reassign */
    if(+page <= 0 ) {
      page = 1;
    }

    const limit = size ? +size : 10;
    const offset = page ? (page - 1) * limit : 0;

    return {
      limit,
      offset,
    };
  },

  getPageData(dataResponse, page, limit) {
    if(+page <= 0) {
      page = 1;
    }

    const { count: totalItems, rows: data } = dataResponse;
    const currentPage = page ? +page : 1;
    const totalPages = Math.ceil(totalItems / limit);

    return {
      totalItems,
      totalPages,
      currentPage,
      totalData: data.length,
      data
    }

  }

}