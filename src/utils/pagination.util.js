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

  getPageData(dataResponse, pageNumber, limit) {

    if(+pageNumber <= 0) {
      pageNumber = 1;
    }

    const { count, rows: data } = dataResponse;
    const page = pageNumber ? +pageNumber : 1;
    const totalPages = Math.ceil(count / limit);

    return {
      data,
      paginate: {
        total: count,
        page_count:totalPages,
        page,
        page_size: data.length,
      },
    }

  }

}