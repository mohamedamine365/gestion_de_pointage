const express = require('express');
const router = express.Router();
const { createMouvement, getAllMouvements, deleteMouvement, updateMouvement , getMouvementById} = require('../Controllers/mouvement.controller');

// Route pour créer un mouvement
router.post('/createMouvement', createMouvement);

// Route pour récupérer tous les mouvements
router.get('/getAllMouvements', getAllMouvements);

// Route pour supprimer un mouvement
router.delete('/deleteMouvement/:id', deleteMouvement);

// Route pour mettre à jour un mouvement
router.put('/updateMouvement/:id', updateMouvement);

router.get('/getbyid/:id', getMouvementById);

module.exports = router;
