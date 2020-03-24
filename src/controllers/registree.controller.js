const logger = require('../config/appconfig').logger
const database = require('../datalayer/mssql.dao')
const queries = require('../constants/querys') 
const sql = require('mssql') 

module.exports = {

    //Stijn past t aan
    addRegistree: (req, res, next) => {
        logger.info('addRegistree called')
        database.connect(() => {
            
            const ps = new sql.PreparedStatement() 
            const query = queries.ADD_REGISTREE 
            const registree = req.body
            const params = {
                Firstname: registree.Firstname,
                Lastname: registree.Lastname,
                GroupId: registree.GroupId
            }
            ps.input("Firstname", sql.NVarChar(128));
            ps.input("Lastname", sql.NVarChar(128));
            ps.input("GroupId", sql.Int);

            database.executeStatement(ps, query, params, (err, rows) => {
                if (err) {
                    let errorObject 

                    if (err.message.includes('duplicate key')) {
                        errorObject = {
                            message: "User is already registered. (Duplicate key error)",
                            code: 409
                        }
                    }
                    else {
                        errorObject = {
                            message: "Something went wrong in the database",
                            code: 500
                        }
                    }
                    next(errorObject)
                }
                if (rows && rows.recordset) {
                    if (rows.recordset.length > 0) {
                        res.status(200).json({ result: rows.recordset })
                    }
                    else {
                        const errorObject = {
                            message: "Unknown error occured",
                            code: 500
                        }
                        next(errorObject)
                    }
                }
                else {
                    const errorObject = {
                        message: "Unknown error occured",
                        code: 500
                    }
                    next(errorObject)
                }
            })
        })
    },

    updateRegistree: (req, res, next) => {
        logger.info('updateRegistree called')
        database.connect(() => {
            const ps = new sql.PreparedStatement() 
            const query = queries.UPDATE_REGISTREE 
            const registree = req.body
            const params = {
                Id: req.params.registreeId,
                Firstname: registree.Firstname,
                Lastname: registree.Lastname,
                Email: registree.Email,
                GroupId: registree.GroupId
            }
            ps.input("Id", sql.Int);
            ps.input("Firstname", sql.NVarChar(128));
            ps.input("Lastname", sql.NVarChar(128));
            ps.input("Email", sql.NVarChar(128));
            ps.input("GroupId", sql.Int);

            database.executeStatement(ps, query, params, (err, rows) => {
                if (err) {
                    let errorObject 
                    if (err.message.includes('duplicate key')) {
                        errorObject = {
                            message: "User is already registered. (Duplicate key error)",
                            code: 409
                        }
                    }
                    else {
                        errorObject = {
                            message: "Something went wrong in the database",
                            code: 500
                        }
                    }
                    next(errorObject)
                }
                if (rows && rows.recordset) {
                    if (rows.recordset.length == 0) {
                        const errorObject = {
                            message: "Registree not found",
                            code: 404
                        }
                        next(errorObject)
                    }
                    else {
                        res.status(200).json({ message: `Updated registree with id: ${req.params.registreeId}` })
                    }
                }
                else {
                    const errorObject = {
                        message: "Unknown error occured",
                        code: 500
                    }
                    next(errorObject)
                }
            })
        })
    },

    getNotEnrolled: (req, res, next) => {
        logger.info('getNotEnrolled called')
        
        database.connect(() => {

            const ps = new sql.PreparedStatement() 
            ps.input("RegistrationID", sql.Int) 
            
            const params = {
                RegistrationID: req.UserId,
            }

            const query = queries.GET_NOT_ENROLLED

            database.executeStatement(ps, query, params, (err, rows) => {
                if (err) {
                    const errorObject = {
                        message: "Something went wrong in the database",
                        code: 500
                    }
                    next(errorObject)
                }else if (rows && rows.recordset) {
                    if (rows.recordset.length == 0) {
                        const errorObject = {
                            message: "No registrees found",
                            code: 404
                        }
                        next(errorObject)
                    }
                    else {
                        res.status(200).json({ result: rows.recordset })
                    }
                }
                else {
                    const errorObject = {
                        message: "Unknown error occured",
                        code: 500
                    }
                    next(errorObject)
                }
            })
        })

    }
}
