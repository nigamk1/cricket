import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, Paper, Grid, Divider, CircularProgress, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSocket } from '../utils/socketContext';
import CricketGame from '../game/CricketGame';
import GameControls from '../components/GameControls';
import ScoreBoard from '../components/ScoreBoard';
import TossDialog from '../components/TossDialog';
import ResultsDialog from '../components/ResultsDialog';

const GameRoom = ({ player }) => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const gameContainerRef = useRef(null);
  const { socket, connected, error: socketError } = useSocket();
  const [game, setGame] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [showToss, setShowToss] = useState(false);
  const [tossWinner, setTossWinner] = useState(null);
  const [tossChoice, setTossChoice] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [gameResults, setGameResults] = useState(null);

  // Setup socket event listeners and join room
  useEffect(() => {
    if (!socket) return;

    // Register player with server
    socket.emit('player:register', player);
    
    // Join the specific room
    socket.emit('room:join', { roomId, player });

    // Set up event handlers
    const handleRoomJoined = (roomData) => {
      setRoom(roomData);
      setLoading(false);
    };

    const handleRoomError = (errorMsg) => {
      console.error('Room error:', errorMsg);
      setError(errorMsg);
      setLoading(false);
      
      // After a few seconds, redirect back to lobby
      setTimeout(() => {
        navigate('/lobby');
      }, 3000);
    };

    const handleRoomUpdated = (roomData) => {
      setRoom(roomData);
    };

    const handleGameToss = (tossData) => {
      setShowToss(true);
      setTossWinner(tossData.winner);
    };

    const handleGameTossResult = (tossResultData) => {
      setTossChoice(tossResultData.choice);
      setShowToss(false);
    };

    const handleGameStart = (initialGameState) => {
      setGameState(initialGameState);
    };

    const handleGameState = (newGameState) => {
      setGameState(newGameState);
    };

    const handleGameOver = (results) => {
      setGameResults(results);
      setShowResults(true);
    };

    // Register event listeners
    socket.on('room:joined', handleRoomJoined);
    socket.on('room:error', handleRoomError);
    socket.on('room:updated', handleRoomUpdated);
    socket.on('game:toss', handleGameToss);
    socket.on('game:toss_result', handleGameTossResult);
    socket.on('game:start', handleGameStart);
    socket.on('game:state', handleGameState);
    socket.on('game:over', handleGameOver);

    // Cleanup function - remove event listeners
    return () => {
      if (socket) {
        socket.off('room:joined', handleRoomJoined);
        socket.off('room:error', handleRoomError);
        socket.off('room:updated', handleRoomUpdated);
        socket.off('game:toss', handleGameToss);
        socket.off('game:toss_result', handleGameTossResult);
        socket.off('game:start', handleGameStart);
        socket.off('game:state', handleGameState);
        socket.off('game:over', handleGameOver);
      }
    };
  }, [socket, roomId, player, navigate]);

  // Initialize the game when the container is ready and we have game state
  useEffect(() => {
    if (gameContainerRef.current && gameState && !game) {
      const newGame = new CricketGame({
        container: gameContainerRef.current,
        onGameEvent: handleGameEvent
      });
      
      setGame(newGame);
    }
  }, [gameContainerRef, gameState, game]);

  // Update the game when game state changes
  useEffect(() => {
    if (game && gameState) {
      game.updateGameState(gameState);
    }
  }, [game, gameState]);

  // Handle game events from the game engine
  const handleGameEvent = (event) => {
    if (socket && connected) {
      socket.emit('game:event', event);
    }
  };

  // Handle toss choice (bat or bowl)
  const handleTossChoice = (choice) => {
    if (socket && connected) {
      socket.emit('game:toss_choice', { choice });
    }
  };

  // Handle game action (batting shot or bowling delivery)
  const handleGameAction = (action) => {
    if (socket && connected) {
      socket.emit('game:action', action);
    }
  };

  // Handle return to lobby
  const handleReturnToLobby = () => {
    navigate('/lobby');
  };

  // Render the component
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          pt: 2,
          pb: 4,
          minHeight: '100vh'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />}
            onClick={handleReturnToLobby}
          >
            Back to Lobby
          </Button>
          <Typography variant="h4" component="h1">
            {room ? room.name : 'Game Room'}
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>
        ) : (
          <>
            {gameState ? (
              <Grid container spacing={3}>
                <Grid item xs={12} md={9}>
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      width: '100%', 
                      aspectRatio: '16/9',
                      overflow: 'hidden',
                      position: 'relative',
                      mb: 2
                    }}
                    ref={gameContainerRef}
                  />
                  <GameControls 
                    gameState={gameState} 
                    player={player} 
                    onAction={handleGameAction}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <ScoreBoard gameState={gameState} />
                </Grid>
              </Grid>
            ) : (
              <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                  Waiting for the game to start...
                </Typography>
                <Typography variant="body1">
                  {room && room.players.length < 2 
                    ? 'Waiting for another player to join.' 
                    : 'The game is being prepared...'}
                </Typography>
              </Paper>
            )}
          </>
        )}
      </Box>

      {/* Toss Dialog */}
      <TossDialog 
        open={showToss} 
        winner={tossWinner}
        isWinner={tossWinner?.id === player.id}
        onChoice={handleTossChoice}
      />

      {/* Results Dialog */}
      <ResultsDialog 
        open={showResults}
        results={gameResults}
        player={player}
        onClose={() => setShowResults(false)}
        onReturnToLobby={handleReturnToLobby}
      />
    </Container>
  );
};

export default GameRoom;
