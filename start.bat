@echo off
echo Starting Cricket Game...

echo Starting server...
start cmd /k "cd server && npm run dev"

echo Starting client...
timeout /t 5
start cmd /k "cd client && npm start"

echo Cricket Game running. Close this window to shut down servers when done.
