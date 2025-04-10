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

      const activityFound = data.find((item) => item.status === true && item.isCompleted === true);

      lastActivity = {
        id: activityFound.Activity.id,
        name: activityFound.Activity.name ?? null,
        satisfactoryPoints: activityFound.Activity.satisfactoryPoints ?? null,
        satisfactoryAttempts: activityFound.satisfactoryAttempts ?? null,
        progress: (activityFound.satisfactoryAttempts / activityFound.Activity.satisfactoryPoints) * 100,
        description: activityFound.Activity.description ?? null,
        phase: {
          id: activityFound.Activity.Phase.id,
          name: activityFound.Activity.Phase.name,
          description: activityFound.Activity.Phase.description,
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
