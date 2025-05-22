# Cricket Game Server Dockerfile
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files and install server dependencies
COPY server/package*.json ./
RUN npm install

# Copy server code
COPY server/ ./

# Expose server port
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
