//Modules
const express = require('express');
const logger = require('./config/appconfig').logger;
const helmet = require('helmet')

//Routes
const registreeRoutes = require('./routes/registree.routes');
const loginRoutes = require('./routes/login.routes');
const workshopRoutes = require('./routes/workshop.routes');
const registrationRoutes = require('./routes/registration.routes');
const organisationRoutes = require('./routes/organisation.routes');
const groupRoutes = require('./routes/group.routes');
const enrollRoutes = require('./routes/enroll.routes');
const roundRoutes = require('./routes/round.routes')

//File Uploader library
const fileUpload = require('express-fileupload');
const fileConfig = require('./config/appconfig').fileConfig;

const app = express();
const port = process.env.APIPORT || 4787;

app.use(express.json());
app.use(helmet());

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    //intercepts OPTIONS method
    if ('OPTIONS' === req.method) {
        //respond with 200
        res.sendStatus(200);
    } else {
        //move on
        next();
    }
});

// Generic endpoint handler - voor alle routes
app.all('*', (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    logger.info('Generic request called :');
    const {method, url} = req;
    logger.info(`${method} ${url} : ${ip}`);
    next()
});

// Config voor file uploader
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: fileConfig.tempPath,
    limits: {fileSize: 50 * 1024 * 1024},
    safeFileNames: true,
    preserveExtension: true
}))

// Mogelijke routes
app.use('/api/login', loginRoutes);
app.use('/api/workshops', workshopRoutes);
app.use('/api/organisations', organisationRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/registrees', registreeRoutes);
app.use('/api/enroll', enrollRoutes);
app.use('/api/rounds', roundRoutes)

// Handle endpoint not found.
app.all('*', (req, res, next) => {
    const {method, url} = req;
    const errorMessage = `${method} ${url} does not exist.`;
    logger.warn(errorMessage);
    const errorObject = {
        message: errorMessage,
        code: 404,
        date: new Date()
    };
    next(errorObject)
});

// Error handler
app.use((error, req, res, next) => {
    logger.error('Error handler: ', error.message.toString());
    res.status(error.code).json(error)
});

app.listen(port, () => logger.info(`skoolworkshops app listening on port ${port}!`));

module.exports = app;
