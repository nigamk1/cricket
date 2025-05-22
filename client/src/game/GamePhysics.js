// Game physics handler for the cricket game
class GamePhysics {
  constructor(app) {
    this.app = app;
    
    // Physics constants
    this.gravity = 9.8; // m/s^2
    this.airResistance = 0.05;
    this.friction = 0.8;
    this.bounceFactor = 0.6;
    
    // Game speed
    this.timeScale = 1.0;
  }
  
  // Calculate ball trajectory based on bowling type and speed
  calculateBallTrajectory(bowlingData) {
    const { type, power, direction, spin } = bowlingData;
    
    // Initial velocities
    let velocityX = direction * power * 0.2;
    let velocityY = -power;
    let velocityZ = 0;
    
    // Adjust for different bowling types
    switch (type) {
      case 'fast':
        velocityY *= 1.2;
        break;
      case 'spin':
        velocityZ = spin * 0.5;
        velocityY *= 0.8;
        break;
      case 'swing':
        velocityX *= 1.5;
        velocityZ = direction * 0.3;
        break;
    }
    
    return { velocityX, velocityY, velocityZ, spin };
  }
  
  // Update ball position based on physics
  updateBallPosition(ball, delta) {
    // Apply scaled time delta
    const timeStep = delta * this.timeScale;
    
    // Update velocities with gravity and air resistance
    ball.velocityY += this.gravity * timeStep;
    ball.velocityX *= (1 - this.airResistance * timeStep);
    ball.velocityZ *= (1 - this.airResistance * timeStep);
    
    // Apply spin effect
    ball.velocityX += ball.spin * timeStep * 0.1;
    
    // Update positions
    ball.x += ball.velocityX * timeStep;
    ball.y += ball.velocityY * timeStep;
    ball.z += ball.velocityZ * timeStep;
    
    // Ground collision detection
    if (ball.y > ball.groundLevel) {
      ball.y = ball.groundLevel;
      ball.velocityY = -ball.velocityY * this.bounceFactor;
      
      // Apply friction on bounce
      ball.velocityX *= this.friction;
      ball.velocityZ *= this.friction;
      
      // Trigger bounce event
      if (Math.abs(ball.velocityY) > 0.5) {
        return 'bounce';
      }
    }
    
    // Check if ball stopped
    if (
      Math.abs(ball.velocityX) < 0.1 && 
      Math.abs(ball.velocityY) < 0.1 && 
      Math.abs(ball.velocityZ) < 0.1 &&
      ball.y >= ball.groundLevel - 0.1
    ) {
      return 'stopped';
    }
    
    return null;
  }
  
  // Calculate bat and ball collision
  calculateBatBallCollision(bat, ball, shotData) {
    const { power, timing, direction } = shotData;
    
    // Check if bat hits the ball (simplified collision detection)
    const hitSuccess = timing >= -0.2 && timing <= 0.2;
    
    if (hitSuccess) {
      // Perfect timing gives maximum power
      const timingFactor = 1 - Math.abs(timing) * 3;
      
      // Calculate new velocities
      ball.velocityX = direction * power * timingFactor * 0.5;
      ball.velocityY = -power * timingFactor * 0.3;
      ball.velocityZ = (Math.random() - 0.5) * power * 0.1;
      
      // Determine shot outcome based on timing
      let shotOutcome;
      
      if (timingFactor > 0.8) {
        // Perfect timing - boundary chance
        shotOutcome = Math.random() < 0.7 ? 'boundary' : 'good_shot';
      } else if (timingFactor > 0.5) {
        // Good timing - runs
        shotOutcome = 'good_shot';
      } else if (timingFactor > 0.2) {
        // Poor timing - potential wicket
        shotOutcome = Math.random() < 0.3 ? 'wicket' : 'poor_shot';
      } else {
        // Very poor timing - high wicket chance
        shotOutcome = Math.random() < 0.7 ? 'wicket' : 'poor_shot';
      }
      
      return { collision: true, outcome: shotOutcome, timingFactor };
    }
    
    return { collision: false };
  }
  
  // Calculate if the ball hits wickets
  checkWicketHit(ball, wicketPosition, wicketSize) {
    // Simple rectangular collision detection
    if (
      ball.x >= wicketPosition.x - wicketSize.width / 2 &&
      ball.x <= wicketPosition.x + wicketSize.width / 2 &&
      ball.z >= wicketPosition.z - wicketSize.depth / 2 &&
      ball.z <= wicketPosition.z + wicketSize.depth / 2 &&
      ball.y <= wicketPosition.y + wicketSize.height &&
      ball.y >= wicketPosition.y
    ) {
      return true;
    }
    
    return false;
  }
  
  // Set game speed (for replays, etc.)
  setTimeScale(scale) {
    this.timeScale = Math.max(0.1, Math.min(2.0, scale));
  }
}

export default GamePhysics;
