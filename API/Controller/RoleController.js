const express = require('express');
const router = express.Router();
const roleService = require("../Service/RoleService");


const isAllowed = require("../Auth/permission");

router.get('/roles', getAllRoles);
router.post("/role", isAllowed("Admin"), addRole)
router.get('/userRole', getUserRole);
router.delete('/role/:id', deleteRole);

module.exports = router;

function getAllRoles(req, res, next) {
    roleService.getAll()
        .then((roles) => res.json( { success: true, data : roles }))
        .catch(err => next(err));
}

function addRole(req, res, next) {
    roleService.addRole(req, res)
        .then((roles) => res.json(roles))
        .catch(err => next(err));
}

function getUserRole(req, res, next) {
    roleService.getUserRole(req, res)
        .then((roles) => res.json(roles))
        .catch(err => next(err));
}

function deleteRole(req, res, next) {
    roleService.deleteRole(req, res, req.params.id)
        .then(() => res.json({ "success": true, message : "Role Deleted Successfully"}))
        .catch(err => next(err));
}