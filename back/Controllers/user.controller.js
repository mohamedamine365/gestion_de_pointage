const User = require('../models/User');
const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const creationUser = async (req, res) => {
    const { matricule, nom, prenom, email, password, privilege, etablissement } = req.body;

    // 1. Validation des données
    if (!matricule || !nom || !prenom || !email || !password || !privilege) {
        return res.status(400).json({
            success: false,
            message: 'Tous les champs obligatoires doivent être fournis'
        });
    }

    try {
        // 2. Vérification des doublons
        const existingUser = await User.findOne({ 
            $or: [{ matricule }, { email }] 
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Un utilisateur avec ce matricule ou email existe déjà'
            });
        }

        // 3. Vérification de l'établissement si fourni
        if (etablissement) {
            const etablissementExists = await mongoose.model('Etablissement').exists({ _id: etablissement });
            if (!etablissementExists) {
                return res.status(404).json({
                    success: false,
                    message: 'Établissement non trouvé'
                });
            }
        }

        // 4. Hashage du mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 5. Création de l'utilisateur
        const newUser = new User({
            matricule,
            nom,
            prenom,
            email,
            password: hashedPassword,
            privilege,
            etablissement: etablissement || null,
            actif: true
            // date_creation est ajoutée automatiquement
        });

        // 6. Sauvegarde
        const savedUser = await newUser.save();

        // 7. Réponse sans le mot de passe
        const userResponse = savedUser.toObject();
        delete userResponse.password;

        res.status(201).json({
            success: true,
            user: userResponse
        });

    } catch (error) {
        console.error('Erreur création utilisateur:', error);
        
        // Gestion spécifique des erreurs de validation Mongoose
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: 'Erreur de validation',
                errors: messages
            });
        }

        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la création du compte'
        });
    }
};


const signIn = async (req, res) => {
    const { email, password } = req.body;
    
    // 1. Validation basique
    if (!email || !password) {
        return res.status(400).json({ 
            success: false,
            message: 'Email et mot de passe requis' 
        });
    }

    try {
        // 2. Recherche de l'utilisateur
        const user = await User.findOne({ email })
            .select('+password') // Inclure le mot de passe (normalement exclu par défaut)
            .populate('etablissement', 'nom site_centralisateur'); // Charger les relations utiles

        if (!user || !user.actif) {
            return res.status(401).json({ 
                success: false,
                message: 'Identifiants incorrects ou compte désactivé' 
            });
        }

        // 3. Vérification du mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Identifiants incorrects'
            });
        }

        // 4. Préparation du payload JWT
        const payload = {
            id: user._id,
            matricule: user.matricule,
        };

        // 5. Génération du token avec expiration
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET || 'votre_secret_complexe', // À mettre dans .env
            { expiresIn: '8h' } // Expiration après 8 heures
        );

        // 6. Réponse sécurisée
        res.json({
            success: true,
            token,
            expiresIn: 28800, // 8h en secondes
            user: {
                _id: user._id,
                matricule: user.matricule,
            }
        });

    } catch (error) {
        console.error('Erreur connexion:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de l\'authentification'
        });
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    const { matricule, nom, prenom, email, password, privilege, etablissement } = req.body;

    // 1. Vérification de la validité de l'ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: 'ID utilisateur invalide'
        });
    }

    // 2. Vérification des champs
    if (!matricule || !nom || !prenom || !email || !privilege || !etablissement) {
        return res.status(400).json({
            success: false,
            message: 'Tous les champs obligatoires doivent être fournis'
        });
    }

    try {
        // 3. Recherche de l'utilisateur
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        // 4. Mise à jour des informations de l'utilisateur
        user.matricule = matricule;
        user.nom = nom;
        user.prenom = prenom;
        user.email = email;
        user.privilege = privilege;
        user.etablissement = etablissement || null;

        // Si un mot de passe est fourni, il sera mis à jour
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        // 5. Sauvegarde des changements
        const updatedUser = await user.save();

        // 6. Réponse sans le mot de passe
        const userResponse = updatedUser.toObject();
        delete userResponse.password;

        res.json({
            success: true,
            message: 'Utilisateur mis à jour avec succès',
            user: userResponse
        });
    } catch (error) {
        console.error('Erreur mise à jour utilisateur:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la mise à jour de l\'utilisateur'
        });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;

    // 1. Vérification de la validité de l'ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: 'ID utilisateur invalide'
        });
    }

    try {
        // 2. Mise à jour de l'utilisateur (soft delete)
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { actif: false },
            { new: true } // Pour retourner l'objet mis à jour
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        res.json({
            success: true,
            message: 'Utilisateur désactivé avec succès',
            user: updatedUser
        });
    } catch (error) {
        console.error('Erreur lors de la désactivation de l\'utilisateur :', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la désactivation de l\'utilisateur'
        });
    }
};
const getUserById = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: 'ID utilisateur invalide'
        });
    }

    try {
        const user = await User.findById(id)
            .populate({
                path: 'etablissement',
                populate: {
                    path: 'site_centralisateur',
                    model: 'SiteCentralisateur'
                }
            });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        const userResponse = user.toObject();
        delete userResponse.password;

        res.json({
            success: true,
            user: userResponse
        });

    } catch (error) {
        console.error('Erreur récupération utilisateur:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la récupération de l\'utilisateur'
        });
    }
};


const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .populate('etablissement', 'nom site_centralisateur')
            .sort({ actif: -1, date_creation: -1 }) // Trie par actif (true d'abord), puis date_creation (plus récent d'abord)
            .exec();

        if (!users || users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Aucun utilisateur trouvé'
            });
        }

        // Supprimer les mots de passe avant l'envoi
        const usersResponse = users.map(user => {
            const userObj = user.toObject();
            delete userObj.password;
            return userObj;
        });

        res.json({
            success: true,
            users: usersResponse
        });
    } catch (error) {
        console.error('Erreur récupération des utilisateurs:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la récupération des utilisateurs'
        });
    }
};

const recupererUser = async (req, res) => {
    const { id } = req.params;

    // 1. Vérification de la validité de l'ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: 'ID utilisateur invalide'
        });
    }

    try {
        // 2. Mise à jour de l'utilisateur (activation)
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { actif: true },
            { new: true } // Pour retourner l'objet mis à jour
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        // 3. Suppression du mot de passe dans la réponse
        const userResponse = updatedUser.toObject();
        delete userResponse.password;

        res.json({
            success: true,
            message: 'Utilisateur réactivé avec succès',
            user: userResponse
        });
    } catch (error) {
        console.error('Erreur lors de la réactivation de l\'utilisateur :', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la réactivation de l\'utilisateur'
        });
    }
};


module.exports = {
    creationUser,
    signIn,
    updateUser,
    deleteUser,
    getUserById,
    getAllUsers,
    recupererUser
}
