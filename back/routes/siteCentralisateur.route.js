const express = require('express');
const router = express.Router();
const { createSite, getAllSites, deleteSite, updateSite } = require('../Controllers/siteCentralisateur.controller');

router.post('/createSite', createSite);
router.get('/getAllSites', getAllSites);
router.delete('/deleteSite/:id', deleteSite);
router.put('/updateSite/:id', updateSite);

module.exports = router;