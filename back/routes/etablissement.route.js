const express = require('express');
const router = express.Router();
const { createEtablissement, getAllEtablissements, deleteEtablissement, updateEtablissement } = require('../Controllers/etablissement.controller');

router.post('/createEtablissement', createEtablissement);
router.get('/getAllEtablissements', getAllEtablissements);
router.delete('/deleteEtablissement/:id', deleteEtablissement);
router.put('/updateEtablissement/:id', updateEtablissement);

module.exports = router;