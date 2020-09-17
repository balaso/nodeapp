const express = require('express');
const router = express.Router();
const accountService = require("../Service/AccountService");


const isAllowed = require("../Auth/permission");

router.post('/register', register);
router.post('/authenticate', authenticate);
router.get('/activate', activateUser);


module.exports = router;

function register(req, res, next) {
    accountService.register(req.body)
        .then((user) => res.json(user))
        .catch(err => next(err));
}

function authenticate(req, res, next) {
    accountService.authenticate(req, res)
        .then(user => user ? res.json(user) : res.status(400).json({ status: false, message: 'Username or password is incorrect' }))
        .catch(err => next(err));
}

function activateUser(req, res, next) {
    accountService.activateUser(req, res)
        .then((user) => res.json(user))
        .catch(err => next(err));
}