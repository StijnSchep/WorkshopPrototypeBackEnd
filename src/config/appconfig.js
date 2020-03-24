module.exports = {
    logger: require('tracer').colorConsole({
        format: [
            '{{timestamp}} <{{title}}> {{message}} (in {{file}}:{{line}})',
            {
                error: '{{timestamp}} <{{title}}> {{message}} (in {{file}}:{{line}})'
            }
        ],
        dateformat: 'HH:MM:ss.L',
        preprocess: function (data) {
            data.title = data.title.toUpperCase()
        },
        level: process.env.LOG_LEVEL || 'trace',
        transport: function (data) {
            console.log(data.output);
            require('fs').appendFile('./logs/latest.log', data.rawoutput + '\n', (err) => {
                if (err) throw err;
            });
        }
    }),

    dbconfig: {
        user: 'SkoolWS',
        password: '3A)AD9a#x]zgf+($',
        server: '192.168.2.21',
        database: 'SkoolWorkshops',
        port: 1433,
        driver: 'msnodesql',
        connectionTimeout: 1500,
        options: {
            // 'true' if you're on Windows Azure
            encrypt: false
        }
    },

    secretKey: process.env.SECRET_KEY || 'Wkss$0j2ldn!iah',

    fileConfig: {
        tempPath: 'tmp/',
        finalPath: './store/',
        useTimeStampFolders: true,
        useTimeStampFiles: true,
        enableDebugging: true,
        allowedMimeTypes: ['image/jpeg','image/png'],
        allowedExtentions: {
            'pdn':'application/octet-stream',
            'png':'image/png',
            'jpg':'image/jpeg',
            'jpeg':'image/jpeg'
        }
    }


}
