const express = require('express');
const bodyParser = require('body-parser');
const { sequelize, Task } = require('./models/task');  // Importer sequelize et le modèle Task

const app = express();
const port = 5000;

const cors = require('cors');
app.use(cors());  // Permet à toutes les origines d'accéder à ton backend

app.use(bodyParser.json());

// Route pour récupérer toutes les tâches
app.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.findAll();  // Récupérer toutes les tâches
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching tasks' });
    }
});

// Route pour ajouter une nouvelle tâche
app.post('/tasks', async (req, res) => {
    const { name, deadline, estimatedTime } = req.body;
    try {
        const newTask = await Task.create({ name, deadline, estimatedTime });
        res.status(201).json(newTask);
    } catch (error) {
        res.status(400).json({ error: 'Error creating task' });
    }
});

// Route pour supprimer une tâche par ID
app.delete('/tasks/:id', async (req, res) => {
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
