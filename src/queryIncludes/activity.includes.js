const {
    Phase,
    User,
    PatientActivity,
    Patient,
    Person,
    HealthRecord,
    TutorTherapist,
    TeaDegree,
    Observation,
    Activity,
    Role,
    UserRoles,
} = require('@models/index');

const baseActivityIncludes = () => {
    return [
        {
            model: Phase,
            attributes: ['id', 'name', 'description'],
        },
        {
            model: User
        },
        {
            model: PatientActivity,
            attributes: ['id', 'isCompleted', 'status'],
            include: [
                {
                    model: Patient,
                    attributes: ['id'],
                }
            ]
        }
    ];
}

const patientAssignActivityIncludes = () => {
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
                userVerified: true
            }
        },
        {
            model: HealthRecord,
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'status', 'patientId']
            },
            include: [
                {
                    model: Phase,
                    attributes: {
                        exclude: ['createdAt', 'updatedAt'],
                    }
                }
            ],
        }
    ]
}

const patientUnAssignActivityIncludes = () => {
    return [
        {
            model: User,
            where: {
                userVerified: true,
                status: true,
            }
        },
        {
            model: PatientActivity,
            where: {
                status: true,
                isCompleted: false,
            }
        }
    ]
}

const patientCurrentActivityIncludes = () => {
    return [
        {
            model: Person,
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'status']
            },
        },
        {
            model: TutorTherapist,
            as: 'tutor',
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'status']
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
            as: 'therapist',
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'status']
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
            model: PatientActivity,
            attributes: {
                exclude: ['updatedAt']
            },
            where: {
                status: true,
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
                        exclude: ['updatedAt', 'status', 'healthRecordId'],
                    },
                    include: [
                        {
                            model: User,
                            attributes: ['username'],
                        }
                    ]
                }
            ],
        }
    ];
}

module.exports = {
    baseActivityIncludes,
    patientAssignActivityIncludes,
    patientUnAssignActivityIncludes,
    patientCurrentActivityIncludes,
}