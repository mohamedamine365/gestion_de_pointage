const mongoose = require('mongoose');
const SiteCentralisateur = require('../models/SiteCentralisateur');

// Créer un site centralisateur
const createSite = async (req, res) => {
    try {
        const { nom } = req.body;

        if (!nom || typeof nom !== 'string' || nom.trim() === '') {
            return res.status(400).json({ 
                success: false,
                message: 'Le nom du site est requis et doit être une chaîne de caractères valide.'
            });
        }

        // Vérifier si le site existe déjà
        const existingSite = await SiteCentralisateur.findOne({ nom });
        if (existingSite) {
            return res.status(409).json({
                success: false,
                message: 'Un site avec ce nom existe déjà.'
            });
        }

        // Création du site
        const newSite = new SiteCentralisateur({ nom: nom.trim() });
        await newSite.save();

        res.status(201).json({
            success: true,
            site: newSite
        });
    } catch (error) {
        console.error('Erreur création site:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la création du site.'
        });
    }
};

// Lister tous les sites
const getAllSites = async (req, res) => {
    try {
        const sites = await SiteCentralisateur.find().sort({ nom: 1 });
        res.json({
            success: true,
            sites
        });
    } catch (error) {
        console.error('Erreur récupération sites:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la récupération des sites.'
        });
    }
};

// Supprimer un site
// Supprimer un site et ses établissements associés
const deleteSite = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID du site invalide.'
            });
        }

        // Supprimer d'abord les établissements associés au site
        const deletedEtablissements = await mongoose.model('Etablissement').deleteMany({ site_centralisateur: id });
        
        if (deletedEtablissements.deletedCount > 0) {
            console.log(`${deletedEtablissements.deletedCount} établissement(s) supprimé(s) car lié(s) à ce site.`);
        }

        // Supprimer ensuite le site centralisateur
        const deletedSite = await SiteCentralisateur.findByIdAndDelete(id);
        
        if (!deletedSite) {
            return res.status(404).json({
                success: false,
                message: 'Site non trouvé.'
            });
        }

        res.json({
            success: true,
            message: 'Site et établissements supprimés avec succès.'
        });
    } catch (error) {
        console.error('Erreur suppression site:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la suppression du site.'
        });
    }
};

// Modifier un site centralisateur
const updateSite = async (req, res) => {
    try {
        const { id } = req.params;
        const { nom } = req.body;

        // Vérifier si l'ID est valide
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID du site invalide.'
            });
        }

        // Vérifier si le nom est valide
        if (!nom || typeof nom !== 'string' || nom.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Le nom du site est requis et doit être une chaîne de caractères valide.'
            });
        }

        // Vérifier si un autre site a déjà ce nom
        const existingSite = await SiteCentralisateur.findOne({ nom: nom.trim(), _id: { $ne: id } });
        if (existingSite) {
            return res.status(409).json({
                success: false,
                message: 'Un autre site avec ce nom existe déjà.'
            });
        }

        // Mettre à jour le site
        const updatedSite = await SiteCentralisateur.findByIdAndUpdate(
            id,
            { nom: nom.trim() },
            { new: true, runValidators: true }
        );

        if (!updatedSite) {
            return res.status(404).json({
                success: false,
                message: 'Site non trouvé.'
            });
        }

        res.json({
            success: true,
            message: 'Site mis à jour avec succès.',
            site: updatedSite
        });
    } catch (error) {
        console.error('Erreur mise à jour site:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la mise à jour du site.'
        });
    }
};

module.exports = {
    createSite,
    getAllSites,
    deleteSite,
    updateSite
}