const sql = require('mssql')
const config = require('../config/appconfig')

const logger = config.logger
const dbconfig = config.dbconfig

module.exports = {
    connect: (callback) => {
        logger.debug('Connection called');
        sql.close();

        try {
            sql.connect(dbconfig, err => {
                if (err) {
                    sql.close();
                    logger.error(err);
                    logger.log('Error 1 triggered');
                } else {
                    // Connection is set, give callback
                    logger.trace('Callback Triggered');
                    callback();
                }
            })
        } catch (err) {
            logger.error(err);
        }
    },

    executeStatement:
        (statement, query, params, callback) => {
            logger.debug('Execute statement called');
            // Prepare the statement with the given query string
            //logger.info('Statement:',statement)
            statement.prepare(query, err => {
                if (err) {
                    sql.close();
                    //Handle error
                    logger.error('Error while preparing statement(s)');
                    logger.error(err);
                    callback(err, null);
                } else {
                    logger.trace('Statement prepared');
                    // Preparation was successful, Statement can now be executed
                    // When executed, the parameters are injected into the query
                    statement.execute(params, (err, data) => {
                        if (err) {
                            sql.close();
                            // Handle error
                            logger.error('Error while executing');
                            logger.error(err);
                            callback(err, null);
                            return;
                        }

                        if (data) {
                            // Query returned data
                            callback(null, data)
                        } else {
                            logger.info('Nothing found..........');
                            // Query returned nothing
                            callback(null, null);
                        }

                        // Unprepare the statement
                        statement.unprepare((err) => {
                            // Optional error handling
                            if (err) {
                                logger.info('Error while unpreparing, this is normal.');
                                logger.warn(err);
                            }
                            sql.close();
                        });
                    });
                }
            })
        },
}