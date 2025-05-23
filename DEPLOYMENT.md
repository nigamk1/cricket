# Cricket Game Deployment on Render

This document provides instructions for deploying the Cricket Game application to Render.

## Prerequisites

- A Render account (https://render.com)
- Git repository with your code (GitHub, GitLab, etc.)

## Deployment Steps

### 1. Push your code to a Git repository

Make sure your code is pushed to a Git repository (GitHub, GitLab, etc.).

### 2. Set up your project on Render

1. Log in to your Render dashboard at https://dashboard.render.com
2. Click on "New" and select "Blueprint" 
3. Connect your Git repository
4. Select the repository that contains your Cricket Game project
5. Render will detect the `render.yaml` file and automatically set up your services
6. Configure environment variables:
   - For the API service:
     - `MONGO_URI`: Your MongoDB connection string
     - `JWT_SECRET`: A secure random string for JWT token signing

### 3. Deploy your services

1. Click "Apply" to create the services defined in your blueprint
2. Render will automatically build and deploy your services

### 4. Verify deployment

1. Once deployment is complete, click on each service to view its URL
2. Verify that both the API and client application are working correctly

## Environment Variables

### Server Environment Variables

- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for signing JWT tokens
- `NODE_ENV`: Set to "production" for production deployment
- `PORT`: The port for the server (defaults to 10000 on Render)

### Client Environment Variables

- `REACT_APP_API_URL`: URL of the backend API service
- `REACT_APP_SOCKET_URL`: URL for WebSocket connections (same as API URL)

## Troubleshooting

If you encounter issues with the deployment, check the logs in the Render dashboard for each service.

Common issues:
- MongoDB connection failures: Verify your MongoDB URI is correct
- Build failures: Check that all dependencies are properly defined in package.json
- Socket connection issues: Ensure CORS is properly configured

### MongoDB Connection Notes

The project uses Mongoose version 8.x which has deprecated the following connection options:
- `useNewUrlParser` - No longer needed since MongoDB Driver 4.0.0
- `useUnifiedTopology` - No longer needed since MongoDB Driver 4.0.0

These options have been removed from the connection code to prevent warnings.

## Local Development vs Production

When developing locally, use:
```
npm run dev
```

Production on Render uses:
```
npm start
```

The application automatically serves the React frontend in production mode.
