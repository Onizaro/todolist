const { Sequelize, DataTypes } = require('sequelize');

// Crée une instance de Sequelize pour SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'tasks.db'  // Le fichier de base de données SQLite
});

// Définition du modèle Task
const Task = sequelize.define('Task', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    deadline: {
        type: DataTypes.DATE,
        allowNull: false
    },
    estimatedTime: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = { sequelize, Task };
