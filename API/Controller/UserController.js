const express = require('express');
const router = express.Router();
const userService = require("../Service/UserService");

const isAllowed = require("../Auth/permission");

router.get('/users', getAll);
router.get('/users/:username', getByUserName);

router.delete('/:id', _delete);
router.delete('/users/:username', deleteByUserName);
router.get('/current', getCurrentUser);
router.put('/users', updateUser);

router.get('/users/roles', getUserRoles);

module.exports = router;

function getAll(req, res, next) {
    userService.getAll(req, res)
        .then((user) => res.json(user))
        .catch(err => next(err));
}


function getByUserName(req, res, next) {
userService.getByUserName(req.params.username)
    .then(user => user ? res.json(user) : res.sendStatus(404))
    .catch(err => next(err));
}

function _delete(req, res, next) {
    userService.delete(req.params.id)
        .then(() => res.json({ "success": true, message : "User Deleted Successfully"}))
        .catch(err => next(err));
}

function deleteByUserName(req, res, next) {
    userService.deleteByUserName(req,res)
        .then(() => res.json({ "success": true, message : "User Deleted Successfully"}))
        .catch(err => next(err));
}

function getCurrentUser(req, res, next) {
    userService.getById(req.user.sub)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function updateUser(req, res, next) {
    userService.update(req, res)
        .then(() => res.status(200).json({success: true, message:"user updated successfully"}))
        .catch(err => next(err));
}

function getUserRoles(req, res, next) {
    authoritiesService.getAll()
        .then(users => res.json(users))
        .catch(err => next(err));
}