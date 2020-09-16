const express = require('express');
const router = express.Router();
const roleService = require("../Service/RoleService");


const isAllowed = require("../Auth/permission");

router.get('/roles', getAllRoles);
//router.post("/role", isAllowed("Admin", "Manager"), addRole)
router.post("/role", addRole)

module.exports = router;

function getAllRoles(req, res, next) {
    roleService.getAll()
        .then((roles) => res.json(roles))
        .catch(err => next(err));
}

function addRole(req, res, next) {
    roleService.addRole(req.body)
        .then((roles) => res.json(roles))
        .catch(err => next(err));
}