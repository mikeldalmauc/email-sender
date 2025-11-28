FROM node:18-alpine

WORKDIR /app


# instalar dependencias
COPY package.json package-lock.json* ./

RUN npm install -g nodemon

RUN npm ci --silent || npm install --silent

# copiar código
COPY . .
ENV NODE_ENV=production
# ENV NODE_ENV=development
EXPOSE 3000

# CMD ["node", "src/index.js"]
CMD ["npm", "run", "dev"]