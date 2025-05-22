import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const NotFound = () => {
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
            textAlign: 'center',
            width: '100%'
          }}
        >
          <SportsCricketIcon 
            color="error" 
            sx={{ 
              fontSize: 80, 
              mb: 2 
            }} 
          />
          
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              color: 'error.main'
            }}
          >
            404
          </Typography>
          
          <Typography 
            variant="h5" 
            component="h2" 
            gutterBottom
          >
            Page Not Found
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 4,
              color: 'text.secondary'
            }}
          >
            Oops! The page you're looking for doesn't exist or has been moved.
          </Typography>
          
          <Button 
            component={Link}
            to="/"
            variant="contained" 
            color="primary" 
            startIcon={<ArrowBackIcon />}
            size="large"
          >
            Back to Home
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFound;
