@echo off
echo.
echo ===== CRICKET GAME RENDER DEPLOYMENT FIX =====
echo.
echo This script will help you fix the "Cannot GET /" error on Render.
echo.

echo 1. Updating the Dockerfile and server configuration...
echo.

echo 2. Copying the new render.yaml...
copy /Y "render.yaml.fix" "render.yaml" > nul
echo   render.yaml updated.

echo.
echo 3. Make sure to commit these changes to your repository:
echo.
echo   git add .
echo   git commit -m "Fix deployment issues with Render"
echo   git push
echo.
echo 4. Update your Render service:
echo   a. Go to https://dashboard.render.com
echo   b. Select your service
echo   c. Go to Settings
echo   d. Set the following environment variables:
echo      - PORT: 10000
echo      - NODE_ENV: production
echo      - MONGO_URI: [Your MongoDB connection string]
echo      - JWT_SECRET: [A secure random string]
echo   e. Click "Manual Deploy" and select "Clear build cache & deploy"
echo.
echo 5. Important: Check the logs after deployment to see the diagnostics output
echo.
echo ===== DEPLOYMENT FIX COMPLETE =====
echo.
pause
