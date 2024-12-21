const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sequelize, Task } = require('./models/task');  // Importer sequelize et le modèle Task

const app = express();
const port = 5000;

const cors = require('cors');
app.use(cors());  // Permet à toutes les origines d'accéder à ton backend

app.use(bodyParser.json());

// Variables d'environnement
require('dotenv').config();

const username = process.env.USERNAME
const password = process.env.PASSWORD

// Exemple d'utilisateur pour la démonstration (à remplacer par une base de données réelle)
const users = [
    { id: 1, username: username, password: bcrypt.hashSync(password, 10) } // mot de passe hashé
];

// Fonction pour générer un token JWT
function generateAuthToken(user) {
    return jwt.sign({ id: user.id }, process.env.SECRET_KEY, { expiresIn: '1h' });
}

// Middleware d'authentification
function authMiddleware(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Accès refusé' });

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Token invalide' });
    }
}

// Route de connexion pour obtenir un token
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const user = users.find(u => u.username === username); // Recherche l'utilisateur par nom
    console.log("Utilisateur trouvé :", user);  // Ajout de log pour voir l'utilisateur trouvé

    if (!user) {
        console.log("Utilisateur non trouvé ");
        return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }

    if (!bcrypt.compareSync(password, user.password)) {
        console.log("mdp incorrect");
        return res.status(401).json({ error: 'Mot de passe incorrect' });
    }

    // Si les identifiants sont corrects, générer un token
    const token = generateAuthToken(user);
    console.log("Token généré :", token);  // Log pour vérifier le token généré
    res.json({ token });
});


// Route pour récupérer toutes les tâches (protéger avec JWT)
app.get('/tasks', authMiddleware, async (req, res) => {
    try {
        const tasks = await Task.findAll();  // Récupérer toutes les tâches
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching tasks' });
    }
});

// Route pour ajouter une nouvelle tâche (protéger avec JWT)
app.post('/tasks', authMiddleware, async (req, res) => {
    const { name, deadline, estimatedTime } = req.body;
    try {
        const newTask = await Task.create({ name, deadline, estimatedTime });
        res.status(201).json(newTask);
    } catch (error) {
        res.status(400).json({ error: 'Error creating task' });
    }
});

// Route pour supprimer une tâche par ID (protéger avec JWT)
app.delete('/tasks/:id', authMiddleware, async (req, res) => {
    const taskId = parseInt(req.params.id, 10); // Convertir l'ID en entier
    if (isNaN(taskId)) {
        return res.status(400).json({ error: 'Invalid task ID' });
    }

    try {
        const task = await Task.findByPk(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        await task.destroy();  // Supprimer la tâche
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting task' });
    }
});

// Synchroniser les modèles avec la base de données et démarrer le serveur
sequelize.sync().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
});
