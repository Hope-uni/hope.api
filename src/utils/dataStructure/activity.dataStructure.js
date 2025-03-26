module.exports = {

  allPatientActivities(data) {
    const activities = data.PatientActivities.filter(item => item.isCompleted === true).map(item => ({
      id: item.Activity.id,
      name: item.Activity.name ?? null,
      description: item.Activity.description ?? null,
      phase: {
        id: item.Activity.Phase.id,
        name: item.Activity.Phase.name,
        description: item.Activity.Phase.description,
      },
      satisfactoryPoints: item.Activity.satisfactoryPoints ?? null,
    }));

    return activities.length ? activities : null;
  },

  currentPatientActivity(data) {

    const currentActivity = data.PatientActivities.filter(item => item.isCompleted === false).map(item => ({
      id: item.Activity.id,
      name: item.Activity.name ?? null,
      satisfactoryPoints: item.Activity.satisfactoryPoints ?? null,
      satisfactoryAttempts: item.satisfactoryAttempts ?? null,
      progress: (item.satisfactoryAttempts / item.Activity.satisfactoryPoints) * 100,
      description: item.Activity.description ?? null,
      phase: {
        id: item.Activity.Phase.id,
        name: item.Activity.Phase.name,
        description: item.Activity.Phase.description,
      },
    }))[0];

    return currentActivity ?? null;
  }

}
