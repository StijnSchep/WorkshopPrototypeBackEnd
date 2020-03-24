const logger = require("../config/appconfig").logger
const database = require("../datalayer/mssql.dao")
const queries = require('../constants/querys')
const sql = require('mssql')

module.exports = {

    addSingleEnrollment: (count, RoundWorkshops, RegistreeID, callback) => {
        const ps = new sql.PreparedStatement();
        ps.input('RoundWorkshopID', sql.Int)
        const pars = {
            RegistreeID: RegistreeID,
            RoundWorkshopID: RoundWorkshops[count].RoundWorkshopId
        }
        database.executeStatement(ps, queries.ADD_ENROLLMENT, pars, (err, rows) => {
            if (rows) {
                const newCount = count + 1;
                if (newCount === RoundWorkshops.length) {
                    callback(null, true);
                } else {
                    addSingleEnrollment(newCount, RoundWorkshops, RegistreeID, callback);
                }
            } else if (err) {
                callback(error, null);
            } else {
                callback(error, null);
            }
        })
    },

    addEnrollment: (req, res, next) => {
        logger.info('addEnrollment called')

        database.connect(() => {

            const enroll = req.body
            const ps = new sql.PreparedStatement()

            ps.input('RegistreeID', sql.Int)

            const params = {
                RegistreeID: enroll.RegistreeId,
            }

            database.executeStatement(ps, queries.DELETE_ENROLLMENT_BY_REGISTEEID, params, (err, rows) => {
                if (err) {
                    const errorObject = {
                        message: "Something went wrong in the database",
                        code: 500
                    }
                    next(errorObject)
                }
                if (rows) {
                    logger.trace('Enrolls deleted')
                } else {
                    const errorObject = {
                        message: "Unknown error occured",
                        code: 500
                    }
                    next(errorObject)
                }
            })

            module.exports.addSingleEnrollment(0, enroll.RoundWorkshops, enroll.RegistreeId, (err, success) => {
                if (err) {
                    res.status(500).json('Something went wrong')
                } else {
                    res.status(200).json('Enrollments added')
                }
            })
        })
    },

    getAllEnrollments: (req, res, next) => {
        logger.info('getAllEnrollments called')

        database.connect(() => {

            logger.info('Connection established')

            const ps = new sql.PreparedStatement()
            const params = {}

            database.executeStatement(ps, queries.GET_ALL_ENROLLMENTS, params, (err, rows) => {
                logger.info('Statement executed')
                if (err) {
                    const errorObject = {
                        message: "Something went wrong in the database",
                        code: 500
                    }
                    next(errorObject)
                } else if (rows && rows.recordset) {
                    if (rows.rowsAffected[0] === 0) {
                        const errorObject = {
                            message: "No enrollments found",
                            code: 404
                        }
                        next(errorObject)
                    } else {
                        res.status(200).json({result: rows.recordset})
                    }
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

    getEnrollmentsByRoundWorkshopID: (req, res, next) => {
        logger.info('getEnrollmentsByRoundWorkshopID called')
        database.connect(() => {

            logger.info('Connection established')

            const ps = new sql.PreparedStatement()
            const params = {
                RoundWorkshopID: req.body.RoundWorkshopId
            }

            ps.input('RoundWorkshopID', sql.Int)

            database.executeStatement(ps, queries.GET_ENROLLMENTS_BY_ROUND_WORKSHOP_ID, params, (err, rows) => {
                logger.info('Statement executed')
                if (err) {
                    const errorObject = {
                        message: "Something went wrong in the database",
                        code: 500
                    }
                    next(errorObject)
                } else if (rows && rows.recordset) {
                    if (rows.rowsAffected[0] === 0) {
                        const errorObject = {
                            message: "No enrollments found",
                            code: 404
                        }
                        next(errorObject)
                    } else {
                        res.status(200).json({result: rows.recordset})
                    }
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


