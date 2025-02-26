const getFullName = (data) => {
  return [
    data.firstName,
    data.secondName,
    data.surname,
    data.secondSurname
  ].filter(item => !!item).join(" ");
}


module.exports = {
  getFullName
}
