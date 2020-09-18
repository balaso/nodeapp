const {  createLogger, format,transports, addColors } = require('winston');
const { combine, timestamp, printf } = format;

var myCustomLevels = {
  levels:{ 
    error: 0, 
    warn: 1, 
    info: 2, 
    http: 3,
    verbose: 4, 
    debug: 5, 
    silly: 6,
    request: 2 
  },
  colors: {
    error: "red",
    warn: "darkred",
    info: "black",
    http: "green",
    debug: "gray",
    "request": "blue"
  }
  };

const myFormat = printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `{"level":"${level}", "timestamp":"${timestamp}", "message":"${message}"}`;

    if(metadata && Object.keys(metadata).length > 0){
      msg += JSON.stringify(metadata)
    }
    return msg;
});

const level = process.env.LOG_LEVEL || 'debug';

const logger = new createLogger({
  levels: myCustomLevels.levels,
    prettyPrint : true,
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
        myFormat,
      ),
    transports: [
      new transports.File({ 
        filename: 'log/requestInfo.log',
        level: 'request',
        json: true,
        maxsize: 5242880, //5MB
        maxFiles: 5
      }
    ),
    new transports.File({ filename: 'log/error.log', level: 'error'}),
    new transports.File({ filename: 'log/info.log', level: 'info' }),
    new transports.Console({
      level : "info",
        format: combine(
          format.colorize(),
          format.simple(),
          myFormat
        )
      })
    ],
    exitOnError: false,
    exceptionHandlers: [
      new transports.File({ filename: 'log/exceptions.log' })
    ]
});

module.exports = logger
