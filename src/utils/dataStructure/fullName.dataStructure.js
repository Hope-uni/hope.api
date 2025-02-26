const getFullName = (data, tutorTherapist = false) => {

  // Variables sape.filter(item => !!item).join(" ");
  let tutorFullName;
  let therapistFullName;

  const fullName = [
    data.Person.firstName,
    data.Person.secondName,
    data.Person.surname,
    data.Person.secondSurname
  ].filter(item => !!item).join(" ");

  

  if(tutorTherapist) {

    // Tutor fullName validation
    tutorFullName = [
      data.tutor.Person.firstName,
      data.tutor.Person.secondName,
      data.tutor.Person.surname,
      data.tutor.Person.secondSurname
    ].filter(item => !!item).join(" ");

    // Therapist fullName validation
    if(data.therapist) {
      therapistFullName = [
        data.therapist.Person.firstName,
        data.therapist.Person.secondName,
        data.therapist.Person.surname,
        data.therapist.Person.secondSurname
      ].filter(item => !!item).join(" ");
    }
  }


  return {
    fullName,
    tutorFullName,
    therapistFullName,
  }

}


module.exports = {
  getFullName
}
