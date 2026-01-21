const mongoose = require('mongoose');

const Etablissement = new mongoose.Schema({
    nom: {
        type: String,
        required: true,
        unique: true
    },
    adresse: {
        type: String,
        required: true
    },
    ville: {
        type: String,
        required: true
    },
    site_centralisateur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SiteCentralisateur',
        required: true
    }
});

module.exports = mongoose.model('Etablissement', Etablissement);