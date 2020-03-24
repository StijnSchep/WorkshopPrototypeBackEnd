const logger = require('../config/appconfig').logger
const database = require('../datalayer/mssql.dao')
const queries = require('../constants/querys')
const sql = require('mssql')

module.exports = {

    getAllWorkshops: (req, res, next) => {

        logger.info('getAllWorkshops called')

        database.connect(() => {
            const ps = new sql.PreparedStatement()
            const query = queries.GET_ALL_WORKSHOPS

            database.executeStatement(ps, query, {}, (err, rows) => {
                if (err) {
                    const errorObject = {
                        message: "Something went wrong in the database",
                        code: 500
                    }
                    next(errorObject)
                } else if (rows) {
                    if (rows.rowsAffected[0] === 0) {
                        const errorObject = {
                            message: "No workshops found",
                            code: 404
                        }
                        next(errorObject)
                    } else if (rows.recordset[0]) {
                        res.status(200).json(JSON.parse(rows.recordset[0].result))
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

    addWorkshop: (req, res, next) => {

        logger.info('addWorkshop called')
        database.connect(() => {
            const workshop = req.body
            const ps = new sql.PreparedStatement()
            const query = queries.ADD_WORKSHOP

            ps.input('Name', sql.NVarChar(128))
            ps.input('Description', sql.NVarChar(4000))
            ps.input('URL', sql.NVarChar(128))
            ps.input('Image', sql.NVarChar(128))

            if (!workshop.URL) workshop.URL = 'none'
            if (!workshop.Image) workshop.Image = 'none'

            const params = {
                Name: workshop.Name,
                Description: workshop.Description,
                URL: workshop.URL,
                Image: workshop.Image
            }

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
                    res.status(200).json({result: 'success'});
                }
            })
        })
    },

    updateWorkshop: (req, res, next) => {

        logger.info('updateWorkshop called')
        database.connect(() => {
            const workshop = req.body
            const workshopId = req.params.workshopId

            const ps = new sql.PreparedStatement()

            ps.input('Name', sql.NVarChar(128))
            ps.input('Description', sql.NVarChar(4000))
            ps.input('WorkshopID', sql.Int)
            ps.input('URL', sql.NVarChar(128))
            ps.input('Image', sql.NVarChar(128))

            if (!workshop.Image) workshop.Image = 'none';
            if (!workshop.URL) workshop.URL = 'none';

            const params = {
                Name: workshop.Name,
                Description: workshop.Description,
                WorkshopID: workshopId,
                URL: workshop.URL,
                Image: workshop.Image
            }

            const query = queries.UPDATE_WORKSHOP

            database.executeStatement(ps, query, params, (err, rows) => {
                if (err) {
                    const errorObject = {
                        message: "Something went wrong in the database",
                        code: 500
                    }
                    next(errorObject)
                } else if (rows && rows.rowsAffected[0]) {
                    if (rows.rowsAffected[0] === 0) {
                        const errorObject = {
                            message: "Workshop not found",
                            code: 404
                        }
                        next(errorObject)
                    }
                    if (rows.rowsAffected[0] > 0) {
                        res.status(200).json("Update succesfull")
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

    deleteWorkshop: (req, res, next) => {

        logger.info('deleteWorkshop called')
        database.connect(() => {
            const workshopId = req.params.workshopId
            const ps = new sql.PreparedStatement()

            ps.input('WorkshopID', sql.Int)

            const params = {
                WorkshopID: workshopId
            }

            const query = queries.DELETE_WORKSHOP

            database.executeStatement(ps, query, params, (err, rows) => {
                if (err) {
                    const errorObject = {
                        message: "Something went wrong in the database",
                        code: 500
                    }
                    next(errorObject)
                }
                if (rows && rows.rowsAffected[0]) {
                    if (rows.rowsAffected[0] === 0) {
                        logger.trace('No workshops found with that ID')
                        const errorObject = {
                            message: `No workshop found with ID: ${req.params.workshopId}`,
                            code: 401
                        }
                        next(errorObject)
                    } else {
                        res.status(200).json({result: `Deleted workshop with id ${req.params.workshopId}`})
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

    getWorkshopById: (req, res, next) => {

        logger.info('getWorkshopById called')

        database.connect(() => {
            const workshopId = req.params.workshopId
            const ps = new sql.PreparedStatement()

            ps.input('WorkshopID', sql.NVarChar(128))

            const params = {
                WorkshopID: workshopId
            }

            const query = queries.GET_WORKSHOP_BY_ID

            database.executeStatement(ps, query, params, (err, rows) => {
                if (err) {
                    const errorObject = {
                        message: "Something went wrong in the database",
                        code: 500
                    }
                    next(errorObject)
                }
                if (rows.recordset.length === 0) {
                    const errorObject = {
                        message: "No workshop found",
                        code: 404
                    }
                    next(errorObject)
                }
                if (rows.recordset.length !== 0) {
                    res.status(200).json(JSON.parse(rows.recordset[0].result))
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

}