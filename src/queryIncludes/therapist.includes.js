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
    Activity,
} = require('@models/index');
const { roleConstants } = require('../constants');


const baseTherapistIncludes = () => {
    return [
        {
            model: Person,
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'status', 'birthday']
            },
        },
        {
            model: User,
            where: {
                status: true,
            },
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'password']
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
                                name: roleConstants.THERAPIST_ROLE,
                            },
                            attributes: []
                        }
                    ]
                },
            ]
        },
        {
            model: Patient,
            as: 'patientTherapist',
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
    ];
}

const therapistExistIncludes = () => {
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
                                name: roleConstants.THERAPIST_ROLE
                            },
                            attributes: []

                        }
                    ]
                }
            ]
        }
    ];
}

const patientTherapistIncludes = () => {
    return [
        {
            model: Person,
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'status']
            },
        },
        {
            model: TutorTherapist,
            as: 'therapist',
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

const findTherapistIncludes = () => {
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
                                name: roleConstants.THERAPIST_ROLE,
                            },
                            attributes: []
                        }
                    ]
                },
                {
                    model: Activity,
                    attributes: {
                        exclude: ['createdAt', 'updatedAt']
                    },
                    include: [
                        {
                            model: Phase,
                            attributes: {
                                exclude: ['createdAt', 'updatedAt', 'status']
                            },
                        }
                    ]
                }
            ]
        },
        {
            model: Patient,
            as: 'patientTherapist',
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'status']
            },
            include: [
                {
                    model: Person
                },
                {
                    model: User,
                    where: {
                        status: true,
                    }
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
        },
    ]
}

const createAndUpdateTherapistIncludes = () => {
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
                    where: {
                        roleId: 3,
                    },
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
            model: Patient,
            as: 'patientTherapist',
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'status']
            },
            include: [
                {
                    model: Person
                },
                {
                    model: User,
                    where: {
                        status: true,
                    }
                }
            ]
        }
    ]
}

module.exports = {
    baseTherapistIncludes,
    therapistExistIncludes,
    patientTherapistIncludes,
    findTherapistIncludes,
    createAndUpdateTherapistIncludes
}