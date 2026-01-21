const mongoose = require('mongoose');
const Mouvement = require('../models/Mouvement');

// Créer un mouvement (pointage)
const createMouvement = async (req, res) => {
    try {
        const { user, resultat, methode } = req.body;

        if (!user || !resultat || !methode) {
            return res.status(400).json({
                success: false,
                message: 'Tous les champs sont requis.'
            });
        }

        // Vérifier si l'utilisateur existe
        const userExists = await mongoose.model('User').findById(user);
        if (!userExists) {
            return res.status(404).json({
                success: false,
                message: 'L\'utilisateur spécifié n\'existe pas.'
            });
        }

        const newMouvement = new Mouvement({
            user,
            resultat,
            methode
        });

        await newMouvement.save();

        res.status(201).json({
            success: true,
            mouvement: newMouvement
        });

    } catch (error) {
        console.error('Erreur création mouvement:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la création du mouvement.'
        });
    }
};

// Lister tous les mouvements
const getAllMouvements  = async (req, res) => {
    try {
        const mouvements = await Mouvement.find()
            .populate({
                path: 'user',
                match: { actif: true }, // ❗ Filtre ici pour ne récupérer que les users actifs
                populate: {
                    path: 'etablissement',
                    model: 'Etablissement',
                    populate: {
                        path: 'site_centralisateur',
                        model: 'SiteCentralisateur'
                    }
                }
            })
            .sort({ date_mouvement: -1 });

        // ⚠️ Exclure les mouvements dont user est null (non-actif)
        const mouvementsActifs = mouvements.filter(m => m.user !== null);

        res.json({
            success: true,
            mouvements: mouvementsActifs
        });
    } catch (error) {
        console.error('Erreur récupération mouvements utilisateurs actifs:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la récupération des mouvements.'
        });
    }
};



// Supprimer un mouvement
const deleteMouvement = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de mouvement invalide.'
            });
        }

        const deletedMouvement = await Mouvement.findByIdAndDelete(id);

        if (!deletedMouvement) {
            return res.status(404).json({
                success: false,
                message: 'Mouvement non trouvé.'
            });
        }

        res.json({
            success: true,
            message: 'Mouvement supprimé avec succès.'
        });

    } catch (error) {
        console.error('Erreur suppression mouvement:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la suppression du mouvement.'
        });
    }
};

// Modifier un mouvement
const updateMouvement = async (req, res) => {
    try {
        const { id } = req.params;
        const { user, resultat, methode } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de mouvement invalide.'
            });
        }

        const updatedMouvement = await Mouvement.findByIdAndUpdate(
            id,
            { user, resultat, methode },
            { new: true, runValidators: true }
        );

        if (!updatedMouvement) {
            return res.status(404).json({
                success: false,
                message: 'Mouvement non trouvé.'
            });
        }

        res.json({
            success: true,
            message: 'Mouvement mis à jour avec succès.',
            mouvement: updatedMouvement
        });

    } catch (error) {
        console.error('Erreur mise à jour mouvement:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la mise à jour du mouvement.'
        });
    }
};

// Obtenir un mouvement par ID avec tous les populate
const getMouvementById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de mouvement invalide.'
            });
        }

        const mouvement = await Mouvement.findById(id)
            .populate({
                path: 'user',
                populate: {
                    path: 'etablissement',
                    model: 'Etablissement',
                    populate: {
                        path: 'site_centralisateur',
                        model: 'SiteCentralisateur'
                    }
                }
            });

        if (!mouvement) {
            return res.status(404).json({
                success: false,
                message: 'Mouvement non trouvé.'
            });
        }

        res.json({
            success: true,
            mouvement
        });
    } catch (error) {
        console.error('Erreur récupération mouvement par ID:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la récupération du mouvement.'
        });
    }
};


module.exports = {
    createMouvement,
    getAllMouvements,
    deleteMouvement,
    updateMouvement,
    getMouvementById
};
