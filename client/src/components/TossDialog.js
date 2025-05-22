import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box,
  CircularProgress
} from '@mui/material';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';

const TossDialog = ({ open, player, tossWinner, onChoice, tossResult }) => {
  const [isWinner, setIsWinner] = useState(false);
  const [animating, setAnimating] = useState(false);
  
  useEffect(() => {
    // Determine if current player is the toss winner
    if (tossWinner) {
      setIsWinner(tossWinner.id === player?.id);
    } else {
      setIsWinner(false);
    }
    
    // Reset animation state when dialog opens
    if (open) {
      setAnimating(true);
      const timer = setTimeout(() => {
        setAnimating(false);
      }, 2000); // coin flip animation time
      
      return () => clearTimeout(timer);
    }
  }, [open, player, tossWinner]);
  
  // Handle bat or bowl choice
  const handleChoice = (choice) => {
    onChoice(choice);
  };
  
  return (
    <Dialog 
      open={open} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SportsCricketIcon sx={{ mr: 1 }} />
          Coin Toss
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ py: 3 }}>
        <Box sx={{ textAlign: 'center' }}>
          {animating ? (
            <Box sx={{ py: 3 }}>
              <CircularProgress size={60} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Flipping the coin...
              </Typography>
            </Box>
          ) : tossWinner ? (
            <Box>
              <Typography variant="h5" gutterBottom>
                {isWinner 
                  ? '🎉 You won the toss! 🎉' 
                  : `${tossWinner.username} won the toss`}
              </Typography>
              
              {tossResult ? (
                <Typography variant="body1" sx={{ mt: 2 }}>
                  {tossWinner.username} chose to {tossResult} first.
                </Typography>
              ) : isWinner ? (
                <Typography variant="body1" sx={{ mt: 2, mb: 3 }}>
                  What would you like to do?
                </Typography>
              ) : (
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Waiting for {tossWinner.username} to choose...
                </Typography>
              )}
            </Box>
          ) : (
            <Typography variant="body1">
              Preparing for the toss...
            </Typography>
          )}
        </Box>
      </DialogContent>
      
      {isWinner && !tossResult && !animating && (
        <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large" 
            onClick={() => handleChoice('bat')}
            sx={{ px: 4 }}
          >
            Bat First
          </Button>
          <Button 
            variant="contained" 
            color="secondary" 
            size="large" 
            onClick={() => handleChoice('bowl')}
            sx={{ px: 4 }}
          >
            Bowl First
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default TossDialog;
