const logger = require('../config/appconfig').logger
const database = require('../datalayer/mssql.dao')
const sql = require('mssql')
const queries = require('../constants/querys')
const validator = require('../validators/validator')

module.exports = {

    getAllRegistrations: (req, res, next) => {
        logger.info('getAllRegistrations called')

        database.connect(() => {
            const ps = new sql.PreparedStatement()
            const query = queries.GET_ALL_REGISTRATIONS

            database.executeStatement(ps, query, {}, (err, rows) => {
                if (err) {
                    const errorObject = {
                        message: "Something went wrong in the database",
                        code: 500
                    }
                    next(errorObject)
                }
                if (rows.rowsAffected[0] === 0) {
                    const errorObject = {
                        message: "No registrations found",
                        code: 404
                    }
                    next(errorObject)
                }
                if (rows.recordset.length !== 0) {
                    res.status(200).json({result: rows.recordset})
                }
            })
        })
    },

    addRegistration: (req, res, next) => {
        logger.info('addRegistration called')

        const registration = req.body
        validator.validateRegistration(registration, (callback) => {
            if (callback !== null) {
                const errorObject = {
                    message: 'Validation fails: ' + callback.message,
                    code: callback.code

                }

                database.connect(() => {
                    const registration = req.body
                    const ps = new sql.PreparedStatement()

                    ps.input('OpeningDate', sql.DateTime2, new Date())
                    ps.input('EndDate', sql.DateTime2, new Date())
                    ps.input('WorkshopDate', sql.DateTime2, new Date())
                    ps.input('ContactCode', sql.NVarChar(128))
                    ps.input('RegistreeCode', sql.NVarChar(128))
                    ps.input('MinEnrollments', sql.Int)
                    ps.input('MaxEnrollments', sql.Int)
                    ps.input('ContactPermissionsId', sql.Int)
                    ps.input('Location', sql.NVarChar(84))
                    ps.input('StartTime', sql.DateTime2)
                    ps.input('EndTime', sql.DateTime2)


                    const params = {
                        OpeningDate: registration.OpeningDate,
                        EndDate: registration.EndDate,
                        WorkshopDate: registration.WorkshopDate,
                        ContactCode: registration.ContactCode,
                        RegistreeCode: registration.RegistreeCode,
                        MinEnrollments: registration.MinEnrollments,
                        MaxEnrollments: registration.MaxEnrollments,
                        ContactPermissionsId: registration.ContactPermissionsId,
                        Location: registration.Address,
                        StartTime: registration.StartTime,
                        EndTime: registration.EndTime
                    }

                    console.log(params)

                    const query = queries.ADD_REGISTRATION

                    database.executeStatement(ps, query, params, (err, rows) => {
                        if (err) {
                            const errorObject = {
                                message: "Something went wrong in the database",
                                code: 500
                            }
                            next(errorObject)
                        } else {
                            res.status(200).json({
                                result: rows.recordset
                            })
                        }
                    })
                })
            }
        })
    },


    deleteRegistration: (req, res, next) => {
        logger.info('deleteRegistration called')

        database.connect(() => {
            const registrationId = req.params.registrationId
            const ps = new sql.PreparedStatement()

            ps.input('RegistrationID', sql.Int)

            const params = {
                RegistrationID: registrationId
            }

            const query = queries.DELETE_REGISTRATION

            database.executeStatement(ps, query, params, (err, rows) => {
                if (err) {
                    const errorObject = {
                        message: "Something went wrong in the database",
                        code: 500
                    }
                    next(errorObject)
                }
                if (rows.rowsAffected[0] === 0) {
                    const errorObject = {
                        message: "Registration not found",
                        code: 404
                    }
                    next(errorObject)
                } else {
                    res.status(200).json({message: `Deleted organisation with id: ${req.params.registrationId}`})
                }
            })
        })
    },


    getRoundsWorkshops: (req, res, next) => {
        logger.info('getRoundsWorkshops called')

        database.connect(() => {
            const ps = new sql.PreparedStatement()
            const registrationId = req.userId

            ps.input('RegistrationID', sql.Int)

            const params = {
                RegistrationID: registrationId
            }

            const query = queries.GET_ROUNDS_WORKSHOP_BY_REGISTATIONID

            database.executeStatement(ps, query, params, (err, rows) => {
                if (err) {
                    const errorObject = {
                        message: "Something went wrong in the database",
                        code: 500
                    }
                    next(errorObject)
                } else if (rows && rows.recordset) {
                    res.status(200).json({result: rows.recordset})
                } else {
                    const errorObject = {
                        message: 'Unknown error occured',
                        code: 500
                    }
                    next(errorObject)
                }
            })
        })

    },

    getInfo: (req, res, next) => {
        logger.info('getInfo called')

        database.connect(() => {
            const ps = new sql.PreparedStatement()
            const registrationId = req.userId;

            ps.input('RegistrationID', sql.Int)

            const params = {
                RegistrationID: registrationId
            }

            const query = queries.GET_REGISTRATION_BY_ID

            database.executeStatement(ps, query, params, (err, rows) => {
                if (err) {
                    const errorObject = {
                        message: "Something went wrong in the database",
                        code: 500
                    }
                    next(errorObject)
                } else if (rows && rows.recordset && rows.recordset[0]) {
                    res.status(200).json({result: rows.recordset[0]})
                } else {
                    const errorObject = {
                        message: 'Unknown error occured',
                        code: 500
                    }
                    next(errorObject)
                }
            })
        })
    }


}