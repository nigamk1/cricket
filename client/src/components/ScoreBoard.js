import React from 'react';
import { Box, Typography, Divider, Paper, Grid, Chip } from '@mui/material';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';

const ScoreBoard = ({ gameState, room, player }) => {
  if (!gameState) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Scoreboard
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
          Waiting for match to begin...
        </Typography>
      </Box>
    );
  }

  const { 
    team1, 
    team2, 
    currentInnings, 
    innings1Score,
    innings2Score,
    currentBatsman,
    currentBowler,
    currentOver,
    currentBall,
    totalOvers,
    recentBalls,
    matchStatus
  } = gameState;

  // Get current batting team and score
  const battingTeam = currentInnings === 1 ? team1 : team2;
  const currentScore = currentInnings === 1 ? innings1Score : innings2Score;
  const targetScore = currentInnings === 2 ? innings1Score.runs + 1 : null;
  
  // Format the current score
  const formattedScore = `${currentScore.runs}/${currentScore.wickets}`;
  
  // Format the current over
  const formattedOver = `${currentOver}.${currentBall}/${totalOvers}`;
  
  // Calculate required runs in 2nd innings
  const requiredRuns = currentInnings === 2
    ? targetScore - currentScore.runs
    : null;
  
  // Calculate required run rate
  const remainingBalls = (totalOvers * 6) - ((currentOver * 6) + currentBall);
  const requiredRunRate = currentInnings === 2 && remainingBalls > 0
    ? (requiredRuns / (remainingBalls / 6)).toFixed(2)
    : null;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        <SportsCricketIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Scoreboard
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      {/* Current Innings */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 1.5, 
          mb: 2, 
          bgcolor: 'background.paper',
          borderRadius: 1
        }}
      >
        <Typography variant="subtitle2" color="text.secondary">
          {currentInnings === 1 ? 'First Innings' : 'Second Innings'}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            {battingTeam.name}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            {formattedScore}
          </Typography>
        </Box>
        <Typography variant="body2">
          Overs: {formattedOver}
        </Typography>
        
        {/* Target in 2nd innings */}
        {currentInnings === 2 && (
          <Box sx={{ mt: 1 }}>
            <Chip 
              label={`Target: ${targetScore}`} 
              color="secondary" 
              size="small" 
              sx={{ mr: 1 }}
            />
            {requiredRuns > 0 ? (
              <Chip 
                label={`Need ${requiredRuns} runs from ${remainingBalls} balls`} 
                color="primary" 
                size="small" 
              />
            ) : (
              <Chip 
                label="Target achieved!" 
                color="success" 
                size="small" 
              />
            )}
          </Box>
        )}
      </Paper>
      
      {/* Current Batsman & Bowler */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 1.5, 
          mb: 2, 
          bgcolor: 'background.paper',
          borderRadius: 1
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Batsman
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {currentBatsman?.username || 'N/A'}
            </Typography>
            {currentBatsman?.id === player.id && (
              <Chip label="You" size="small" color="primary" sx={{ mt: 0.5 }} />
            )}
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Bowler
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {currentBowler?.username || 'N/A'}
            </Typography>
            {currentBowler?.id === player.id && (
              <Chip label="You" size="small" color="secondary" sx={{ mt: 0.5 }} />
            )}
          </Grid>
        </Grid>
      </Paper>
      
      {/* Recent Balls */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 1.5, 
          mb: 2, 
          bgcolor: 'background.paper',
          borderRadius: 1
        }}
      >
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Recent Balls
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {recentBalls?.length > 0 ? (
            recentBalls.map((ball, index) => {
              let color = 'default';
              if (ball === 'W') color = 'error';
              else if (ball === '4') color = 'primary';
              else if (ball === '6') color = 'success';
              else if (ball === 'WD' || ball === 'NB') color = 'warning';
              
              return (
                <Chip 
                  key={index}
                  label={ball} 
                  size="small"
                  color={color}
                  sx={{ 
                    minWidth: '32px',
                    fontWeight: 'bold'
                  }}
                />
              );
            })
          ) : (
            <Typography variant="body2" color="text.secondary">
              No balls bowled yet
            </Typography>
          )}
        </Box>
      </Paper>
      
      {/* Match Status */}
      {matchStatus && (
        <Paper 
          elevation={1} 
          sx={{ 
            p: 1.5, 
            bgcolor: 'background.paper',
            borderRadius: 1
          }}
        >
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Match Status
          </Typography>
          <Typography variant="body2">
            {matchStatus}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default ScoreBoard;
