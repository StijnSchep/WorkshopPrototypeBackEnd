const logger = require('../config/appconfig').logger
const database = require('../datalayer/mssql.dao')
const queries = require('../constants/querys')
const sql = require('mssql')

module.exports = {

    addRound: (req, res, next) => {
        logger.info('Add round called')
        database.connect(() => {

            const ps = new sql.PreparedStatement()

            ps.input('Name', sql.NVarChar(128))
            ps.input('StartTime', sql.DateTime2)
            ps.input('EndTime', sql.DateTime2)
            ps.input('RegistrationID', sql.Int)

            const params = {
                Name: req.body.Name,
                StartTime: req.body.StartTime,
                EndTime: req.body.EndTime,
                RegistrationID: req.body.RegistrationID
            }

            database.executeStatement(ps, queries.ADD_ROUND, params, (err, rows) => {
                if (err) {
                    const errorObject = {
                        message: 'Something went wrong in the database',
                        code: 500
                    }
                    next(errorObject)
                } else if (rows) {
                    res.status(200).json({result: rows.recordset})
                } else {
                    const errorObject = {
                        message: "Unknown error occured",
                        code: 500
                    }
                    next(errorObject)
                }
            })
        })
    },


    addRoundWorkshopGroup: (req, res, next) => {
        logger.info('Add round workshop was called')
        const params = req.body

        database.connect(() => {

            const ps = new sql.PreparedStatement()

            ps.input('RoundWorkshopId', sql.Int)
            ps.input('GroupId', sql.Int)


            database.executeStatement(ps, queries.ADD_ROUND_WORKSHOP_GROUP, params, (err, rows) => {
                if (err) {
                    const errorObject = {
                        message: 'Something went wrong in the database',
                        code: 500
                    }
                    next(errorObject)
                } else {
                    res.status(200).json()
                }
            })
        })
    },

    //BEWAREN
    addRoundWorkshop: (req, res, next) => {
        logger.info('Add round workshop was called')
        const rw = req.body

        database.connect(() => {

            const ps = new sql.PreparedStatement()

            ps.input('RoundID', sql.Int)
            ps.input('WorkshopID', sql.Int)
            ps.input('MaxParticipants', sql.Int)

            const params = {
                RoundID: rw.RoundId,
                WorkshopID: rw.WorkshopId,
                MaxParticipants: rw.MaxParticipants
            }
            console.log(params);

            database.executeStatement(ps, queries.ADD_ROUND_WORKSHOP, params, (err, rows) => {
                if (err) {
                    const errorObject = {
                        message: 'Something went wrong in the database',
                        code: 500
                    }
                    next(errorObject)
                } else if (rows) {
                    res.status(200).json({result: rows.recordset})
                } else {
                    const errorObject = {
                        message: "Unknown error occured",
                        code: 500
                    }
                    next(errorObject)
                }
            })
        })
    },

    getAllRoundsWorkshopsRegistree: (req, res, next) => {
        logger.info('getAllRoundsWithWorkshopsRegistree called')

        const registreeId = req.body.RegistreeId

        database.connect(() => {

            const ps = new sql.PreparedStatement()
            const query = queries.GET_GROUPS_REGISTREE_ROUND_WORKSHOPS_PLACES

            ps.input('RegistreeID', sql.Int)

            const params = {
                RegistreeID: registreeId
            }

            database.executeStatement(ps, query, params, (err, rows) => {
                if (err) {
                    const errorObject = {
                        message: 'Something went wrong in the database',
                        code: 500
                    }
                    next(errorObject)
                } else if (rows && rows.recordset && rows.recordset[0]) {
                    res.status(200).json({
                        result: JSON.parse(rows.recordset[0].result)
                    })
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