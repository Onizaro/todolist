# Dockerfile du backend
FROM node:18

# Crée un répertoire pour l'application
WORKDIR /app

# Copie les fichiers de l'application dans le conteneur
COPY package*.json ./

# Installe les dépendances
RUN npm install

# Recompiler sqlite3 dans le conteneur
RUN npm rebuild sqlite3

# Copie le reste de l'application dans le conteneur
COPY . .

# Expose le port de l'API
EXPOSE 5000

# Lancer l'application
CMD ["npm", "start"]
