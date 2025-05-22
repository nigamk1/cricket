// Room service for managing game rooms

// Generate a unique room ID
const generateRoomId = () => {
  return `room_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
};

// Create a new room
const createRoom = (data, activeRooms) => {
  const { name, host } = data;
  
  if (!name || !host) {
    throw new Error('Room name and host are required');
  }
  
  // Check if host is already in a room
  const existingRoom = findPlayerRoom(host.id, activeRooms);
  if (existingRoom) {
    throw new Error('Player is already in a room');
  }
  
  const roomId = generateRoomId();
  const room = {
    id: roomId,
    name: name,
    host: host,
    players: [host],
    createdAt: new Date().toISOString(),
    gameState: null
  };
  
  activeRooms.set(roomId, room);
  console.log('Room created:', roomId);
  console.log('Active rooms:', Array.from(activeRooms.keys()));
  
  return room;
};

// Get all active rooms
const getRoomsList = (activeRooms) => {
  return Array.from(activeRooms.values()).map(room => ({
    id: room.id,
    name: room.name,
    host: room.host,
    players: room.players,
    createdAt: room.createdAt
  }));
};

// Find a room by ID
const getRoom = (roomId, activeRooms) => {
  console.log(`Getting room with ID: ${roomId}`);
  console.log(`Available rooms: ${Array.from(activeRooms.keys())}`);
  
  const room = activeRooms.get(roomId);
  
  if (!room) {
    throw new Error('Room not found');
  }
  
  return room;
};

// Join a room
const joinRoom = (roomId, player, activeRooms) => {
  console.log('Attempting to join room:', roomId);
  console.log('Available rooms:', Array.from(activeRooms.keys()));
  
  const room = activeRooms.get(roomId);
  
  if (!room) {
    throw new Error('Room not found');
  }
  
  // Check if player is already in a room
  const existingRoomId = findPlayerRoom(player.id, activeRooms);
  if (existingRoomId && existingRoomId !== roomId) {
    throw new Error('Player is already in another room');
  }
  
  // Check if player is already in this room
  const isPlayerInRoom = room.players.some(p => p.id === player.id);
  
  if (isPlayerInRoom) {
    return room; // Player is already in the room, just return it
  }
  
  // Check if room is full
  if (room.players.length >= 2) {
    throw new Error('Room is full');
  }
  
  // Add player to the room
  room.players.push(player);
  
  return room;
};

// Leave a room
const leaveRoom = (roomId, playerId, activeRooms) => {
  const room = activeRooms.get(roomId);
  
  if (!room) {
    return;
  }
  
  // Remove player from the room
  room.players = room.players.filter(p => p.id !== playerId);
  
  // If the room is empty, remove it
  if (room.players.length === 0) {
    activeRooms.delete(roomId);
    return null;
  }
  
  // If the host left, assign a new host
  if (room.host.id === playerId && room.players.length > 0) {
    room.host = room.players[0];
  }
  
  return room;
};

// Find a room that a player is in
const findPlayerRoom = (playerId, activeRooms) => {
  for (const [roomId, room] of activeRooms.entries()) {
    if (room.players.some(p => p.id === playerId)) {
      return roomId;
    }
  }
  
  return null;
};

// Reset a room for a new game
const resetRoom = (roomId, activeRooms) => {
  const room = activeRooms.get(roomId);
  
  if (room) {
    room.gameState = null;
  }
  
  return room;
};

// Update room settings
const updateRoomSettings = (roomId, settings, activeRooms) => {
  const room = activeRooms.get(roomId);
  
  if (!room) {
    throw new Error('Room not found');
  }
  
  // Update only valid settings
  if (settings) {
    // Game settings like overs, difficulty, etc.
    room.settings = {
      ...room.settings || {},
      ...settings
    };
  }
  
  return room;
};

// Set player ready status
const setPlayerReady = (roomId, playerId, isReady, activeRooms) => {
  const room = activeRooms.get(roomId);
  
  if (!room) {
    throw new Error('Room not found');
  }
  
  // Find the player
  const playerIndex = room.players.findIndex(p => p.id === playerId);
  
  if (playerIndex === -1) {
    throw new Error('Player not in room');
  }
  
  // Update the player's ready status
  if (!room.players[playerIndex].status) {
    room.players[playerIndex].status = {};
  }
  
  room.players[playerIndex].status.ready = isReady;
  
  // Check if all players are ready
  const allPlayersReady = room.players.length === 2 && 
                         room.players.every(p => p.status && p.status.ready);
  
  return {
    room,
    allPlayersReady
  };
};

// Handle player reconnection
const handlePlayerReconnection = (roomId, player, activeRooms) => {
  const room = activeRooms.get(roomId);
  
  if (!room) {
    throw new Error('Room not found');
  }
  
  // Find the player
  const playerIndex = room.players.findIndex(p => p.id === player.id);
  
  if (playerIndex === -1) {
    throw new Error('Player not in room');
  }
  
  // Update player connection status
  room.players[playerIndex].connected = true;
  room.players[playerIndex].socketId = player.socketId;
  
  return room;
};

// Handle player disconnect
const handlePlayerDisconnect = (socketId, activeRooms, activePlayers) => {
  // Find player by socket ID
  let playerId = null;
  
  for (const [id, player] of activePlayers.entries()) {
    if (player.socketId === socketId) {
      playerId = id;
      break;
    }
  }
  
  if (!playerId) return null;
  
  // Find room containing the player
  const roomId = findPlayerRoom(playerId, activeRooms);
  if (!roomId) return null;
  
  const room = activeRooms.get(roomId);
  
  // Update player connection status instead of removing immediately
  const playerIndex = room.players.findIndex(p => p.id === playerId);
  
  if (playerIndex !== -1) {
    room.players[playerIndex].connected = false;
    room.players[playerIndex].disconnectedAt = new Date().toISOString();
  }
  
  // If game is in progress, set a timeout to remove the player if they don't reconnect
  if (room.gameState && room.gameState.status === 'playing') {
    room.disconnectTimeout = setTimeout(() => {
      // Only remove if still disconnected after timeout
      if (room.players[playerIndex] && !room.players[playerIndex].connected) {
        leaveRoom(roomId, playerId, activeRooms);
      }
    }, 60000); // 1 minute to reconnect
  } else {
    // If game hasn't started, remove after shorter timeout
    room.disconnectTimeout = setTimeout(() => {
      if (room.players[playerIndex] && !room.players[playerIndex].connected) {
        leaveRoom(roomId, playerId, activeRooms);
      }
    }, 30000); // 30 seconds to reconnect
  }
  
  return room;
};

// Get room status
const getRoomStatus = (roomId, activeRooms) => {
  const room = activeRooms.get(roomId);
  
  if (!room) {
    throw new Error('Room not found');
  }
  
  // Determine room status
  let status = 'waiting';
  
  if (room.players.length === 2) {
    status = 'ready';
    
    // Check if all players are ready
    if (room.players.every(p => p.status && p.status.ready)) {
      status = 'all_ready';
    }
    
    // Check if game is in progress
    if (room.gameState && room.gameState.status === 'playing') {
      status = 'playing';
    }
  }
  
  return {
    roomId: room.id,
    name: room.name,
    host: room.host,
    players: room.players,
    status,
    settings: room.settings,
    gameState: room.gameState ? {
      status: room.gameState.status,
      inning: room.gameState.inning,
      tossWinner: room.gameState.tossWinner,
      tossChoice: room.gameState.tossChoice
    } : null
  };
};

module.exports = {
  createRoom,
  getRoomsList,
  getRoom,
  joinRoom,
  leaveRoom,
  findPlayerRoom,
  resetRoom,
  updateRoomSettings,
  setPlayerReady,
  handlePlayerReconnection,
  handlePlayerDisconnect,
  getRoomStatus
};
