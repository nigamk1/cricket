require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import routes and services
const roomService = require('./services/roomService');
const gameService = require('./services/gameService');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Create Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/games', require('./routes/gameRoutes'));

// Health check endpoint for Render
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handler
app.use(errorHandler);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set correct path for production build
  const clientBuildPath = path.join(__dirname, '../client/build');
  
  // Serve static files
  app.use(express.static(clientBuildPath));
  
  // For any other route, serve the index.html
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(clientBuildPath, 'index.html'));
  });
  
  console.log('Serving static files from:', clientBuildPath);
}

// Active players and rooms
const activePlayers = new Map();
const activeRooms = new Map();

// Socket.IO connection handlers
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);
  
  // Handle player registration
  socket.on('player:register', (player) => {
    if (player && player.id) {
      // Add to active players
      activePlayers.set(player.id, {
        ...player,
        socketId: socket.id
      });
      
      // Associate socket with player ID
      socket.playerId = player.id;
      
      console.log(`Player registered: ${player.username} (${player.id})`);
      console.log(`Current active rooms: ${Array.from(activeRooms.keys())}`);
    }
  });
  
  // Handle room listing
  socket.on('rooms:list', () => {
    const roomsList = roomService.getRoomsList(activeRooms);
    socket.emit('rooms:list', roomsList);
  });
  
  // Handle room creation
  socket.on('room:create', (data) => {
    try {
      const room = roomService.createRoom(data, activeRooms);
      
      // Join the socket to the room
      socket.join(room.id);
      
      // Emit room created event to the creator
      socket.emit('room:created', room);
      
      // Broadcast updated room list to all clients
      io.emit('rooms:list', roomService.getRoomsList(activeRooms));
      
      console.log(`Room created: ${room.name} (${room.id}) by ${data.host.username}`);
    } catch (error) {
      console.error('Error creating room:', error.message);
      socket.emit('room:error', error.message);
    }
  });
  
  // Handle room joining
  socket.on('room:join', (data) => {
    try {
      const { roomId, player } = data;
      
      if (!roomId || !player) {
        throw new Error('Invalid room join request');
      }
      
      // Join the room
      const room = roomService.joinRoom(roomId, player, activeRooms);
      
      // Join the socket to the room
      socket.join(roomId);
      
      // Emit room joined event to the player
      socket.emit('room:joined', room);
      
      // Broadcast updated room to all clients in the room
      io.to(roomId).emit('room:updated', room);
      
      // If room is full (2 players), init the game
      if (room.players.length >= 2) {
        // Broadcast updated room list to all clients
        io.emit('rooms:list', roomService.getRoomsList(activeRooms));
      }
      
      console.log(`Player ${player.username} joined room: ${room.name} (${room.id})`);
    } catch (error) {
      console.error('Error joining room:', error.message);
      socket.emit('room:error', error.message);
    }
  });
  
  // Handle toss request
  socket.on('game:toss_request', () => {
    try {
      if (!socket.playerId) {
        throw new Error('Player not registered');
      }
      
      // Find the room the player is in
      const roomId = roomService.findPlayerRoom(socket.playerId, activeRooms);
      
      if (!roomId) {
        throw new Error('Player not in a room');
      }
      
      const room = activeRooms.get(roomId);
      
      // Perform the toss
      const tossResult = gameService.performToss(room);
      
      // Broadcast toss result to all players in the room
      io.to(roomId).emit('game:toss', tossResult);
      
      console.log(`Toss performed in room ${roomId}. Winner: ${tossResult.winner.username}`);
    } catch (error) {
      console.error('Error processing toss request:', error.message);
      socket.emit('game:error', error.message);
    }
  });
  
  // Handle toss choice
  socket.on('game:toss_choice', (data) => {
    try {
      if (!socket.playerId) {
        throw new Error('Player not registered');
      }
      
      // Find the room the player is in
      const roomId = roomService.findPlayerRoom(socket.playerId, activeRooms);
      
      if (!roomId) {
        throw new Error('Player not in a room');
      }
      
      const room = activeRooms.get(roomId);
      
      // Process the toss choice
      const gameInitData = gameService.processTossChoice(room, socket.playerId, data.choice);
      
      // Broadcast toss result to all players in the room
      io.to(roomId).emit('game:toss_result', {
        choice: data.choice,
        batting: gameInitData.battingTeam,
        bowling: gameInitData.bowlingTeam
      });
      
      // Start the game after a short delay
      setTimeout(() => {
        // Initialize game state
        const gameState = gameService.initializeGame(room, gameInitData);
        
        // Store the game state in the room
        room.gameState = gameState;
        
        // Broadcast game start event to all players in the room
        io.to(roomId).emit('game:start', gameState);
        
        console.log(`Game started in room ${roomId}`);
      }, 2000);
      
      console.log(`Toss choice made in room ${roomId}: ${data.choice}`);
    } catch (error) {
      console.error('Error processing toss choice:', error.message);
      socket.emit('game:error', error.message);
    }
  });
  
  // Handle game actions (batting and bowling)
  socket.on('game:action', (action) => {
    try {
      if (!socket.playerId) {
        throw new Error('Player not registered');
      }
      
      // Find the room the player is in
      const roomId = roomService.findPlayerRoom(socket.playerId, activeRooms);
      
      if (!roomId) {
        throw new Error('Player not in a room');
      }
      
      const room = activeRooms.get(roomId);
      
      if (!room.gameState) {
        throw new Error('Game not initialized');
      }
      
      // Process the game action
      const updatedGameState = gameService.processGameAction(room.gameState, socket.playerId, action);
      
      // Update the room's game state
      room.gameState = updatedGameState;
      
      // Broadcast updated game state to all players in the room
      io.to(roomId).emit('game:state', updatedGameState);
      
      // Check if the game is over
      if (updatedGameState.matchOver) {
        // Generate results
        const results = gameService.generateMatchResults(updatedGameState);
        
        // Broadcast game over event to all players in the room
        io.to(roomId).emit('game:over', results);
        
        console.log(`Game over in room ${roomId}`);
        
        // Reset room for a new game or close it
        // roomService.resetRoom(roomId, activeRooms);
      }
      
      console.log(`Game action in room ${roomId}: ${action.type}`);
    } catch (error) {
      console.error('Error processing game action:', error.message);
      socket.emit('game:error', error.message);
    }
  });
  
  // Handle game events
  socket.on('game:event', (event) => {
    try {
      if (!socket.playerId) {
        throw new Error('Player not registered');
      }
      
      // Find the room the player is in
      const roomId = roomService.findPlayerRoom(socket.playerId, activeRooms);
      
      if (!roomId) {
        throw new Error('Player not in a room');
      }
      
      // Process the game event if needed
      
      console.log(`Game event in room ${roomId}: ${event.type}`);
    } catch (error) {
      console.error('Error processing game event:', error.message);
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    try {
      console.log(`Client disconnected: ${socket.id}`);
      
      if (socket.playerId) {
        // Remove from active players
        activePlayers.delete(socket.playerId);
        
        // Find rooms the player is in
        const roomId = roomService.findPlayerRoom(socket.playerId, activeRooms);
        
        if (roomId) {
          const room = activeRooms.get(roomId);
          
          // Remove player from the room
          roomService.leaveRoom(roomId, socket.playerId, activeRooms);
          
          // Notify remaining players in the room
          io.to(roomId).emit('player:left', {
            playerId: socket.playerId,
            roomClosed: room.players.length === 0
          });
          
          // Broadcast updated room list to all clients
          io.emit('rooms:list', roomService.getRoomsList(activeRooms));
          
          console.log(`Player ${socket.playerId} left room: ${roomId}`);
        }
      }
    } catch (error) {
      console.error('Error handling disconnection:', error.message);
    }
  });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});
