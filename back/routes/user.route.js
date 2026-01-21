const express = require('express');
const router = express.Router();
const { creationUser, signIn, deleteUser, updateUser, getUserById, getAllUsers, recupererUser } = require('../Controllers/user.controller');

// Route pour la création d'un utilisateur
router.post('/createUser', creationUser);

// Route pour la connexion de l'utilisateur
router.post('/signin', signIn);

// Route pour supprimer un utilisateur
router.delete('/deleteUser/:id', deleteUser);

// Route pour mettre à jour un utilisateur
router.put('/updateUser/:id', updateUser);

// Route pour récupérer un utilisateur par ID
router.get('/getUserById/:id', getUserById);

// Route pour récupérer un utilisateur par ID
router.get('/getAllUsers', getAllUsers );

// Route pour réactiver un utilisateur
router.put('/recupererUser/:id', recupererUser);

module.exports = router;
