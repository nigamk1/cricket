@echo off
echo Setting up Cricket Game for deployment...

REM Rename the new render.yaml file to use it
echo Updating render configuration...
rename "render.yaml" "render.yaml.old"
rename "render.yaml.new" "render.yaml"

echo Creating necessary directories...
mkdir "server\client" 2>nul
mkdir "server\client\build" 2>nul

echo Building the client...
cd client
call npm install
call npm run react-build
cd ..

echo Setup completed successfully.
echo.
echo NEXT STEPS:
echo 1. Commit all changes to your git repository
echo 2. Login to your Render account (https://dashboard.render.com)
echo 3. Create a new Web Service:
echo    - Connect your repository
echo    - Choose the "Docker" environment
echo    - Set the required environment variables:
echo       MONGO_URI=Your_MongoDB_Connection_String
echo       JWT_SECRET=Your_Secure_Secret_String
echo 4. Deploy your application
echo.
echo Your application will be available at the URL provided by Render.
echo.
pause
