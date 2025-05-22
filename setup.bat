@echo off
echo Installing cricket game dependencies...

echo Installing server dependencies...
cd server
npm install bcryptjs jsonwebtoken express socket.io mongoose cors dotenv
npm install --save-dev nodemon

echo Installing client dependencies...
cd ../client
npm install @emotion/react @emotion/styled @mui/material @mui/icons-material pixi.js react react-dom react-router-dom socket.io-client electron electron-builder cross-env concurrently wait-on
npm install --save-dev @babel/core @babel/preset-env @babel/preset-react babel-loader css-loader electron-forge html-webpack-plugin style-loader webpack webpack-cli webpack-dev-server

echo Setup complete!
echo To start the development environment:
echo 1. Start the server: cd server && npm run dev
echo 2. Start the client: cd client && npm start
