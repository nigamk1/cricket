const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { 
  registerUser,
  loginUser,
  getMe,
  getUserStats,
  updateStats
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// Stats routes
router.get('/:id/stats', getUserStats);
router.put('/:id/stats', protect, updateStats);

// @route   GET api/users
// @desc    Get all users
// @access  Public
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-email');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/users/:id
// @desc    Get user by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.status(500).send('Server Error');
  }
});

// @route   POST api/users
// @desc    Create or update user
// @access  Public
router.post('/', async (req, res) => {
  const { username, email } = req.body;
  
  try {
    let user = await User.findOne({ username });
    
    if (user) {
      // Update existing user
      user = await User.findOneAndUpdate(
        { username }, 
        { $set: { email } }, 
        { new: true }
      );
      
      return res.json(user);
    }
    
    // Create new user
    user = new User({
      username,
      email
    });
    
    await user.save();
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/users/stats/:id
// @desc    Update user stats
// @access  Public
router.put('/stats/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    const { gamesPlayed, gamesWon, highestScore, wicketsTaken } = req.body.stats;
    
    // Update stats
    if (gamesPlayed !== undefined) user.stats.gamesPlayed += gamesPlayed;
    if (gamesWon !== undefined) user.stats.gamesWon += gamesWon;
    if (highestScore !== undefined && highestScore > user.stats.highestScore) {
      user.stats.highestScore = highestScore;
    }
    if (wicketsTaken !== undefined) user.stats.wicketsTaken += wicketsTaken;
    
    await user.save();
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.status(500).send('Server Error');
  }
});

module.exports = router;
