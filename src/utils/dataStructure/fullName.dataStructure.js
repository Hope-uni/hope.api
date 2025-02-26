const getFullName = (data) => {

  const fullName = [
    data.firstName,
    data.secondName,
    data.surname,
    data.secondSurname
  ].filter(item => !!item).join(" ");


  return fullName;

}


module.exports = {
  getFullName
}
