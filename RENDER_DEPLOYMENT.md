# Cricket Game Deployment Guide

This guide explains how to deploy your Cricket Game application to Render.com.

## Prerequisites

- A Render.com account (https://render.com)
- Git repository with your code
- MongoDB database (you can use MongoDB Atlas for free)

## Fixing the "Cannot GET /" Error

If you're seeing "Cannot GET /" on https://cricket-98nx.onrender.com/, the issue is likely due to one of the following:

1. The client files aren't being served correctly
2. The server isn't properly configured to serve the client files
3. The build process for the client isn't completing successfully

## Deployment Solution

We've created a simplified deployment solution that combines your frontend and backend into a single Docker container. This ensures that:

1. The React frontend is built correctly
2. The server is configured to serve the static files
3. All services run in a single container for simplicity

## Steps to Deploy

1. **Run the setup script**
   
   ```powershell
   .\setup_render.bat
   ```

   This script will:
   - Update your Render configuration to use a unified service
   - Build your client application
   - Prepare your project for deployment

2. **Commit all changes to your Git repository**

   ```powershell
   git add .
   git commit -m "Prepare for Render deployment"
   git push
   ```

3. **Create a new Web Service on Render**

   - Log in to your Render dashboard (https://dashboard.render.com)
   - Click "New" > "Web Service"
   - Connect your Git repository
   - Choose the "Docker" environment
   - Set the required environment variables:
     - `MONGO_URI` - Your MongoDB connection string
     - `JWT_SECRET` - A secure random string for JWT token signing

4. **Deploy your application**

   - Click "Create Web Service"
   - Render will build and deploy your application

5. **Access your application**

   Your application will be available at the URL provided by Render (e.g., https://cricket-98nx.onrender.com).

## Troubleshooting

If you still encounter issues:

1. **Check the Render logs**
   - Go to your Web Service on the Render dashboard
   - Click on "Logs" to see build and runtime logs

2. **Verify Docker build**
   - Test your Docker build locally:
     ```powershell
     docker build -t cricket-game .
     docker run -p 10000:10000 cricket-game
     ```
   - Access http://localhost:10000 to verify it works locally

3. **Inspect server configuration**
   - Make sure your server is correctly serving the static files
   - Check that the client build directory exists and contains the expected files

4. **Environment variables**
   - Ensure all required environment variables are set in the Render dashboard

## Local Development

For local development, you can continue to use:

```powershell
# Start the client
cd client
npm start

# Start the server (in a separate terminal)
cd server
npm run dev
```

## Additional Resources

- Render Documentation: https://render.com/docs
- MongoDB Atlas: https://www.mongodb.com/atlas/database
- Docker Documentation: https://docs.docker.com/
