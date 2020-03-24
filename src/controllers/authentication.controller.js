// App config
const appconfig = require("../config/appconfig")
const logger = appconfig.logger
const secretKey = appconfig.secretKey

// Authentication
const jwt = require('jsonwebtoken')

// DB
const sql = require('mssql')
const database = require("../datalayer/mssql.dao")
const queries = require('../constants/querys')

// Encryption
const bcrypt = require('bcrypt')
const saltRounds = 10

// Exports
module.exports = {

    createAdmin: (req, res, next) => {
        logger.info('createAdmin called')

        const admin = req.body

        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) {
                const errorObject = {
                    message: "Couldn't generate salt",
                    code: 500
                }
                next(errorObject)
            }
            bcrypt.hash(admin.Password, salt, function (err, hash) {
                if (err) {
                    const errorObject = {
                        message: "Couldn't generate hash",
                        code: 500
                    }
                    next(errorObject)
                }
                if (hash) {
                    database.connect(() => {
                        logger.info('Database connection established')

                        const ps = new sql.PreparedStatement()

                        ps.input('AdminFirstname', sql.NVarChar(128))
                        ps.input('AdminLastname', sql.NVarChar(128))
                        ps.input('AdminEmail', sql.NVarChar(128))
                        ps.input('AdminPassword', sql.NVarChar(128))

                        const params = {
                            AdminFirstname: admin.Firstname,
                            AdminLastname: admin.Lastname,
                            AdminEmail: admin.Email,
                            AdminPassword: hash
                        }

                        const query = queries.CREATE_ADMIN

                        database.executeStatement(ps, query, params, (err, rows) => {
                            if (err) {
                                const errorObject = {
                                    message: 'Something went wrong in the database...',
                                    code: 500
                                }
                                next(errorObject)
                            }
                            if (rows && rows.recordset) {
                                if (rows.rowsAffected[0] !== 0) {
                                    res.status(200).json({
                                        AdminId: rows.recordset[0].AdminId
                                    })
                                } else {
                                    const errorObject = {
                                        message: 'Unknown error occured',
                                        code: 500
                                    }
                                    next(errorObject)
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

            })

        })
    },

    loginAdmin: (req, res, next) => {
        logger.info("loginAdmin called")

        database.connect(() => {
            logger.info('Database connection established.')

            const ps = new sql.PreparedStatement()

            ps.input('AdminEmail', sql.NVarChar(128))
            ps.input('AdminPassword', sql.NVarChar(128))

            const admin = req.body
            const params = {
                AdminEmail: admin.Email,
                AdminPassword: admin.Password
            }

            const query = queries.LOGIN_ADMIN

            database.executeStatement(ps, query, params, (err, rows) => {
                if (err) {
                    const errorObject = {
                        message: 'Something went wrong in the database...',
                        code: 500
                    }
                    next(errorObject)
                }
                if (rows && rows.recordset && rows.recordset[0]) {
                    logger.trace("Rows returned user")
                    logger.trace("Password : " + rows.recordset[0].Password)
                    if (
                        rows.recordset.length === 0 ||
                        rows.rowsAffected[0] === 0
                    ) {
                        const errorObject = {
                            message:
                                "Not authorized: emailaddress does not exists or password is incorrect!",
                            code: 401
                        }
                        res.status(401).json(errorObject)
                    } else {
                        bcrypt.compare(admin.Password, rows.recordset[0].Password, function (err, resB) {
                            if (err) {
                                const errorObject = {
                                    message: 'Password incorrect',
                                    code: 401
                                }
                                res.status(401).json(errorObject)
                            } else if (resB) {
                                logger.info("Password match, user logged id")

                                const payload = {
                                    UserId: rows.recordset[0].ID
                                }

                                module.exports.createToken(payload, (err, token) => {
                                    if (err) {
                                        const errorObject = {
                                            message: err.message,
                                            code: err.code
                                        }
                                        res.status(403).json(errorObject)
                                    }
                                    if (token) {
                                        res.status(200).json({
                                            token: token
                                        })
                                    } else {
                                        const errorObject = {
                                            message: "Unknown error occured",
                                            code: 500
                                        }
                                        next(errorObject)
                                    }
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
            })
        })
    },

    contactRegistreeCheck: (req, res, next) => {
        logger.info("contactRegistreeCheck aangeroepen")

        database.connect(() => {
            logger.info('Database connection established.')

            const user = req.body
            const ps = new sql.PreparedStatement()
            const params = {
                UserCode: user.Code,
                OrganisationId: user.OrganisationId
            }

            console.log(user);

            const query = queries.TEACHER_STUDENT_CHECK

            ps.input('UserCode', sql.NVarChar(128))
            ps.input('OrganisationId', sql.Int)

            database.executeStatement(ps, query, params, (err, rows) => {
                if (err) {
                    const errorObject = {
                        message: "Something went wrong in the database",
                        code: 500
                    }
                    next(errorObject)
                }
                if (rows && rows.recordset && rows.recordset[0]) {

                    if (!rows.recordset[0].Role) {
                        const errorObject = {
                            message: 'Code or OrganisationId is missing!',
                            code: 404
                        }
                        next(errorObject)
                    }
                    if (rows.recordset[0].Role === 'FALSE') {
                        const errorObject = {
                            message: "Registration code not found!",
                            code: 404
                        }
                        next(errorObject)
                    } else if (rows.recordset[0].Role === 'REGISTREE') {
                        logger.info("RegistrationCode match, user logged in")

                        const registration = rows.recordsets[0][0]

                        const today = new Date()
                        const openingDate = new Date(registration.OpeningDate)
                        const endDate = new Date(registration.EndDate)
                        const workshopDate = new Date(registration.WorkshopDate)

                        logger.trace(today)

                        if (openingDate > today) { // Before the opening
                            logger.debug('Registration period hasn\'t started yet');
                            const errorObject = {
                                message: "Registration period hasn't started yet",
                                code: 401,
                                state: "PREPERIOD"
                            }
                            next(errorObject)
                        } else if (today >= openingDate && today <= endDate) {
                            logger.info('Within registration period');

                            payload = {
                                UserId: registration.ID
                            };
                            module.exports.createToken(payload, (err, token) => {
                                if (err) {
                                    const errorObject = {
                                        message: err.message,
                                        code: err.code
                                    }
                                    next(errorObject)
                                }
                                if (token) {
                                    res.status(200).json({
                                        token: token,
                                        role: rows.recordset[0].Role,
                                        state: "PERIOD"
                                    })
                                }
                            })
                        } else if (today > endDate && today <= workshopDate) { 
                            logger.debug('Before workshop date');
                            const errorObject = {
                                message: 'Registration period is closed',
                                code: 401,
                                state: "BEFOREWORKSHOP"
                            }
                            next(errorObject)
                        } else if (today > workshopDate) {
                            logger.debug('After workshop date');

                            payload = {
                                UserId: user.Code,
                                OrganisationID: user.OrganisationId
                            }
                            module.exports.createToken(payload, (err, token) => {
                                if (err) {
                                    const errorObject = {
                                        message: err.message,
                                        code: err.code
                                    }
                                    next(errorObject)
                                }
                                if (token) {
                                    res.status(401).json({
                                        token: token,
                                        role: rows.recordset[0].Role,
                                        state: "AFTERWORKSHOP"
                                    })
                                }
                            })
                        } else {
                            logger.debug('Nothing matched')
                            res.status(401).json({
                                role: rows.recordset[0].Role,
                                state: "AFTERWORKSHOP"
                            })
                        }

                    } else if (rows.recordset[0].Role === 'CONTACT') {
                        const registration = rows.recordsets[0][0]
                        payload = {
                            UserId: registration.ID
                        }
                        module.exports.createToken(payload, (err, token) => {
                            if (err) {
                                const errorObject = {
                                    message: err.message,
                                    code: err.code
                                }
                                next(errorObject)
                            }
                            if (token) {
                                res.status(200).json({
                                    token: token,
                                    role: rows.recordset[0].Role,
                                    state: "CONTACTLOGIN"
                                })
                            }
                        })


                    } else {
                        const errorObject = {
                            message: 'Unknown error occured',
                            code: 500
                        }
                        next(errorObject)
                    }

                } else {
                    const errorObject = {
                        message: "Not authorized",
                        code: 401
                    }
                    next(errorObject)
                }
            })
        })

    },

    validateToken: (req, res, next) => {
        logger.info("validateToken called")

        const authHeader = req.headers.authorization
        if (!authHeader) {
            errorObject = {
                message: "Authorization header missing!",
                code: 401
            }
            logger.warn("Validate token failed: ", errorObject.message)
            return next(errorObject)
        }
        const token = authHeader.toLowerCase().includes('bearer') ?
            authHeader.substring(7, authHeader.length) : authHeader

        if (!token) {
            errorObject = {
                message: "Not authorized",
                code: 401
            }
            res.status(401).json(errorObject)
        } else {
            jwt.verify(token, secretKey, (err, payload) => {
                if (err) {
                    logger.info(err.message)
                    errorObject = {
                        message: "Not authorized",
                        code: 400
                    }
                    logger.warn("Validate token failed: ", errorObject.message)
                    next(errorObject)
                }
                logger.trace("payload", JSON.stringify(payload))
                if (payload && payload.data.UserId) {
                    logger.debug("token is valid", JSON.stringify(payload))

                    req.userId = payload.data.UserId
                    next()
                } else {
                    errorObject = {
                        message: "UserId is missing!",
                        code: 401
                    }
                    logger.warn("Validate token failed: ", errorObject.message)
                    next(errorObject)
                }
            })
        }
    },

    standaloneValidateToken: (req, res, next) => {
        logger.info("standaloneValidateToken called");

        const authHeader = req.headers.authorization
        if (!authHeader) {
            errorObject = {
                message: "Authorization header missing!",
                code: 401
            }
            logger.warn("Validate token failed: ", errorObject.message)
            return next(errorObject)
        }
        const token = authHeader.toLowerCase().includes('bearer') ?
            authHeader.substring(7, authHeader.length) : authHeader

        if (!token) {
            errorObject = {
                message: "Not authorized",
                code: 401
            }
            res.status(401).json(errorObject)
        }

        jwt.verify(token, secretKey, (err, payload) => {
            logger.trace("header : '" + authHeader + "'")
            logger.trace("token : '" + token + "'")
            logger.trace("payload : '" + payload + "'")

            if (err) {
                errorObject = {
                    message: "Not authorized",
                    code: 401
                }
                logger.warn("Validate token failed: ", errorObject.message)
                next(errorObject)
            } else if (payload && payload.data.UserId) {
                logger.debug("token is valid", JSON.stringify(payload))

                req.userId = payload.data.UserId
                logger.trace(res.headersSent)
                database.connect(() => {
                    logger.trace(res.headersSent)
                    logger.info('Database connection established')
                    const user = req.body
                    const ps = new sql.PreparedStatement()

                    if (payload.OrganisationId === undefined) {
                        logger.trace('OrganisationID was undefined, setting to zero')
                        payload.OrganisationId = 0;
                    }
                    const params = {
                        UserCode: payload.data.UserId,
                        OrganisationId: payload.OrganisationId
                    }

                    ps.input('UserCode', sql.NVarChar(128));
                    ps.input('OrganisationId', sql.Int);

                    database.executeStatement(ps, queries.GET_ROLE, params, (err, rows) => {
                        if (err) {
                            const errorObject = {
                                message: "Something went wrong in the database",
                                code: 500
                            }
                            next(errorObject)
                        } else if (rows) {
                            console.log(rows.recordset);

                            if (rows.recordset[0].Role === 'FALSE') {
                                const errorObject = {
                                    message: 'You are not authorized',
                                    code: 401
                                }
                                next(errorObject)
                            } else if (rows.recordset[0].Role === 'REGISTREE' || rows.recordset[0].Role === 'CONTACT' || rows.recordset[0].Role === 'ADMIN') {
                                res.status(200).json({
                                    role: rows.recordset[0].Role
                                })
                            } else {
                                const errorObject = {
                                    message: "Unknown error occured",
                                    code: 500
                                }
                                next(errorObject)
                            }
                        }

                    })
                })
            } else {
                errorObject = {
                    message: "UserId is missing!",
                    code: 401
                }
                logger.warn("Validate token failed: ", errorObject.message)
                next(errorObject)
            }
        })
    },
   
    createToken: (payload, callback) => {
        jwt.sign(
            {data: payload},
            secretKey,
            {expiresIn: 60 * 60},
            (err, token) => {
                if (err) {
                    const errorObject = {
                        message: "Could not generate JWT.",
                        code: 500
                    }
                    callback(errorObject, null)
                }
                if (token) {
                    callback(null, token)
                }

            }
        )
    }

}
