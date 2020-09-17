var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const errorHandlers = require("./API/ErrorHandler/ErrorHandler");
var rfs = require('rotating-file-stream') // version 2.x


var fs = require('fs')
var path = require('path')

// create a write stream (in append mode)
//var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

// create a rotating write stream
var accessLogStream = rfs.createStream('access.log', {
    interval: '2d', // rotate 2 day
    path: path.join(__dirname, 'log'),
})

var loggerFormat = ':id [:date[web]]" :method :url"  :status :responsetime   --> ms';

const jwt = require("./API/Auth/jwt");

const app = express();
app.use(logger('combined', { stream: accessLogStream }));

// use JWT auth to secure the api
app.use(jwt());

//const router = express.Router();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', require("./API/Controller/AccountController"));
app.use('/api', require("./API/Controller/RoleController"));
app.use('/api', require("./API/Controller/UserController"));
app.use('/api', require("./API/Controller/PageController"));

app.use(errorHandlers);
// start server
const port = process.env.NODE_ENV === 'production' ? 3006 : 4444;

const server = app.listen(port, function () {
    console.log('Server listening on port ' + port);
});

//module.exports = app;
