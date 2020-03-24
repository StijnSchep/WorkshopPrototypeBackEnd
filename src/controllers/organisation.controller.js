const logger = require('../config/appconfig').logger
const database = require('../datalayer/mssql.dao')
const sql = require('mssql')
const queries = require('../constants/querys')

module.exports = {

    getAllOrganisations: (req, res, next) => {
        logger.info('getAllOrganisations called')

        database.connect(() => {
            const ps = new sql.PreparedStatement()

            const query = queries.GET_ALL_ORGANISATIONS

            database.executeStatement(ps, query, {}, (err, rows) => {
                if (err) {
                    const errorObject = {
                        message: "Something went wrong in the database",
                        code: 500
                    }
                    next(errorObject)
                } else if (rows && rows.recordset) {
                    if (rows.recordset.length === 0) {
                        const errorObject = {
                            message: "No organisations found",
                            code: 404
                        }
                        next(errorObject)
                    }
                    if (rows.recordset.length !== 0) {
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

    addOrganisation: (req, res, next) => {
        logger.info('addOrganisation called')

        if (req.body.Name === undefined || req.body.Name === '') {
            const errorObject = {
                message: 'Organisation name can not be empty',
                code: 400
            }
            next(errorObject)
        } else {

            database.connect(() => {
                const organisation = req.body
                const ps = new sql.PreparedStatement()

                ps.input('Name', sql.NVarChar(128));
                ps.input('Logo', sql.NVarChar(128));

                const params = {
                    Name: organisation.Name,
                    Logo: organisation.Logo
                }


                const query = queries.ADD_ORGANISATION

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
        }
    },

    updateOrganisation: (req, res, next) => {
        logger.info('updateOrganisation called')

        if (req.body.Name === undefined || req.body.Name === '') {
            const errorObject = {
                message: 'Organisation name can not be empty',
                code: 400
            }
            next(errorObject)
        } else {

            database.connect(() => {
                const organisation = req.body
                const organistionId = req.params.organisationId

                const ps = new sql.PreparedStatement()
                ps.input('Name', sql.NVarChar(128));
                ps.input('Logo', sql.NVarChar(128));
                ps.input('OrganisationID', sql.Int);

                const params = {
                    Name: organisation.Name,
                    Logo: organisation.Logo,
                    OrganisationID: organistionId
                }

                const query = queries.UPDATE_ORGANISATION

                database.executeStatement(ps, query, params, (err, rows) => {
                    if (err) {
                        const errorObject = {
                            message: "Something went wrong in the database",
                            code: 500
                        }
                        next(errorObject)
                    }
                    if (rows.rowsAffected === 0) {
                        const errorObject = {
                            message: "Organisation not found",
                            code: 404
                        }
                        next(errorObject)
                    } else if (rows.recordset) {
                        res.status(200).json(
                            {
                                message: `Updated organisation with id: ${req.params.organisationId}`,
                                result: rows.recordset
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
    },

    deleteOrganisation: (req, res, next) => {
        logger.info('deleteOrganisation called')

        database.connect(() => {
            const organisationId = req.params.organisationId
            const ps = new sql.PreparedStatement()

            if (!organisationId) {
                const errorObject = {
                    message: "Organisation not found",
                    code: 404
                }
                next(errorObject);
            }

            ps.input('OrganisationID', sql.Int)

            const params = {
                OrganisationID: organisationId
            }
            const query = queries.DELETE_ORGANISATION

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
                        message: "Organisation not found",
                        code: 404
                    }
                    next(errorObject)
                } else {
                    res.status(200).json({message: `Deleted organisation with id: ${req.params.organisationId}`})
                }
            })
        })
    },

    getOrganisationById: (req, res, next) => {
        logger.info('getOrganisationById called')

        database.connect(() => {
            const organisationId = req.params.organisationId
            const ps = new sql.PreparedStatement()

            ps.input('OrganisationID', sql.Int)

            const params = {
                OrganisationID: organisationId
            }

            const query = queries.GET_ORGANISATION_BY_ID

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
                        message: "Organisation not found",
                        code: 404
                    }
                    next(errorObject)
                } else {
                    res.status(200).json({result: rows.recordset})
                }
            })
        })
    },


    getGroupsAndRegistreesByOrganisation: (req, res, next) => {
        logger.info('getGroupsAndRegistreesByOrganisation called')

        database.connect(() => {
                const organisationId = req.params.organisationId
                const ps = new sql.PreparedStatement()

                if (isNaN(organisationId)) {
                    const errorObject = {
                        message: "Organisation not found",
                        code: 404
                    }
                    next(errorObject)
                } else {

                    ps.input('OrganisationID', sql.Int)
                    ps.input('RegistrationID', sql.Int)

                    const params = {
                        OrganisationID: organisationId,
                        RegistrationID: req.userId
                    }

                    const query = queries.GET_GROUPS_REGISTREES_BY_ORGANISATION

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
                                message: "Organisation not found",
                                code: 404
                            }
                            next(errorObject)
                        } else if (rows && rows.recordset && rows.recordset[0]) {
                            res.status(200).json({
                                result: JSON.parse(rows.recordset[0].result)
                            })
                        } else {
                            const errorObject = {
                                message: "Unknown error occured",
                                code: 500
                            }
                            next(errorObject)
                        }
                    })
                }
            }
        )
    }
}