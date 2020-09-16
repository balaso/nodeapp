const express = require('express');
const router = express.Router();
const pageService = require("../Service/PageService");


const isAllowed = require("../Auth/permission");

router.get('/pages',  isAllowed("Admin"), getPages);
router.post('/pages',  isAllowed("Admin"), addPage);
router.delete('/pages/:id',  isAllowed("Admin"), deletePage);

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

