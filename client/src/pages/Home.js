import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Container, Grid } from '@mui/material';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';

const Home = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    
    // Create a player object
    const player = {
      id: `player_${Date.now()}`,
      username: username.trim(),
      createdAt: new Date().toISOString()
    };
    
    // Call the login handler from props
    onLogin(player);
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          py: 4
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            borderRadius: 2,
            width: '100%',
            mb: 4
          }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              mb: 4
            }}
          >
            <SportsCricketIcon 
              color="primary" 
              sx={{ 
                fontSize: 60, 
                mb: 2 
              }} 
            />
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 'bold',
                textAlign: 'center'
              }}
            >
              Cricket Multiplayer
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 2,
                textAlign: 'center',
                color: 'text.secondary'
              }}
            >
              Experience the thrill of cricket in this multiplayer desktop game!
            </Typography>
          </Box>

          <form onSubmit={handleLogin}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Enter your username"
                  variant="outlined"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError(null);
                  }}
                  error={!!error}
                  helperText={error}
                  inputProps={{ maxLength: 15 }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button 
                  type="submit"
                  fullWidth 
                  variant="contained" 
                  color="primary" 
                  size="large"
                >
                  Enter Game
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ textAlign: 'center' }}
        >
          Play cricket with friends in this realistic multiplayer game.
          <br />
          Built with Electron, React, and Socket.IO.
        </Typography>
      </Box>
    </Container>
  );
};

export default Home;
