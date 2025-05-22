import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Paper, 
  Grid, 
  Divider, 
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import RefreshIcon from '@mui/icons-material/Refresh';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import PersonIcon from '@mui/icons-material/Person';
import { useSocket } from '../utils/socketContext';

const Lobby = ({ player, onLogout }) => {
  const navigate = useNavigate();
  const { socket, connected, error: socketError } = useSocket();
  const [activeRooms, setActiveRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  // Setup socket event listeners
  useEffect(() => {
    if (!socket) return;
    
    // Register player with server
    socket.emit('player:register', player);
    
    // Request active rooms
    socket.emit('rooms:list');
    setLoading(false);

    // Set up socket event listeners
    const handleRoomsList = (rooms) => {
      setActiveRooms(rooms);
    };

    const handleRoomCreated = (room) => {
      setNotification({
        open: true,
        message: `Room "${room.name}" created successfully!`,
        severity: 'success'
      });
      navigate(`/game/${room.id}`);
    };

    const handleRoomJoined = (room) => {
      setNotification({
        open: true,
        message: `Joined room "${room.name}" successfully!`,
        severity: 'success'
      });
      navigate(`/game/${room.id}`);
    };

    const handleRoomError = (errorMsg) => {
      setNotification({
        open: true,
        message: errorMsg,
        severity: 'error'
      });
    };

    // Register event listeners
    socket.on('rooms:list', handleRoomsList);
    socket.on('room:created', handleRoomCreated);
    socket.on('room:joined', handleRoomJoined);
    socket.on('room:error', handleRoomError);

    // Cleanup function - remove event listeners
    return () => {
      if (socket) {
        socket.off('rooms:list', handleRoomsList);
        socket.off('room:created', handleRoomCreated);
        socket.off('room:joined', handleRoomJoined);
        socket.off('room:error', handleRoomError);
      }
    };
  }, [socket, player, navigate]);

  // Handle refresh rooms list
  const handleRefreshRooms = () => {
    if (socket && connected) {
      socket.emit('rooms:list');
    }
  };

  // Handle joining a room
  const handleJoinRoom = (roomId) => {
    if (socket && connected) {
      socket.emit('room:join', { roomId, player });
    }
  };

  // Handle creating a new room
  const handleCreateRoom = (e) => {
    e.preventDefault();
    
    if (!newRoomName.trim()) {
      setError('Please enter a room name');
      return;
    }
    
    if (socket && connected) {
      socket.emit('room:create', { 
        name: newRoomName.trim(),
        host: player
      });
      setNewRoomName('');
    }
  };

  // Handle notification close
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Handle player logout
  const handleLogout = () => {
    onLogout();
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          pt: 4,
          pb: 8,
          minHeight: '100vh'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SportsCricketIcon color="primary" sx={{ fontSize: 36, mr: 1 }} />
            <Typography variant="h4" component="h1">
              Cricket Game Lobby
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
                <PersonIcon />
              </Avatar>
              <Typography variant="body1">{player?.username}</Typography>
            </Box>
            <Button 
              variant="outlined" 
              color="error" 
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" component="h2">
                  Active Game Rooms
                </Typography>
                <Button 
                  variant="text" 
                  startIcon={<RefreshIcon />}
                  onClick={handleRefreshRooms}
                  disabled={!connected}
                >
                  Refresh
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
              ) : activeRooms.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    No active game rooms found. Create a new room to start playing!
                  </Typography>
                </Box>
              ) : (
                <List>
                  {activeRooms.map((room) => (
                    <ListItem
                      key={room.id}
                      secondaryAction={
                        <Button 
                          variant="contained" 
                          size="small"
                          onClick={() => handleJoinRoom(room.id)}
                          disabled={!connected || room.players.length >= 2}
                        >
                          {room.players.length >= 2 ? 'Full' : 'Join'}
                        </Button>
                      }
                      sx={{ 
                        borderRadius: 1, 
                        mb: 1,
                        bgcolor: 'background.paper' 
                      }}
                    >
                      <ListItemIcon>
                        <SportsCricketIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={room.name} 
                        secondary={`Host: ${room.host.username} | Players: ${room.players.length}/2`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
                Create New Room
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <form onSubmit={handleCreateRoom}>
                <TextField
                  fullWidth
                  label="Room Name"
                  variant="outlined"
                  value={newRoomName}
                  onChange={(e) => {
                    setNewRoomName(e.target.value);
                    setError(null);
                  }}
                  error={!!error}
                  helperText={error}
                  disabled={!connected}
                  sx={{ mb: 2 }}
                />
                <Button 
                  type="submit"
                  fullWidth 
                  variant="contained" 
                  color="primary"
                  startIcon={<AddIcon />}
                  disabled={!connected}
                >
                  Create Room
                </Button>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      
      <Snackbar 
        open={notification.open} 
        autoHideDuration={5000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Lobby;