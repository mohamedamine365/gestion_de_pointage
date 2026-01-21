const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
   
    matricule: {
        type: String,
        unique: true,
        required: true
    },
    nom: { type: String, required: true },

    prenom: { type: String, required: true },

    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    privilege: {
        type: String,
        enum: ['Admin', 'Filiale', 'Groupe', 'Gestion'],
    },
    etablissement: {  // Relation avec Etablissement
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Etablissement'
    },
    date_creation: {
        type: Date,
        default: Date.now
    },
    // Dans tous les schémas :
    actif: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('User', UserSchema);

