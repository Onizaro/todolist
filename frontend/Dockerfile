# Étape de build
FROM node:20 AS build

WORKDIR /app

# Copier les fichiers package.json et package-lock.json (pour la gestion des dépendances)
COPY package*.json ./
RUN npm install

# Copier le reste des fichiers et construire l'application
COPY . .
RUN npm run build

# Étape de production avec Nginx
FROM nginx:alpine

# Copier les fichiers build générés dans l'étape de build vers le répertoire public de Nginx
COPY --from=build /app/build /usr/share/nginx/html



# Copier la configuration Nginx personnalisée dans le bon répertoire
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
