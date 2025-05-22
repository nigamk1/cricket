const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gameSchema = new mongoose.Schema({
  team1: {
    id: String,
    username: String
  },
  team2: {
    id: String,
    username: String
  },
  tossWinner: {
    id: String,
    username: String
  },
  tossChoice: {
    type: String,
    enum: ['bat', 'bowl']
  },
  innings1Score: {
    runs: {
      type: Number,
      default: 0
    },
    wickets: {
      type: Number,
      default: 0
    },
    overs: {
      type: Number,
      default: 0
    }
  },
  innings2Score: {
    runs: {
      type: Number,
      default: 0
    },
    wickets: {
      type: Number,
      default: 0
    },
    overs: {
      type: Number,
      default: 0
    }
  },
  winner: {
    id: String,
    username: String
  },
  winMargin: Number,
  winType: {
    type: String,
    enum: ['runs', 'wickets', 'tie']
  },
  matchSummary: String,
  totalOvers: {
    type: Number,
    default: 5
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed'],
    default: 'in_progress'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
});

module.exports = mongoose.model('Game', gameSchema);
