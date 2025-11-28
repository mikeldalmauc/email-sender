FROM node:18-alpine
WORKDIR /app


# instalar dependencias
COPY package.json package-lock.json* ./
RUN npm ci --silent || npm install --silent


# copiar código
COPY . .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "index.js"]