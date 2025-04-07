module.exports = {

  allPatientActivities(data) {
    const activities = data.PatientActivities.filter(item => item.isCompleted === true && item.status === true).map(item => ({
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

    const currentActivity = data.filter(item => item.isCompleted === false && item.status === true).map(item => ({
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

    // Get the last activity completed in case the patient does not have activities assigned.
    let lastActivity = null;
    if(!currentActivity) {
      lastActivity = {
        id: data[0].Activity.id,
        name: data[0].Activity.name ?? null,
        satisfactoryPoints: data[0].Activity.satisfactoryPoints ?? null,
        satisfactoryAttempts: data[0].satisfactoryAttempts ?? null,
        progress: (data[0].satisfactoryAttempts / data[0].Activity.satisfactoryPoints) * 100,
        description: data[0].Activity.description ?? null,
        phase: {
          id: data[0].Activity.Phase.id,
          name: data[0].Activity.Phase.name,
          description: data[0].Activity.Phase.description,
        },
      }
    }

    return {
      currentActivity: currentActivity ?? null,
      lastActivity,
    }
  },

  allActivityAssigments(data) {

    const assigments = [];

    data.map((item) => {
      if(item.isCompleted === false && item.status === true) {
        assigments.push(item.Patient.id);
      }
    });

    return assigments.length === 0 ? null : assigments;
  }

}
