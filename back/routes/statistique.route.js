const express = require('express');
const router = express.Router();
const { getAccessStatsByDay, getTotalUsers, getMouvementStats, getUserPrivilegeStats,  getTopUsers } = require('../Controllers/statistique.controller');

// Route pour obtenir les statistiques d'accès par jour
router.get('/access-stats', getAccessStatsByDay);
// Route pour obtenir le nombre total d'utilisateurs
router.get('/total-users', getTotalUsers);
// Route pour les statistiques globales des mouvements
router.get('/mouvement-stats', getMouvementStats);
// Route pour les statistiques des privilèges des utilisateurs
router.get('/user-privilege-stats', getUserPrivilegeStats);
// Route pour obtenir les utilisateurs les plus actifs
router.get('/top-users', getTopUsers);

module.exports = router;