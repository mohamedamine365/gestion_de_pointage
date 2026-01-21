const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();
require('./bd/bd'); // Connexion à la base de données

// Importation des routes
const userRoutes = require('./routes/user.route');
const siteCentralisateur = require('./routes/siteCentralisateur.route');
const etablissement = require('./routes/etablissement.route');
const mouvement = require('./routes/mouvement.route');
const emailRoutes =  require('./routes/emailRoutes.route');
const statistiqueRoutes =  require('./routes/statistique.route');

const app = express();

// ✅ Middleware
app.use(cors()); // Gestion des autorisations CORS
app.use(express.json()); // Parsing JSON
app.use(morgan('dev')); // Logging des requêtes
app.use(helmet()); // Sécurisation des en-têtes HTTP
app.use(compression()); // Compression des réponses

// ✅ Routes avec le préfixe /api
app.use('/api/users', userRoutes);
app.use('/api/siteCentralisateur', siteCentralisateur);
app.use('/api/etablissement', etablissement);
app.use('/api/mouvement', mouvement);
app.use('/api/email', emailRoutes);
app.use('/api/statistique', statistiqueRoutes);


// ✅ Gestion des routes inexistantes
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route non trouvée" });
});

// ✅ Gestion globale des erreurs
app.use((err, req, res, next) => {
    console.error("Erreur:", err);
    res.status(500).json({ success: false, message: "Erreur interne du serveur" });
});

// ✅ Démarrer le serveur
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur le port ${PORT}`);
});
