import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import HomeIcon from '@mui/icons-material/Home';

const ResultsDialog = ({ open, results, player, onClose }) => {
  if (!results) return null;
  
  const { winner, team1, team2, innings1Score, innings2Score, winMargin, winType } = results;
  const isWinner = winner?.id === player?.id;
  
  return (
    <Dialog 
      open={open} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          bgcolor: isWinner ? 'success.main' : 'primary.main', 
          color: 'white', 
          pb: 1 
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <EmojiEventsIcon sx={{ mr: 1 }} />
          Match Results
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ py: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography 
            variant="h4" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              color: isWinner ? 'success.main' : 'text.primary'
            }}
          >
            {isWinner 
              ? '🎉 You Won! 🎉' 
              : winner
                ? `${winner.username} Won!`
                : 'Match Tied!'}
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            {winMargin && winType 
              ? `Won by ${winMargin} ${winType}` 
              : winner
                ? 'Match completed'
                : 'The match ended in a tie!'}
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* Scorecard */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Scorecard
          </Typography>
          
          <TableContainer component={Paper} elevation={1}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell>Team</TableCell>
                  <TableCell align="right">Runs</TableCell>
                  <TableCell align="right">Wickets</TableCell>
                  <TableCell align="right">Overs</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell component="th" scope="row">
                    {team1.name}
                    {player && team1.id === player.id && " (You)"}
                  </TableCell>
                  <TableCell align="right">{innings1Score.runs}</TableCell>
                  <TableCell align="right">{innings1Score.wickets}</TableCell>
                  <TableCell align="right">{innings1Score.overs}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">
                    {team2.name}
                    {player && team2.id === player.id && " (You)"}
                  </TableCell>
                  <TableCell align="right">{innings2Score.runs}</TableCell>
                  <TableCell align="right">{innings2Score.wickets}</TableCell>
                  <TableCell align="right">{innings2Score.overs}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        
        {/* Match Summary */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Match Summary
          </Typography>
          
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="body2" paragraph>
              {results.matchSummary || `${winner?.username || 'A team'} won the match ${winMargin && winType ? `by ${winMargin} ${winType}` : ''}.`}
            </Typography>
            
            <Typography variant="body2">
              {isWinner 
                ? 'Congratulations on your victory!' 
                : 'Better luck next time!'}
            </Typography>
          </Paper>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<HomeIcon />}
          onClick={onClose}
        >
          Return to Lobby
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResultsDialog;
