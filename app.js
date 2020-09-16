var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const errorHandlers = require("./API/ErrorHandler/ErrorHandler");

const jwt = require("./API/Auth/jwt");

const app = express();

// use JWT auth to secure the api
app.use(jwt());

//const router = express.Router();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', require("./API/Controller/AccountController"));
app.use('/api', require("./API/Controller/RoleController"));
app.use('/api', require("./API/Controller/UserController"));
app.use('/api', require("./API/Controller/PageController"));



app.use(logger('dev'));

app.use(errorHandlers);
// start server
const port = process.env.NODE_ENV === 'production' ? 3006 : 4444;

const server = app.listen(port, function () {
    console.log('Server listening on port ' + port);
});

//module.exports = app;
