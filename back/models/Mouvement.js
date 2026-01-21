const mongoose = require('mongoose');

const MouvementSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date_mouvement: {
        type: Date,
        default: Date.now
    },
    resultat: {
        type: String,
        enum: ['Succès', 'Failed'],
        default: 'Succès'
    },
    methode: {
        type: String,
        enum: ['Badge', 'Mobile', 'Biométrique'],
        default: 'Badge'
      }
});

module.exports = mongoose.model('Mouvement', MouvementSchema);