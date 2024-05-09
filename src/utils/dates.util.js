const dayjs = require('dayjs');




module.exports = {

  getAge(newData) {

    const birthday = dayjs(newData.Person.birthday);
    const currentDate = dayjs();
    const age = currentDate.diff(`${birthday}`, 'year');
    newData.Person.setDataValue('age', age);

    return newData;
  },

  /* eslint-disable no-plusplus */
  getAllAges(data) {

    for (let i = 0;i<data.length;i++) {
      const birthday = dayjs(data[i].Person.birthday);
      const currentDate = dayjs();
      const age = currentDate.diff(`${birthday}`, 'year');
      data[i].Person.setDataValue('age', age);
    }

    return data;
  }

}