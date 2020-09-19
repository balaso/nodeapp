const express = require('express');
const router = express.Router();

const accountService = require("../Service/AccountService");


const isAllowed = require("../Auth/permission");

router.post('/register', register);
router.post('/authenticate', authenticate);
router.get('/activate', activateUser);

router.post('/account/reset-password/init', requestPasswordReset);
router.post('/account/reset-password/finish', finishPasswordReset);
router.post('/account/change-password', changePassword);
router.get('/account', getCurrentUser);
router.get('/logout', logout);

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

function requestPasswordReset(req, res, next) {
    if(req.body){
        accountService.requestPasswordReset(req, res)
        .then((message) => res.json(message))
        .catch(err => next(err));
    }else{
        res.json({message: "provide valid email address"});
    }
}

function finishPasswordReset(req, res, next) {
    var passwordVM = req.body;
    if(passwordVM.key == null || passwordVM.key == "" || passwordVM.newPassword == null || passwordVM.newPassword == ""){
        var e = new Error("");
        e.name = "InvalidRequestBody";
        throw e;
    }else{
        accountService.finishPasswordReset(req, res)
        .then((message) => res.json(message))
        .catch(err => next(err));
    }  
}
function getCurrentUser(req, res, next) {
    res.json(req.userInfo);
}

function changePassword(req, res, next) {
    var passwordVM = req.body;
    if(passwordVM.currentPassword == null || passwordVM.currentPassword == "" || passwordVM.newPassword == null || passwordVM.newPassword == ""){
        var e = new Error("");
        e.name = "InvalidRequestBody";
        throw e;
    }else{
        accountService.changePassword(req, res)
        .then((message) => res.json(message))
        .catch(err => next(err));
    }  
}

function logout(req, res, next) {
    if(req.user.sub){
        req.user = {};
    }
    res.status(200).json({ success: true, message: "logout successfully" });
}


