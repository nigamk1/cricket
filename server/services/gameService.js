// Game service for managing cricket game logic

// Perform the coin toss
const performToss = (room) => {
  if (!room || room.players.length < 2) {
    throw new Error('Not enough players for toss');
  }
  
  // Randomly pick a winner from the two players
  const winner = room.players[Math.floor(Math.random() * 2)];
  
  return { winner };
};

// Process the toss winner's choice (bat or bowl)
const processTossChoice = (room, playerId, choice) => {
  if (!room || room.players.length < 2) {
    throw new Error('Not enough players for game');
  }
  
  if (!choice || !['bat', 'bowl'].includes(choice)) {
    throw new Error('Invalid choice. Must be "bat" or "bowl"');
  }
  
  const tossWinner = room.players.find(p => p.id === playerId);
  
  if (!tossWinner) {
    throw new Error('Player not found in room');
  }
  
  // Set up teams based on toss winner's choice
  const opponent = room.players.find(p => p.id !== tossWinner.id);
  
  let battingTeam, bowlingTeam;
  
  if (choice === 'bat') {
    battingTeam = tossWinner;
    bowlingTeam = opponent;
  } else {
    battingTeam = opponent;
    bowlingTeam = tossWinner;
  }
  
  return {
    battingTeam,
    bowlingTeam,
    tossWinner,
    choice
  };
};

// Initialize a new game
const initializeGame = (room, { battingTeam, bowlingTeam }) => {
  const totalOvers = 5; // 5 overs per innings
  
  const gameState = {
    team1: battingTeam,
    team2: bowlingTeam,
    currentInnings: 1,
    innings1Score: { runs: 0, wickets: 0, overs: 0, balls: 0 },
    innings2Score: { runs: 0, wickets: 0, overs: 0, balls: 0 },
    currentBatsman: battingTeam,
    currentBowler: bowlingTeam,
    currentOver: 0,
    currentBall: 0,
    totalOvers: totalOvers,
    recentBalls: [],
    ballInMotion: false,
    batsmanSwing: false,
    fieldingAction: false,
    matchOver: false,
    matchStatus: 'Match in progress. First innings.'
  };
  
  return gameState;
};

// Process a game action (batting or bowling)
const processGameAction = (gameState, playerId, action) => {
  // Clone the game state to avoid mutation
  const newGameState = { ...gameState };
  
  // Determine the action type
  if (action.type === 'bat' && gameState.currentBatsman?.id === playerId) {
    // Process batting action
    return processBattingAction(newGameState, action);
  } else if (action.type === 'bowl' && gameState.currentBowler?.id === playerId) {
    // Process bowling action
    return processBowlingAction(newGameState, action);
  } else {
    // Invalid action or not player's turn
    return gameState;
  }
};

// Process a batting action
const processBattingAction = (gameState, action) => {
  // Set batsman swing animation flag
  gameState.batsmanSwing = true;
  gameState.shotType = action.shotType;
  
  return gameState;
};

// Process a bowling action
const processBowlingAction = (gameState, action) => {
  // Set ball in motion
  gameState.ballInMotion = true;
  gameState.bowlType = action.bowlType;
  
  // Determine outcome based on bowl type and (later) batsman's shot
  // For now, use randomized outcome
  setTimeout(() => {
    determineOutcome(gameState);
  }, 1000);
  
  return gameState;
};

