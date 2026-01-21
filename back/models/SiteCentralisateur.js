const mongoose = require('mongoose');

const SiteCentralisateurSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true,
        unique: true
    }
});

module.exports = mongoose.model('SiteCentralisateur', SiteCentralisateurSchema);