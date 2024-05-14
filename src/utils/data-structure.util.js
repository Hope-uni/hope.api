
/* eslint-disable no-restricted-syntax */
module.exports = {


  // Users 

  userDataStructure(data) {

    const newData = [];
    
    for (const iterator of data) {
      const rolesData = [];

      for (const role of iterator.UserRoles) {
        rolesData.push(role.Role);
      }
      const element = {
        id: iterator.id,
        username: iterator.username,
        email: iterator.email,
        Roles: rolesData
      }
      newData.push(element);
    }

    return newData;
  },

  findUserDataStructure(data) {

    const rolesData = [];
    for (const role of data.UserRoles) {
      rolesData.push(role.Role);
    }

    const element = {
      id: data.id,
      username: data.username,
      email: data.email,
      Roles: rolesData
    }

    return element;
  },

  // Therapist

  therapistDataStructure(data) {
    // variables
    const newData = [];

    for (const iterator of data) {

      const child = [];

      if(iterator.Patient) {
        for (const patient of iterator.Patient) {
          const childInfo = {
            userId: patient.id,
            id: patient.id,
            fullName: `${patient.Person.firstName} ${patient.Person.secondName ? patient.Person.secondName : ''} ${patient.Person.surname} ${patient.Person.secondSurname ? patient.Person.secondSurname : ''}`,
            username: patient.User.username,
            email: patient.User.email,
            phoneNumber: patient.phoneNumber,
            // TODO: Falta la edad
            identificationNumber: patient.identificationNumber,
            telephone: patient.telephone,
            address: patient.Person.address
          }
          child.push(childInfo);
        }
      }
      
      const element = {
        id: iterator.id,
        userId: iterator.userId,
        fullName: `${iterator.Person.firstName} ${iterator.Person.secondName ? iterator.Person.secondName : ''} ${iterator.Person.surname} ${iterator.Person.secondSurname ? iterator.Person.secondSurname : ''}`,
        username: iterator.User.username,
        email: iterator.User.email,
        phoneNumber: iterator.phoneNumber,
        telephone: iterator.telephone,
        patients: child
      };

      newData.push(element);
    }

    return newData;
  },

  findTherapistDataStructure(data) {

    const child = [];

    if(data.Patient) {
      for (const iterator of data.Patient) {
        
        const childInfo = {
          userId: iterator.id,
          id: iterator.id,
          fullName: `${iterator.Person.firstName} ${iterator.Person.secondName ? iterator.Person.secondName : ''} ${iterator.Person.surname} ${iterator.Person.secondSurname ? iterator.Person.secondSurname : ''}`,
          username: iterator.User.username,
          email: iterator.User.email,
          phoneNumber: iterator.phoneNumber,
          // TODO: Falta la edad
          identificationNumber: iterator.identificationNumber,
          telephone: iterator.telephone,
          address: iterator.Person.address
        }
        child.push(childInfo);
      }
    }

    const element = {
      id: data.id,
      userId: data.userId,
      fullName: `${data.Person.firstName} ${data.Person.secondName ? data.Person.secondName : ''} ${data.Person.surname} ${data.Person.secondSurname ? data.Person.secondSurname : ''}`,
      image: data.Person.imageProfile,
      username: data.User.username,
      email: data.User.email,
      phoneNumber: data.phoneNumber,
      identificationNumber: data.identificationNumber,
      telephone: data.telephone,
      address: data.Person.address,
      patients: child,
    }

    return element;

  }

}