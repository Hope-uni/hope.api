const {
    Person,
    User,
    UserRoles,
    Role,
    Patient,
    TutorTherapist,
    HealthRecord,
    TeaDegree,
    Phase,
    Observation,
    AchievementsHealthRecord,
    Achievement,
} = require('@models/index');
const { roleConstants } = require('../constants');

// Base Tutor includes for all tutors list with "where conditions" paramerters to handle diferents
const baseTutorIncludes = () => {
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
                status: true,
            },
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'status', 'password']
            },
            include: [
                {
                    model: UserRoles,
                    required: true,
                    include: [
                        {
                            model: Role,
                            required: true,
                            where: {
                                name: roleConstants.TUTOR_ROLE,
                            },
                            attributes: []
                        }
                    ]
                },
            ]
        },
        {
            model: Patient,
            as: 'patientTutor',
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'status']
            },
            include: [
                {
                    model: Person
                },
                {
                    model: User
                }
            ]
        }
    ]
}

const tutorExistIncludes = () => {
    return [
        {
            model: User,
            where: {
                status: true,
            },
            include: [
                {
                    model: UserRoles,
                    required: true,
                    include: [
                        {
                            model: Role,
                            required: true,
                            where: {
                                name: roleConstants.TUTOR_ROLE
                            },
                            attributes: []
                        }
                    ]
                }
            ]
        }
    ]
}


const patientTutorIncludes = () => {
    return [
        {
            model: Person,
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'status']
            },
        },
        {
            model: TutorTherapist,
            as: roleConstants.TUTOR_ALIAS,
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'status']
            },
            include: {
                model: Person,
                attributes: ['id', 'firstName', 'surname']
            }
        },
        {
            model: TutorTherapist,
            as: roleConstants.THERAPIST_ALIAS,
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'status']
            },
            include: [
                {
                    model: Person,
                    attributes: ['id', 'firstName', 'surname']
                },
                {
                    model: User,
                    where: {
                        status: true,
                        userVerified: true,
                    },
                    attributes: {
                        exclude: ['createdAt', 'updatedAt', 'status', 'password']
                    },
                }
            ]
        },
        {
            model: User,
            where: {
                status: true,
                userVerified: true,
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
            model: HealthRecord,
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
                    attributes: {
                        exclude: ['createdAt', 'updatedAt'],
                    }
                },
                {
                    model: Phase,
                    attributes: {
                        exclude: ['createdAt', 'updatedAt'],
                    }
                },
                {
                    model: Observation,
                    attributes: {
                        exclude: ['createdAt', 'updatedAt', 'status', 'userId', 'healthRecordId'],
                    }
                }
            ],
        }
    ];
}


const findTutorIncludes = () => {
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
                status: true,
            },
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'status', 'password']
            },
            include: [
                {
                    model: UserRoles,
                    required: true,
                    include: [
                        {
                            model: Role,
                            required: true,
                            where : {
                                name: roleConstants.TUTOR_ROLE,
                            },
                            attributes: []
                        }
                    ]
                },
            ]
        },
        {
            model: Patient,
            as: 'patientTutor',
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'status']
            },
            include: [
                {
                    model: Person
                },
                {
                    model: User
                },
                {
                    model: HealthRecord,
                    attributes: {
                        exclude: ['createdAt', 'updatedAt', 'status', 'patientId']
                    },
                    include: [
                        {
                            model: TeaDegree,
                            attributes: {
                                exclude: ['createdAt', 'updatedAt'],
                            }
                        },
                        {
                            model: Phase,
                            attributes: {
                                exclude: ['createdAt', 'updatedAt'],
                            }
                        },
                        {
                            model: Observation,
                            attributes: {
                                exclude: ['createdAt', 'updatedAt', 'status', 'userId', 'healthRecordId'],
                            }
                        }
                    ],
                }
            ]
        }
    ];
}

module.exports = {
    baseTutorIncludes,
    tutorExistIncludes,
    patientTutorIncludes,
    findTutorIncludes
}