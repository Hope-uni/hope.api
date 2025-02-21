module.exports = {

  allPatientActivities(data) {
    return data.PatientActivities.filter(item => item.isCompleted === true).map(item => ({
      id: item.id,
      name: item.Activity.name ?? null,
      description: item.Activity.description ?? null,
      phase: {
        id: item.Activity.Phase.id,
        name: item.Activity.Phase.name,
        description: item.Activity.Phase.description,
      },
      satisfactoryPoints: item.Activity.satisfactoryPoints ?? null,
    }));
  }

}