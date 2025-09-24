const { 
    Person,
    User,
    UserRoles,
    Role,
    TutorTherapist,
    HealthRecord,
    TeaDegree,
    Phase,
    Observation,
    AchievementsHealthRecord,
    Achievement,
    PatientActivity,
    Activity,
    HealthRecordPhase
} = require('@models/index.js');
const { roleConstants } = require('../constants');


// get the aliases
const { TUTOR_ALIAS, THERAPIST_ALIAS } = roleConstants;


// Base Patient includes for all patients list with "where conditions" paramerters to handle diferents 
// requierements per model in the models included to the query.
const basePatientIncludes = ({ 
    tutorWhereCondition, 
    therapistWhereCondition,
    healthRecordWhereCondition,
    userWhereCondition,
    teaDegreeWhereCondition,
    phaseWhereCondition,
} = { }) => {
    return [
        {
            model: Person,
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'status']
            },
        },
        {
            model: User,
            where: {
                ...userWhereCondition,
                status: true,
            },
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'status', 'password']
            },
            include: [
                {
                model: UserRoles,
                include: [
                    {
                        model: Role,
                        attributes: {
                            exclude: ['createdAt', 'updatedAt', 'status']
                        },
                    }
                ]
                },
            ]
        },
        {
            model: TutorTherapist,
            as: TUTOR_ALIAS,
            where: {...tutorWhereCondition, status: true},
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'status']
            },
            include: [
                { model: Person, attributes: ['id', 'firstName', 'surname']},
                { model: User, where: { userVerified: true }}
            ]
        },
        {
            model: TutorTherapist,
            as: THERAPIST_ALIAS,
            where: therapistWhereCondition,
            attributes: {exclude: ['createdAt', 'updatedAt', 'status']},
            include: [
                { model: Person, attributes: ['id', 'firstName', 'surname']},
                { model: User }
            ]
        },
        {
            model: HealthRecord,
            where: healthRecordWhereCondition,
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'status', 'patientId']
            },
            include: [
                {
                    model: AchievementsHealthRecord,
                    include: {
                        model: Achievement,
                        attributes: ['id', 'name', 'imageUrl']
                    }
                },
                {
                    model: TeaDegree,
                    where: teaDegreeWhereCondition,
                    attributes: {
                        exclude: ['createdAt', 'updatedAt'],
                    }
                },
                {
                    model: Phase,
                    where: phaseWhereCondition,
                    attributes: {
                        exclude: ['createdAt', 'updatedAt'],
                    }
                },
                {
                    model: Observation,
                    attributes: {
                        exclude: ['createdAt', 'updatedAt', 'status', 'userId', 'healthRecordId'],
                    },
                    include: {
                        model: User
                    }
                }
            ],
        },
    ]
};

// includes for find patient.
const findPatientIncludes = () => {
    return [
        {
            model: Person,
            attributes: {
                exclude: ['createdAt','updatedAt','status']
            },
        },
        {
            model: TutorTherapist,
            as: TUTOR_ALIAS,
            attributes: {
                exclude: ['createdAt','updatedAt','status']
            },
            include: [
                {
                model: Person,
                },
                {
                model: User,
                }
            ]
        },
        {
            model: TutorTherapist,
            as: THERAPIST_ALIAS,
            attributes: {
                exclude: ['createdAt','updatedAt','status']
            },
            include: [
                {
                model: Person,
                },
                {
                model: User,
                }
            ]
        },
        {
            model: User,
            where: {
                status: true
            },
            attributes: {
                exclude: ['createdAt','updatedAt','status','password']
            },
            include: [
                {
                model: UserRoles,
                include: [
                    {
                    model: Role,
                    attributes: {
                        exclude: ['createdAt','updatedAt','status']
                    },
                    }
                ]
                },
            ]
        },
        {
            model: PatientActivity,
            attributes: {
                exclude: ['updatedAt']
            },
            include: [
                {
                model: Activity,
                include: [
                    {
                    model: Phase,
                    }
                ]
                }
            ],
        },
        {
            model: HealthRecord,
            attributes: {
                exclude: ['createdAt','updatedAt','status','patientId']
            },
            include: [
                {
                    model: HealthRecordPhase,
                    attributes: ['phaseCompleted', 'phaseId'],
                },
                {
                    model: AchievementsHealthRecord,
                    include: {
                        model: Achievement,
                        attributes: ['id', 'name', 'imageUrl']
                    }
                },
                {
                    model: TeaDegree,
                    attributes: {
                        exclude: ['createdAt','updatedAt'],
                    }
                },
                {
                    model: Phase,
                    attributes: {
                        exclude: ['createdAt','updatedAt'],
                    },
                },
                {
                    model: Observation,
                    attributes: {
                        exclude: ['updatedAt', 'status', 'healthRecordId'],
                    },
                    include: [
                        {
                            model: User,
                            attributes: ['username'],
                        }
                    ]
                },
            ],
        }
    ]
}

// this is fo rthe model included inside  of the patient activity model.
const patientActivityIncludes = (activityWhereCondition = { }) => {
    return {
        model: PatientActivity,
        where: activityWhereCondition
    };
}

// includes for get tutor therapists patient.
const getTutorTherapistsPatientIncludes = (whereCondition = {}) => {
    return [
        {
            model: User,
            include: [
                {
                    model:UserRoles,
                    include: [
                        {
                            model: Role,
                            attributes: {
                                exclude: ['createdAt', 'updatedAt', 'status']
                            },
                            where: whereCondition,
                        }
                    ]
                }
            ]
        }
    ];
}

module.exports = {
    basePatientIncludes,
    patientActivityIncludes,
    findPatientIncludes,
    getTutorTherapistsPatientIncludes
}