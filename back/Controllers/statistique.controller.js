const Mouvement = require('../models/Mouvement');
const User = require('../models/User');
const mongoose = require('mongoose');




// Statistiques globales des mouvements
const getMouvementStats = async (req, res) => {
    try {
        // Calcul des 30 derniers jours
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        // Agrégation pour les statistiques globales
        const [stats, dailyStats] = await Promise.all([
            // Statistiques globales
            Mouvement.aggregate([
                {
                    $facet: {
                        totalCount: [{ $count: "count" }],
                        byResult: [{ $group: { _id: "$resultat", count: { $sum: 1 } } }],
                        byMethod: [{ $group: { _id: "$methode", count: { $sum: 1 } } }]
                    }
                },
                { $unwind: "$totalCount" }
            ]),
            
            // Moyenne journalière (30 derniers jours)
            Mouvement.aggregate([
                { $match: { date_mouvement: { $gte: startDate } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date_mouvement" } },
                        count: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: null,
                        avg: { $avg: "$count" }
                    }
                }
            ])
        ]);

        // Formatage des résultats
        const total = stats[0]?.totalCount?.count || 0;
        const byResult = stats[0]?.byResult || [];
        const byMethod = stats[0]?.byMethod || [];
        const dailyAvg = dailyStats[0]?.avg ? Math.round(dailyStats[0].avg) : 0;

        // Calcul des pourcentages
        const repartitionResultat = {
            succes: byResult.find(r => r._id === 'Succès')?.count || 0,
            failed: byResult.find(r => r._id === 'Failed')?.count || 0
        };

        const repartitionMethode = {
            badge: byMethod.find(m => m._id === 'Badge')?.count || 0,
            mobile: byMethod.find(m => m._id === 'Mobile')?.count || 0,
            biometrique: byMethod.find(m => m._id === 'Biométrique')?.count || 0
        };

        const tauxSucces = total > 0 
            ? ((repartitionResultat.succes / total) * 100).toFixed(1)
            : 0;

        res.json({
            success: true,
            data: {
                total,
                repartition_resultat_global: repartitionResultat,
                repartition_methode: repartitionMethode,
                taux_succes_global: parseFloat(tauxSucces),
                moyenne_journaliere: dailyAvg
            }
        });

    } catch (error) {
        console.error('Erreur récupération stats mouvements:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la récupération des statistiques'
        });
    }
};




// Fonction pour obtenir les statistiques d'accès par jour
const getAccessStatsByDay = async (req, res) => {
    try {
        // Calculer la date de début (il y a 30 jours)
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        
        // Agrégation pour compter les accès par jour et par résultat
        const stats = await Mouvement.aggregate([
            {
                $match: {
                    date_mouvement: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$date_mouvement" } },
                        result: "$resultat"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.date": 1 }
            }
        ]);

        // Formater les données pour le frontend
        const formattedData = formatStatsData(stats);
        
        res.json({
            success: true,
            data: formattedData
        });
    } catch (error) {
        console.error('Erreur récupération statistiques:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la récupération des statistiques'
        });
    }
};

// Fonction helper pour formater les données
function formatStatsData(rawData) {
    const result = {};
    
    rawData.forEach(item => {
        const date = item._id.date;
        const resultType = item._id.result;
        const count = item.count;
        
        if (!result[date]) {
            result[date] = {
                date: date,
                failed: 0,
                success: 0
            };
        }
        
        if (resultType === 'Failed') {
            result[date].failed = count;
        } else {
            result[date].success = count;
        }
    });
    
    // Convertir l'objet en tableau et trier par date
    return Object.values(result).sort((a, b) => new Date(a.date) - new Date(b.date));
}

const getTotalUsers = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ actif: true });
        const inactiveUsers = await User.countDocuments({ actif: false });

        res.json({
            success: true,
            data: {
                total: totalUsers,
                active: activeUsers,
                inactive: inactiveUsers
            }
        });
    } catch (error) {
        console.error('Erreur récupération nombre utilisateurs:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors du comptage des utilisateurs'
        });
    }
};



// Nouvelle fonction pour obtenir la répartition des privilèges
const getUserPrivilegeStats = async (req, res) => {
    try {
        const privilegeStats = await User.aggregate([
            {
                $group: {
                    _id: "$privilege",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Calcul du total
        const total = privilegeStats.reduce((sum, item) => sum + item.count, 0);

        // Formatage des données
        const repartition = {
            admin: privilegeStats.find(p => p._id === 'Admin')?.count || 0,
            filiale: privilegeStats.find(p => p._id === 'Filiale')?.count || 0,
            groupe: privilegeStats.find(p => p._id === 'Groupe')?.count || 0,
            gestion: privilegeStats.find(p => p._id === 'Gestion')?.count || 0
        };

        res.json({
            success: true,
            data: {
                total,
                repartition_privilege: repartition
            }
        });
    } catch (error) {
        console.error('Erreur récupération stats privilèges:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la récupération des statistiques des privilèges'
        });
    }
};

// Nouvelle fonction pour obtenir le top des utilisateurs avec le plus de mouvements
const getTopUsers = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 4; // Par défaut top 4
        
        const topUsers = await Mouvement.aggregate([
            {
                $group: {
                    _id: "$user",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            { $unwind: "$userDetails" },
            {
                $project: {
                    nom: { $concat: ["$userDetails.nom", " ", "$userDetails.prenom"] },
                    mouvements: "$count"
                }
            }
        ]);

        res.json({
            success: true,
            data: topUsers
        });
    } catch (error) {
        console.error('Erreur récupération top utilisateurs:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la récupération du top utilisateurs'
        });
    }
};

// N'oubliez pas d'ajouter ces fonctions à l'export:
module.exports = {
    getAccessStatsByDay,
    getTotalUsers,
    getMouvementStats,
    getUserPrivilegeStats,
    getTopUsers
};