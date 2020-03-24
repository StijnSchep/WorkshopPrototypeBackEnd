const logger = require('../config/appconfig').logger
const database = require('../datalayer/mssql.dao')
const sql = require('mssql');
const queries = require('../constants/querys');

module.exports = {

    addGroup: (req, res, next) => {
        logger.info('addGroup called')

        database.connect(() => {
            const group = req.body;

            const ps = new sql.PreparedStatement();

            ps.input('Name', sql.NVarChar(128));
            ps.input('OrganisationID', sql.Int);
            ps.input('RegistrationID', sql.Int);

            const params = {
                Name: group.Name,
                OrganisationID: group.OrganisationID,
                RegistrationID: group.RegistrationID
            };
            console.log(params);
            const query = queries.ADD_GROUP;

            database.executeStatement(ps, query, params, (err, rows) => {
                if (err) {
                    const errorObject = {
                        message: "Something went wrong in the database",
                        code: 500
                    }
                    next(errorObject)
                }
                if (rows) {
                    res.status(200).json({result: rows.recordset})
                }
            })
        })
    }
    
}