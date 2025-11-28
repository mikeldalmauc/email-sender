FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias primero (para aprovechar la caché de Docker)
COPY package.json ./

# Instalar dependencias (quitamos --silent para ver errores si los hay)
RUN npm install

# Instalar nodemon globalmente para desarrollo (opcional, pero útil)
RUN npm install -g nodemon

# Copiar el resto del código
COPY . .

# Exponer el puerto
EXPOSE 3000

# Comando por defecto
CMD ["node", "server.js"]