@echo off
echo Preparing to deploy Cricket Game to Render...

REM Create a directory structure for the client build
if not exist client\build mkdir client\build
if not exist client\nginx mkdir client\nginx

REM Copy the nginx config if it doesn't exist
if not exist client\nginx\nginx.conf (
  echo Creating nginx configuration...
  copy "%~dp0client\nginx\nginx.conf" "%~dp0client\nginx\nginx.conf" > nul
)

echo Building the client application...
cd client
call npm install
call npm run react-build
cd ..

echo Build completed.
echo.
echo DEPLOYMENT INSTRUCTIONS:
echo 1. Make sure you have an account on Render.com
echo 2. Create a new Web Service using your Git repository
echo 3. Choose "Docker" as the environment
echo 4. Set the following environment variables for the API service:
echo    - MONGO_URI: Your MongoDB connection string
echo    - JWT_SECRET: A secure random string for JWT token signing
echo    - NODE_ENV: production
echo 5. Deploy your application
echo.
echo After deployment, your application should be accessible from:
echo - API: https://cricket-game-api.onrender.com
echo - Client: https://cricket-game-client.onrender.com
echo.
echo If you still see "Cannot GET /" error, check the deployment logs on Render.
echo.
pause