// Enhanced cricket game physics and shot outcomes
const calculateShotOutcome = (bowlerAction, batsmanAction) => {
  // Deconstruct actions
  const { type: bowlType, power: bowlPower, direction: bowlDirection, spin } = bowlerAction;
  const { shotType, power: batPower, timing, direction: batDirection } = batsmanAction;
  
  // Base variables
  let runs = 0;
  let isWicket = false;
  let isBoundary = false;
  let quality = '';
  let description = '';
  
  // Calculate timing effectiveness (-1 to 1, where 0 is perfect)
  // A timing of -0.2 to 0.2 is considered "good timing"
  const timingEffectiveness = 1 - Math.min(1, Math.abs(timing) * 5);
  
  // Calculate direction match
  // If batsman plays in the opposite direction of the bowler, it's harder to connect well
  const directionFactor = 1 - Math.min(1, Math.abs(bowlDirection - batDirection) / 2);
  
  // Calculate overall shot effectiveness
  const shotEffectiveness = timingEffectiveness * 0.6 + directionFactor * 0.4;
  
  // Random factor for some unpredictability (0.7 to 1.3)
  const randomFactor = 0.7 + Math.random() * 0.6;
  
  // Calculate base runs potential (0-6)
  const runPotential = shotEffectiveness * batPower * randomFactor;
  
  // Determine outcome based on bowling type and shot type
  if (shotEffectiveness < 0.2) {
    // Poor connection - high chance of wicket
    isWicket = Math.random() < 0.7;
    quality = 'poor';
    
    if (isWicket) {
      description = getBowlingWicketDescription(bowlType);
    } else {
      runs = Math.floor(Math.random() * 2); // 0 or 1 run on a poor shot that isn't out
      description = `${getBatsmanActionDescription(shotType, quality)} for ${runs} run${runs !== 1 ? 's' : ''}`;
    }
  } else if (shotEffectiveness < 0.5) {
    // Decent connection - some run chance, small wicket chance
    isWicket = Math.random() < 0.2;
    quality = 'decent';
    
    if (isWicket) {
      description = getBowlingWicketDescription(bowlType);
    } else {
      runs = Math.floor(Math.random() * 3); // 0-2 runs
      description = `${getBatsmanActionDescription(shotType, quality)} for ${runs} run${runs !== 1 ? 's' : ''}`;
    }
  } else if (shotEffectiveness < 0.8) {
    // Good connection - good run chance, very small wicket chance
    isWicket = Math.random() < 0.05;
    quality = 'good';
    
    if (isWicket) {
      description = getBowlingWicketDescription(bowlType);
    } else {
      runs = Math.floor(runPotential);
      if (runs > 4) runs = 4;
      if (runs === 4) isBoundary = true;
      description = `${getBatsmanActionDescription(shotType, quality)} for ${runs} run${runs !== 1 ? 's' : ''}${isBoundary ? ' - FOUR!' : ''}`;
    }
  } else {
    // Perfect connection - high run chance, boundary chance
    quality = 'perfect';
    runs = Math.floor(runPotential);
    
    if (runs >= 4) {
      isBoundary = true;
      if (runs > 4 && Math.random() > 0.7) {
        runs = 6;
        description = `${getBatsmanActionDescription(shotType, quality)} - SIX!`;
      } else {
        runs = 4;
        description = `${getBatsmanActionDescription(shotType, quality)} - FOUR!`;
      }
    } else {
      description = `${getBatsmanActionDescription(shotType, quality)} for ${runs} run${runs !== 1 ? 's' : ''}`;
    }
  }
  
  return {
    runs,
    isWicket,
    isBoundary,
    quality,
    description,
    shotEffectiveness
  };
};

