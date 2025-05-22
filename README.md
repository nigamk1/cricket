# Multiplayer Cricket Game

A realistic desktop cricket game built with React, Electron, and Node.js, allowing two players to join a live match.

## Features

- Desktop application using Electron with React frontend
- Real-time multiplayer with Socket.IO
- Realistic cricket gameplay and physics
- 2D animations with Pixi.js
- User authentication and stat tracking
- MongoDB data persistence
- Match history and leaderboards

## Technology Stack

- **Frontend**: React, Electron, Material UI, Pixi.js
- **Backend**: Node.js, Express, Socket.IO
- **Database**: MongoDB
- **Authentication**: JWT

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB

### Setup

1. Clone the repository
   ```
   git clone <repository-url>
   cd cricket-game
   ```

2. Install server dependencies
   ```
   cd server
   npm install
   ```

3. Install client dependencies
   ```
   cd ../client
   npm install
   ```

4. Configure environment variables
   - Copy `.env.example` to `.env` in both client and server directories
   - Update the values as needed

5. Start MongoDB
   ```
   mongod
   ```

6. Run the server
   ```
   cd server
   npm run dev
   ```

7. Run the client
   ```
   cd client
   npm start
   ```

## Gameplay

### Game Rules
- Each match consists of two innings
- Each inning has a set number of overs
- Players take turns batting and bowling
- Batsman tries to score runs by hitting the ball
- Bowler tries to get the batsman out by hitting the wickets or forcing a catch

### Controls
- **Batting**:
  - Choose shot direction with arrow keys
  - Select shot power with spacebar
  - Time your shots for maximum effect

- **Bowling**:
  - Select bowling type (fast, spin, swing)
  - Choose direction and speed
  - Use variations to deceive the batsman

## Development

### Project Structure
```
client/                  # Electron/React frontend
  ├── public/            # Static assets
  ├── src/               # React source code
  │   ├── components/    # UI components
  │   ├── pages/         # Page components
  │   ├── game/          # Game engine (Pixi.js)
  │   └── utils/         # Utility functions
  └── package.json       # Frontend dependencies

server/                  # Node.js backend
  ├── config/            # Configuration files
  ├── controllers/       # Route controllers
  ├── models/            # Database models
  ├── routes/            # API routes
  ├── services/          # Business logic
  ├── utils/             # Utility functions
  └── package.json       # Backend dependencies
```

### Building for Production
```
cd client
npm run build
```

This will create a packaged Electron application in the `dist` directory.

## License

MIT License

## Acknowledgements

- Cricket game physics inspired by real cricket gameplay
- Icons and assets from various open-source projects
