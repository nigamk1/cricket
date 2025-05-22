const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const User = require('../models/User');

// @route   GET api/games
// @desc    Get all games
// @access  Public
router.get('/', async (req, res) => {
  try {
    const games = await Game.find().sort({ createdAt: -1 });
    res.json(games);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/games/:id
// @desc    Get game by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    
    if (!game) {
      return res.status(404).json({ msg: 'Game not found' });
    }
    
    res.json(game);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Game not found' });
    }
    
    res.status(500).send('Server Error');
  }
});

// @route   GET api/games/user/:userId
// @desc    Get games by user ID
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const games = await Game.find({
      $or: [
        { 'team1.id': req.params.userId },
        { 'team2.id': req.params.userId }
      ]
    }).sort({ createdAt: -1 });
    
    res.json(games);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/games
// @desc    Create a new game
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { team1, team2, tossWinner, tossChoice } = req.body;
    
    const newGame = new Game({
      team1,
      team2,
      tossWinner,
      tossChoice
    });
    
    const game = await newGame.save();
    
    res.json(game);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/games/:id
// @desc    Update a game
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    
    if (!game) {
      return res.status(404).json({ msg: 'Game not found' });
    }
    
    // Update game fields
    const { innings1Score, innings2Score, winner, winMargin, winType, matchSummary, status } = req.body;
    
    if (innings1Score) game.innings1Score = innings1Score;
    if (innings2Score) game.innings2Score = innings2Score;
    if (winner) game.winner = winner;
    if (winMargin) game.winMargin = winMargin;
    if (winType) game.winType = winType;
    if (matchSummary) game.matchSummary = matchSummary;
    if (status) game.status = status;
    
    // If game is completed, set completedAt
    if (status === 'completed' && !game.completedAt) {
      game.completedAt = Date.now();
      
      // Update user stats
      await updateUserStats(game);
    }
    
    await game.save();
    
    res.json(game);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Game not found' });
    }
    
    res.status(500).send('Server Error');
  }
});

// Update user stats when a game is completed
const updateUserStats = async (game) => {
  try {
    // Update team1 player stats
    const team1User = await User.findOne({ username: game.team1.username });
    if (team1User) {
      team1User.stats.gamesPlayed += 1;
      
      if (game.winner && game.winner.id === game.team1.id) {
        team1User.stats.gamesWon += 1;
      }
      
      if (game.innings1Score.runs > team1User.stats.highestScore) {
        team1User.stats.highestScore = game.innings1Score.runs;
      }
      
      await team1User.save();
    }
    
    // Update team2 player stats
    const team2User = await User.findOne({ username: game.team2.username });
    if (team2User) {
      team2User.stats.gamesPlayed += 1;
      
      if (game.winner && game.winner.id === game.team2.id) {
        team2User.stats.gamesWon += 1;
      }
      
      if (game.innings2Score.runs > team2User.stats.highestScore) {
        team2User.stats.highestScore = game.innings2Score.runs;
      }
      
      await team2User.save();
    }
  } catch (err) {
    console.error('Error updating user stats:', err.message);
  }
};

module.exports = router;
