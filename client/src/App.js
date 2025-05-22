import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Pages
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import GameRoom from './pages/GameRoom';
import NotFound from './pages/NotFound';

// Socket Provider
import { SocketProvider } from './utils/socketContext';

// Create dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4caf50', // Green for cricket
    },
    secondary: {
      main: '#2196f3', // Blue
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif",
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
        },
      },
    },
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    // Check if there's a player saved in localStorage
    const savedPlayer = localStorage.getItem('cricketPlayer');
    if (savedPlayer) {
      try {
        const playerData = JSON.parse(savedPlayer);
        setPlayer(playerData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing player data:', error);
        localStorage.removeItem('cricketPlayer');
      }
    }
  }, []);

  // Function to handle player login/registration
  const handleAuthentication = (playerData) => {
    setPlayer(playerData);
    setIsAuthenticated(true);
    localStorage.setItem('cricketPlayer', JSON.stringify(playerData));
  };

  // Function to handle player logout
  const handleLogout = () => {
    setPlayer(null);
    setIsAuthenticated(false);
    localStorage.removeItem('cricketPlayer');
  };
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <SocketProvider>
        <Routes>
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
                <Navigate to="/lobby" replace /> : 
                <Home onLogin={handleAuthentication} />
            } 
          />
          <Route 
            path="/lobby" 
            element={
              isAuthenticated ? 
                <Lobby player={player} onLogout={handleLogout} /> : 
                <Navigate to="/" replace />
            } 
          />
          <Route 
            path="/game/:roomId" 
            element={
              isAuthenticated ? 
                <GameRoom player={player} /> : 
                <Navigate to="/" replace />
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SocketProvider>
    </ThemeProvider>
  );
}

export default App;
