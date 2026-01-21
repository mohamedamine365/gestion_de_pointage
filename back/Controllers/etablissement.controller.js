const mongoose = require('mongoose');
const Etablissement = require('../models/Etablissement');
const SiteCentralisateur = require('../models/SiteCentralisateur');

// Créer un établissement
const createEtablissement = async (req, res) => {
    try {
        const { nom, adresse, ville, site_centralisateur } = req.body;

        if (!nom || !adresse || !ville || !site_centralisateur) {
            return res.status(400).json({
                success: false,
                message: 'Tous les champs sont requis.'
            });
        }

        // Vérifier si le site centralisateur existe
        const siteExists = await SiteCentralisateur.findById(site_centralisateur);
        if (!siteExists) {
            return res.status(400).json({
                success: false,
                message: 'Le site centralisateur spécifié n\'existe pas.'
            });
        }

        // Vérifier si l'établissement existe déjà
        const existingEtablissement = await Etablissement.findOne({ nom });
        if (existingEtablissement) {
            return res.status(409).json({
                success: false,
                message: 'Un établissement avec ce nom existe déjà.'
            });
        }

        const newEtablissement = new Etablissement({
            nom,
            adresse,
            ville,
            site_centralisateur
        });

        await newEtablissement.save();

        res.status(201).json({
            success: true,
            etablissement: newEtablissement
        });

    } catch (error) {
        console.error('Erreur création établissement:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la création de l\'établissement.'
        });
    }
};

// Lister tous les établissements
const getAllEtablissements = async (req, res) => {
    try {
        const etablissements = await Etablissement.find().populate('site_centralisateur', 'nom').sort({ nom: 1 });
        res.json({
            success: true,
            etablissements
        });
    } catch (error) {
        console.error('Erreur récupération établissements:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la récupération des établissements.'
        });
    }
};

// Supprimer un établissement
const deleteEtablissement = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de l\'établissement invalide.'
            });
        }

        const deletedEtablissement = await Etablissement.findByIdAndDelete(id);

        if (!deletedEtablissement) {
            return res.status(404).json({
                success: false,
                message: 'Établissement non trouvé.'
            });
        }

        res.json({
            success: true,
            message: 'Établissement supprimé avec succès.'
        });

    } catch (error) {
        console.error('Erreur suppression établissement:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la suppression de l\'établissement.'
        });
    }
};

// Modifier un établissement
const updateEtablissement = async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, adresse, ville, site_centralisateur } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de l\'établissement invalide.'
            });
        }

        if (!nom || !adresse || !ville || !site_centralisateur) {
            return res.status(400).json({
                success: false,
                message: 'Tous les champs sont requis.'
            });
        }

        // Vérifier si le site centralisateur existe
        const siteExists = await SiteCentralisateur.findById(site_centralisateur);
        if (!siteExists) {
            return res.status(400).json({
                success: false,
                message: 'Le site centralisateur spécifié n\'existe pas.'
            });
        }

        // Vérifier si un autre établissement a déjà ce nom
        const existingEtablissement = await Etablissement.findOne({ nom, _id: { $ne: id } });
        if (existingEtablissement) {
            return res.status(409).json({
                success: false,
                message: 'Un autre établissement avec ce nom existe déjà.'
            });
        }

        const updatedEtablissement = await Etablissement.findByIdAndUpdate(
            id,
            { nom, adresse, ville, site_centralisateur },
            { new: true, runValidators: true }
        );

        if (!updatedEtablissement) {
            return res.status(404).json({
                success: false,
                message: 'Établissement non trouvé.'
            });
        }

        res.json({
            success: true,
            message: 'Établissement mis à jour avec succès.',
            etablissement: updatedEtablissement
        });

    } catch (error) {
        console.error('Erreur mise à jour établissement:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la mise à jour de l\'établissement.'
        });
    }
};

module.exports = {
    createEtablissement,
    getAllEtablissements,
    deleteEtablissement,
    updateEtablissement
};
