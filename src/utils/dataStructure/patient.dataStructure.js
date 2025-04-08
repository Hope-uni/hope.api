const dates = require('../dates.util');

module.exports = {

  all(data) {
    const childAge = dates.getAge(data);

    // phase
    const getPhase = Object.keys(data).includes('HealthRecord') && data.HealthRecord !== null ? {
      id: data.HealthRecord.Phase.id,
      name: data.HealthRecord.Phase.name,
      description: data.HealthRecord.Phase.description,
    } : null;

    // TeaDegree
    const getTeaDegree = Object.keys(data).includes('HealthRecord') && data.HealthRecord !== null ? {
      id: data.HealthRecord.TeaDegree.id,
      name: data.HealthRecord.TeaDegree.name,
      description: data.HealthRecord.TeaDegree.description,
    } : null;

    let fullName = `${data.Person.firstName} ${data.Person.secondName} ${data.Person.surname} ${data.Person.secondSurname}`; // Patient
    if(!data.Person.secondName || !data.Person.secondSurname) {
      fullName = `${data.Person.firstName} ${data.Person.surname}`;
    }

    return {
      id: data.id,
      userId: data.userId,
      fullName,
      age: childAge.Person.dataValues.age,
      teaDegree: getTeaDegree,
      currentPhase: getPhase,
      achievementCount: 0,
      image: data.Person.imageProfile ?? null,
      isVerified: data.User.userVerified,
      // Cantidad de logros
    };
  }

}