// Determine the outcome of a ball
// Determine the outcome of a ball
const determineOutcome = (gameState) => {
  // Combine bowling and batting actions
  const bowlerAction = {
    type: gameState.bowlType || 'fast',
    power: gameState.bowlPower || Math.random() * 0.8 + 0.2, // 0.2-1.0
    direction: gameState.bowlDirection || (Math.random() * 2 - 1), // -1 to 1
    spin: gameState.bowlSpin || (Math.random() * 0.5) // 0-0.5
  };
  
  const batsmanAction = {
    shotType: gameState.shotType || ['drive', 'cut', 'pull', 'sweep', 'defensive'][Math.floor(Math.random() * 5)],
    power: gameState.batPower || Math.random() * 0.8 + 0.2, // 0.2-1.0
    timing: gameState.timing || (Math.random() * 2 - 1), // -1 to 1
    direction: gameState.batDirection || (Math.random() * 2 - 1) // -1 to 1
  };
  
  // Calculate shot outcome using enhanced physics
  const result = calculateShotOutcome(bowlerAction, batsmanAction);
  
  // Convert to ball notation
  let outcome;
  if (result.isWicket) {
    outcome = 'W';
  } else if (result.runs === 6) {
    outcome = '6';
  } else if (result.runs === 4) {
    outcome = '4';
  } else {
    outcome = String(result.runs);
  }
  
  // Add random wide or no-ball (5% chance)
  if (!result.isWicket && Math.random() < 0.05) {
    outcome = Math.random() < 0.5 ? 'WD' : 'NB';
  }
  
  // Process the outcome
  const inningsScore = gameState.currentInnings === 1 ? gameState.innings1Score : gameState.innings2Score;
  
  // Add to recent balls with description
  gameState.recentBalls.unshift({
    outcome,
    description: result.description || getGenericDescription(outcome)
  });
  
  if (gameState.recentBalls.length > 10) {
    gameState.recentBalls.pop();  }
  
  // Update the score
  switch (outcome) {
    case '0':
      // Dot ball - no runs
      break;
    case '1':
      inningsScore.runs += 1;
      break;
    case '2':
      inningsScore.runs += 2;
      break;
    case '3':
      inningsScore.runs += 3;
      break;
    case '4':
      inningsScore.runs += 4;
      // Update boundary count
      inningsScore.boundaries = (inningsScore.boundaries || 0) + 1;
      break;
    case '6':
      inningsScore.runs += 6;
      // Update six count
      inningsScore.sixes = (inningsScore.sixes || 0) + 1;
      break;
    case 'W':
      inningsScore.wickets += 1;
      // Check if all out (typically 10 wickets, but using 10 or players length for flexibility)
      const maxWickets = 10;
      if (inningsScore.wickets >= maxWickets) {
        endInnings(gameState);
      }
      break;
    case 'WD':
      // Wide adds 1 run but doesn't count as a ball
      inningsScore.runs += 1;
      inningsScore.extras = (inningsScore.extras || 0) + 1;
      // Don't increment the ball count for wides
      return gameState;
    case 'NB':
      // No ball adds 1 run but doesn't count as a ball
      inningsScore.runs += 1;
      inningsScore.extras = (inningsScore.extras || 0) + 1;
      // Don't increment the ball count for no balls
      return gameState;
    default:
      // Handle numeric outcomes not covered above
      if (!isNaN(parseInt(outcome))) {
        inningsScore.runs += parseInt(outcome);
      }  }
  
  // Advance the ball count
  gameState.currentBall += 1;
  
  // Check if over is complete
  if (gameState.currentBall >= 6) {
    gameState.currentOver += 1;
    gameState.currentBall = 0;
    
    // Swap batsman and bowler roles for the next over
    const temp = gameState.currentBatsman;
    gameState.currentBatsman = gameState.currentBowler;
    gameState.currentBowler = temp;
  }
  
  // Update overs
  if (gameState.currentInnings === 1) {
    gameState.innings1Score.overs = gameState.currentOver + (gameState.currentBall / 10);
  } else {
    gameState.innings2Score.overs = gameState.currentOver + (gameState.currentBall / 10);
  }
  
  // Check if innings is over (all out or all overs bowled)
  if (inningsScore.wickets >= 10 || gameState.currentOver >= gameState.totalOvers) {
    // End of innings
    if (gameState.currentInnings === 1) {
      // Switch to second innings
      gameState.currentInnings = 2;
      gameState.currentOver = 0;
      gameState.currentBall = 0;
      
      // Swap teams
      const temp = gameState.currentBatsman;
      gameState.currentBatsman = gameState.currentBowler;
      gameState.currentBowler = temp;
      
      gameState.matchStatus = 'First innings complete. Starting second innings.';
    } else {
      // End of match
      gameState.matchOver = true;
      
      // Determine the winner
      const team1Score = gameState.innings1Score.runs;
      const team2Score = gameState.innings2Score.runs;
      
      if (team1Score > team2Score) {
        gameState.winner = gameState.team1;
        gameState.winMargin = team1Score - team2Score;
        gameState.winType = 'runs';
        gameState.matchStatus = `${gameState.team1.username} won by ${gameState.winMargin} runs!`;
      } else if (team2Score > team1Score) {
        gameState.winner = gameState.team2;
        gameState.winMargin = 10 - gameState.innings2Score.wickets;
        gameState.winType = 'wickets';
        gameState.matchStatus = `${gameState.team2.username} won by ${gameState.winMargin} wickets!`;
      } else {
        gameState.matchStatus = 'Match tied!';
      }
    }
  }
  
  // Reset animation flags
  gameState.ballInMotion = false;
  gameState.batsmanSwing = false;
  
  return gameState;
};

