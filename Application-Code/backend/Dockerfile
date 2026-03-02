FROM node:18-alpine

WORKDIR /app

# Install dependencies first (layer caching)
COPY package*.json ./
RUN npm install --only=production

# Copy source
COPY . .

EXPOSE 5000

USER node

CMD ["node", "server.js"]
