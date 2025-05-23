# Cricket Game Full-Stack Dockerfile
FROM node:18-alpine as client-build

# Set working directory for client
WORKDIR /app/client

# Copy client package.json and install dependencies
COPY client/package.json ./
RUN npm install

# Copy client source files
COPY client/ ./

# Build React app
RUN npm run react-build

FROM node:18-alpine

# Set working directory for server
WORKDIR /app

# Copy server package.json and install dependencies
COPY server/package.json ./
RUN npm install --production

# Copy server source files
COPY server/ ./

# Create client build directory
RUN mkdir -p /app/client/build

# Copy client build to server's static folder
COPY --from=client-build /app/client/build /app/client/build

# Set environment variables
ENV NODE_ENV=production
ENV PORT=10000

# Expose server port
EXPOSE 10000

# Start the server
CMD ["npm", "start"]
