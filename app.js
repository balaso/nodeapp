var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const errorHandlers = require("./API/ErrorHandler/ErrorHandler");
var rfs = require('rotating-file-stream') // version 2.x
const logger = require("./API/logger");

const requestIp = require('request-ip');

var onFinished = require('on-finished');

const requestLogService = require("./API/Service/RequestLogService");

var fs = require('fs')
var path = require('path')

// create a write stream (in append mode)
//var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

// create a rotating write stream
var accessLogStream = rfs.createStream('access.log', {
    interval: '2d', // rotate 2 day
    path: path.join(__dirname, 'log'),
})

const jwt = require("./API/Auth/jwt");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.all('*', function(request, res, next){
    const start = Date.now();
    const { method, url, headers, body } = request;
 
    const clientIp = requestIp.getClientIp(request);

    onFinished(res, function (err, res) {
        const ms = Date.now() - start;
        let userId = "0";
        if(request.userInfo !== undefined){
            userId = request.userInfo._id;
        }
        //console.log(`seconds elapsed = ${Math.floor(millis / 1000)}`);
        let obj = {
            "method" : method,
            "url" : url,
            "IP" : clientIp,
            "userId" : userId,
            "startTime" : start,
            "endTime": Date.now(),
            "TotalTimeRequired" : ms
        }
        
        var responseObj = {
            "status" : res.statusCode
        };
        obj["response"] = responseObj;
        requestLogService.addRequestLog(obj);
        if(err){
            console.log(err);
        }
    })
    next();
});
app.use(morgan('combined', { stream: accessLogStream }));

// use JWT auth to secure the api
app.use(jwt());

app.use('/api', require("./API/Controller/AccountController"));
app.use('/api', require("./API/Controller/RoleController"));
app.use('/api', require("./API/Controller/UserController"));
app.use('/api', require("./API/Controller/PageController"));

app.use(errorHandlers);

app.get('/', function(request, res, next){
    res.send("Application works");
});
// start server
const port = process.env.NODE_ENV === 'production' ? 3006 : 4444;

const server = app.listen(port, function () {
    console.log('Server listening on port ' + port);
    logger.log("info", "Server listening on port " + port);
});


module.exports = app;