// End current innings and set up next innings or end match
const endInnings = (gameState) => {
  if (gameState.currentInnings === 1) {
    // Switch to second innings
    gameState.currentInnings = 2;
    gameState.currentOver = 0;
    gameState.currentBall = 0;
    
    // Swap teams
    const temp = gameState.currentBatsman;
    gameState.currentBatsman = gameState.currentBowler;
    gameState.currentBowler = temp;
    
    gameState.matchStatus = 'First innings complete. Starting second innings.';
  } else {
    // End of match
    gameState.matchOver = true;
    
    // Determine the winner
    const team1Score = gameState.innings1Score.runs;
    const team2Score = gameState.innings2Score.runs;
    
    if (team1Score > team2Score) {
      gameState.winner = gameState.team1;
      gameState.winMargin = team1Score - team2Score;
      gameState.winType = 'runs';
      gameState.matchStatus = `${gameState.team1.username} won by ${gameState.winMargin} runs!`;
    } else if (team2Score > team1Score) {
      gameState.winner = gameState.team2;
      gameState.winMargin = 10 - gameState.innings2Score.wickets;
      gameState.winType = 'wickets';
      gameState.matchStatus = `${gameState.team2.username} won by ${gameState.winMargin} wickets!`;
    } else {
      gameState.matchStatus = 'Match tied!';
    }
  }
  
  return gameState;
};

// Generate match results for end of game
const generateMatchResults = (gameState) => {
  const results = {
    winner: gameState.winner,
    team1: gameState.team1,
    team2: gameState.team2,
    innings1Score: gameState.innings1Score,
    innings2Score: gameState.innings2Score,
    winMargin: gameState.winMargin,
    winType: gameState.winType,
    matchSummary: gameState.matchStatus
  };
  
  return results;
};

// Generate a descriptive bowling action for wickets
const getBowlingWicketDescription = (bowlType) => {
  const wicketTypes = [
    'BOWLED! The stumps are shattered!',
    'CAUGHT! A good catch in the field!',
    'LBW! That looked plumb in front!',
    'STUMPED! The batsman was out of the crease!',
    'CAUGHT BEHIND! The keeper makes no mistake!'
  ];
  
  let weightedTypes = [];
  
  switch (bowlType) {
    case 'fast':
      weightedTypes = [0, 1, 1, 4, 2]; // More likely to be caught behind or bowled
      break;
    case 'spin':
      weightedTypes = [0, 1, 2, 3, 3]; // More likely to be stumped or LBW
      break;
    case 'swing':
      weightedTypes = [0, 0, 1, 4, 2]; // More likely to be bowled or caught behind
      break;
    default:
      weightedTypes = [0, 1, 2, 3, 4]; // Equal chances
  }
  
  const randomIndex = weightedTypes[Math.floor(Math.random() * weightedTypes.length)];
  return wicketTypes[randomIndex];
};

// Generate a descriptive batting action
const getBatsmanActionDescription = (shotType, quality) => {
  const descriptions = {
    drive: {
      poor: 'A mistimed drive',
      decent: 'A steady drive',
      good: 'A well-timed drive',
      perfect: 'A brilliant drive'
    },
    cut: {
      poor: 'A mistimed cut',
      decent: 'A steady cut',
      good: 'A well-timed cut',
      perfect: 'A brilliant cut'
    },
    pull: {
      poor: 'A mistimed pull',
      decent: 'A steady pull',
      good: 'A well-timed pull',
      perfect: 'A powerful pull'
    },
    sweep: {
      poor: 'A mistimed sweep',
      decent: 'A steady sweep',
      good: 'A well-timed sweep',
      perfect: 'A brilliant sweep'
    },
    defensive: {
      poor: 'A shaky defensive shot',
      decent: 'A solid block',
      good: 'A controlled defensive shot',
      perfect: 'A masterful defensive shot'
    }
  };
  
  return descriptions[shotType]?.[quality] || `A ${quality} ${shotType} shot`;
};

// Get generic description for simple outcomes
const getGenericDescription = (outcome) => {
  switch (outcome) {
    case '0':
      return 'No run. Good defensive shot.';
    case '1':
      return 'Single run taken with a quick push.';
    case '2':
      return 'Two runs as the batsmen run quickly between the wickets.';
    case '3':
      return 'Three runs taken with good running.';
    case '4':
      return 'FOUR! The ball races to the boundary.';
    case '6':
      return 'SIX! That\'s gone all the way over the boundary rope!';
    case 'W':
      return 'OUT! The batsman has to go.';
    case 'WD':
      return 'Wide ball. Extra run to the batting side.';
    case 'NB':
      return 'No ball called by the umpire. Free hit coming up!';
    default:
      return 'The ball is played.';
  }
};

module.exports = {
  performToss,
  processTossChoice,
  initializeGame,
  processGameAction,
  generateMatchResults,
  calculateShotOutcome,
  getBowlingWicketDescription,
  getBatsmanActionDescription,
  getGenericDescription,
  endInnings
};
