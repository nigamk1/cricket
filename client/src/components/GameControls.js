import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, Divider, Paper } from '@mui/material';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import SportsIcon from '@mui/icons-material/Sports';

const GameControls = ({ gameState, player, onAction }) => {
  const [isBatting, setIsBatting] = useState(false);
  const [isBowling, setIsBowling] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  // Determine the player's role based on the game state
  useEffect(() => {
    if (gameState) {
      const isCurrentBatsman = gameState.currentBatsman?.id === player.id;
      const isCurrentBowler = gameState.currentBowler?.id === player.id;
      
      setIsBatting(isCurrentBatsman);
      setIsBowling(isCurrentBowler);
      
      // Reset action state when it's the player's turn
      if (isCurrentBatsman || isCurrentBowler) {
        setActionInProgress(false);
      }
      
      // Set countdown when waiting for action
      if (gameState.countdown) {
        setCountdown(gameState.countdown);
      } else {
        setCountdown(null);
      }
    }
  }, [gameState, player]);

  // Handle batting shot selection
  const handleBatShot = (shotType) => {
    if (isBatting && !actionInProgress) {
      setActionInProgress(true);
      onAction({
        type: 'bat',
        shotType
      });
    }
  };

  // Handle bowling action
  const handleBowlBall = (bowlType) => {
    if (isBowling && !actionInProgress) {
      setActionInProgress(true);
      onAction({
        type: 'bowl',
        bowlType
      });
    }
  };

  // Render batting controls when player is batting
  const renderBattingControls = () => {
    const battingShots = [
      { type: 'defensive', label: 'Defensive' },
      { type: 'drive', label: 'Drive' },
      { type: 'cut', label: 'Cut' },
      { type: 'pull', label: 'Pull' },
      { type: 'sweep', label: 'Sweep' },
      { type: 'loft', label: 'Loft' }
    ];

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          <SportsCricketIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Batting Controls
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={1}>
          {battingShots.map((shot) => (
            <Grid item xs={6} sm={4} key={shot.type}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => handleBatShot(shot.type)}
                disabled={actionInProgress}
                sx={{
                  borderRadius: 2,
                  py: 1
                }}
              >
                {shot.label}
              </Button>
            </Grid>
          ))}
        </Grid>
        
        {actionInProgress && (
          <Typography 
            variant="body2" 
            sx={{ textAlign: 'center', mt: 2, color: 'text.secondary' }}
          >
            Shot played, waiting for the ball...
          </Typography>
        )}
      </Box>
    );
  };

  // Render bowling controls when player is bowling
  const renderBowlingControls = () => {
    const bowlingTypes = [
      { type: 'fast', label: 'Fast Ball' },
      { type: 'swing', label: 'Swing' },
      { type: 'spin', label: 'Spin' },
      { type: 'yorker', label: 'Yorker' },
      { type: 'bouncer', label: 'Bouncer' },
      { type: 'slower', label: 'Slower Ball' }
    ];

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          <SportsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Bowling Controls
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={1}>
          {bowlingTypes.map((bowl) => (
            <Grid item xs={6} sm={4} key={bowl.type}>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                onClick={() => handleBowlBall(bowl.type)}
                disabled={actionInProgress}
                sx={{
                  borderRadius: 2,
                  py: 1
                }}
              >
                {bowl.label}
              </Button>
            </Grid>
          ))}
        </Grid>
        
        {actionInProgress && (
          <Typography 
            variant="body2" 
            sx={{ textAlign: 'center', mt: 2, color: 'text.secondary' }}
          >
            Ball delivered, waiting for the batsman...
          </Typography>
        )}
      </Box>
    );
  };

  // Render waiting message when it's not the player's turn
  const renderWaitingState = () => {
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="body1">
          {gameState && gameState.currentInnings
            ? gameState.currentBatsman?.id === player.id
              ? "It's your turn to bat!"
              : gameState.currentBowler?.id === player.id
                ? "It's your turn to bowl!"
                : "Waiting for other players to take action..."
            : "Waiting for the game to start..."}
        </Typography>
        
        {countdown && (
          <Paper 
            elevation={3}
            sx={{ 
              display: 'inline-block', 
              p: 2, 
              mt: 2,
              bgcolor: 'warning.dark',
              borderRadius: 2
            }}
          >
            <Typography variant="h5">
              Time remaining: {countdown}s
            </Typography>
          </Paper>
        )}
      </Box>
    );
  };

  // Render game state before the match starts
  const renderPreMatchState = () => {
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="body1">
          Waiting for match to begin...
        </Typography>
      </Box>
    );
  };

  return (
    <Box>
      {!gameState || !gameState.currentInnings ? (
        renderPreMatchState()
      ) : isBatting ? (
        renderBattingControls()
      ) : isBowling ? (
        renderBowlingControls()
      ) : (
        renderWaitingState()
      )}
    </Box>
  );
};

export default GameControls;
