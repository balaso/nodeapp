const express = require('express');
const router = express.Router();
const pageService = require("../Service/PageService");


const isAllowed = require("../Auth/permission");

router.get('/pages',  isAllowed("Admin"), getPages);
router.post('/pages',  isAllowed("Admin"), addPage);
router.delete('/pages/:id',  isAllowed("Admin"), deletePage);
router.put('/pages', isAllowed("Admin"), updatePage);

router.get('/pages/roles',  isAllowed("Admin"), getPageWiseRoles);

router.get('/pages/users',  isAllowed("Admin"), getUserPageWise);

module.exports = router;

function getPages(req, res, next) {
    pageService.getAvailablePages(req, res)
        .then((pages) => res.json( { success: true, data : pages }))
        .catch(err => next(err));
}


function addPage(req, res, next) {
    pageService.addPage(req, res)
        .then((page) => res.json({ success: true, data : page }))
        .catch(err => next(err));
}

function deletePage(req, res, next) {
    pageService.deletePage(req, res, req.params.id)
        .then(() => res.json({ "success": true, message : "Page Deleted Successfully"}))
        .catch(err => next(err));
}

function updatePage(req, res, next) {
    pageService.update(req, res)
        .then(() => res.status(200).json({success: true, message:"Page updated successfully"}))
        .catch(err => next(err));
}

function getPageWiseRoles(req, res, next) {
    pageService.getPageWiseRoles(req, res)
        .then((result) => res.json( { success: true, data : result }))
        .catch(err => next(err));
}

function getUserPageWise(req, res, next) {
    console.log(req.userInfo);
    pageService.getUserPageWise(req, res)
        .then((result) => res.json( { success: true, data : result }))
        .catch(err => next(err));
}

