import * as PIXI from 'pixi.js';
import GamePhysics from './GamePhysics';
import SoundEffects from './SoundEffects';

class CricketGame {
  constructor({ container, onGameEvent }) {
    this.container = container;
    this.onGameEvent = onGameEvent;
    this.gameState = null;
    
    // Game elements
    this.app = null;
    this.pitch = null;
    this.batsman = null;
    this.bowler = null;
    this.ball = null;
    this.fieldsmen = [];
    this.animations = {};
    
    // Game systems
    this.physics = null;
    this.sounds = new SoundEffects();
    
    // Constants
    this.PITCH_COLOR = 0xD2B48C; // Tan/beige color for pitch
    this.GRASS_COLOR = 0x0C4C18; // Dark green for field
    this.PITCH_WIDTH = 60;
    this.PITCH_LENGTH = 300;
    
    // Initialize the game
    this.init();
  }
    init() {
    // Create the PIXI Application
    this.app = new PIXI.Application({
      width: this.container.clientWidth,
      height: this.container.clientHeight,
      backgroundColor: this.GRASS_COLOR,
      antialias: true,
      resolution: window.devicePixelRatio || 1
    });
    
    // Add the canvas to the container
    this.container.appendChild(this.app.view);
    
    // Initialize physics
    this.physics = new GamePhysics(this.app);
    
    // Play game start sound
    this.sounds.play('game_start', 0.7);
    
    // Handle window resize
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // Create the cricket field
    this.createField();
    
    // Create placeholders for players
    this.createPlaceholders();
    
    // Set up game ticker
    this.app.ticker.add(this.gameLoop.bind(this));
  }
  
  handleResize() {
    if (this.app) {
      this.app.renderer.resize(
        this.container.clientWidth,
        this.container.clientHeight
      );
      
      // Reposition the elements for the new size
      this.positionElements();
    }
  }
  
  createField() {
    const stageWidth = this.app.screen.width;
    const stageHeight = this.app.screen.height;
    
    // Create the pitch (the central strip)
    this.pitch = new PIXI.Graphics();
    this.pitch.beginFill(this.PITCH_COLOR);
    this.pitch.drawRect(
      -this.PITCH_WIDTH / 2, 
      -this.PITCH_LENGTH / 2, 
      this.PITCH_WIDTH, 
      this.PITCH_LENGTH
    );
    this.pitch.endFill();
    this.pitch.position.set(stageWidth / 2, stageHeight / 2);
    this.app.stage.addChild(this.pitch);
    
    // Create the boundary circle
    const boundary = new PIXI.Graphics();
    boundary.lineStyle(3, 0xFFFFFF, 0.8);
    boundary.drawCircle(
      stageWidth / 2, 
      stageHeight / 2, 
      Math.min(stageWidth, stageHeight) * 0.45
    );
    this.app.stage.addChild(boundary);
    
    // Create the wickets
    this.createWickets();
  }
  
  createWickets() {
    const stageWidth = this.app.screen.width;
    const stageHeight = this.app.screen.height;
    
    // Create the batsman end wickets
    const batsmanWickets = new PIXI.Graphics();
    batsmanWickets.beginFill(0xFFFFFF);
    
    // Draw three wicket stumps
    for (let i = -1; i <= 1; i++) {
      batsmanWickets.drawRect(
        i * 8, 
        -12, 
        2, 
        24
      );
    }
    
    batsmanWickets.endFill();
    batsmanWickets.position.set(
      stageWidth / 2, 
      stageHeight / 2 + this.PITCH_LENGTH / 2 - 10
    );
    this.app.stage.addChild(batsmanWickets);
    
    // Create the bowler end wickets
    const bowlerWickets = new PIXI.Graphics();
    bowlerWickets.beginFill(0xFFFFFF);
    
    // Draw three wicket stumps
    for (let i = -1; i <= 1; i++) {
      bowlerWickets.drawRect(
        i * 8, 
        -12, 
        2, 
        24
      );
    }
    
    bowlerWickets.endFill();
    bowlerWickets.position.set(
      stageWidth / 2, 
      stageHeight / 2 - this.PITCH_LENGTH / 2 + 10
    );
    this.app.stage.addChild(bowlerWickets);
  }
  
  createPlaceholders() {
    const stageWidth = this.app.screen.width;
    const stageHeight = this.app.screen.height;
    
    // Create batsman placeholder
    this.batsman = new PIXI.Graphics();
    this.batsman.beginFill(0x4CAF50);
    this.batsman.drawCircle(0, 0, 15);
    this.batsman.endFill();
    this.batsman.position.set(
      stageWidth / 2, 
      stageHeight / 2 + this.PITCH_LENGTH / 2 - 40
    );
    this.app.stage.addChild(this.batsman);
    
    // Create bowler placeholder
    this.bowler = new PIXI.Graphics();
    this.bowler.beginFill(0x2196F3);
    this.bowler.drawCircle(0, 0, 15);
    this.bowler.endFill();
    this.bowler.position.set(
      stageWidth / 2, 
      stageHeight / 2 - this.PITCH_LENGTH / 2 + 40
    );
    this.app.stage.addChild(this.bowler);
    
    // Create fielders placeholders
    for (let i = 0; i < 9; i++) {
      const fieldsman = new PIXI.Graphics();
      fieldsman.beginFill(0x2196F3);
      fieldsman.drawCircle(0, 0, 10);
      fieldsman.endFill();
      
      // Position fielders in a rough circle
      const angle = (i / 9) * Math.PI * 2;
      const radius = Math.min(stageWidth, stageHeight) * 0.35;
      fieldsman.position.set(
        stageWidth / 2 + Math.cos(angle) * radius,
        stageHeight / 2 + Math.sin(angle) * radius
      );
      
      this.fieldsmen.push(fieldsman);
      this.app.stage.addChild(fieldsman);
    }
  }
  
  positionElements() {
    const stageWidth = this.app.screen.width;
    const stageHeight = this.app.screen.height;
    
    // Reposition the pitch
    if (this.pitch) {
      this.pitch.position.set(stageWidth / 2, stageHeight / 2);
    }
    
    // Reposition the batsman
    if (this.batsman) {
      this.batsman.position.set(
        stageWidth / 2, 
        stageHeight / 2 + this.PITCH_LENGTH / 2 - 40
      );
    }
    
    // Reposition the bowler
    if (this.bowler) {
      this.bowler.position.set(
        stageWidth / 2, 
        stageHeight / 2 - this.PITCH_LENGTH / 2 + 40
      );
    }
    
    // Reposition the fielders
    for (let i = 0; i < this.fieldsmen.length; i++) {
      const fieldsman = this.fieldsmen[i];
      const angle = (i / this.fieldsmen.length) * Math.PI * 2;
      const radius = Math.min(stageWidth, stageHeight) * 0.35;
      
      fieldsman.position.set(
        stageWidth / 2 + Math.cos(angle) * radius,
        stageHeight / 2 + Math.sin(angle) * radius
      );
    }
  }
  
  // Update the game state based on server update
  updateGameState(gameState) {
    this.gameState = gameState;
    
    // Update visual elements based on game state
    if (gameState.ballInMotion) {
      this.animateBall(gameState.ballPath);
    }
    
    // Animate batsman if they're swinging
    if (gameState.batsmanSwing) {
      this.animateBatsman(gameState.shotType);
    }
    
    // Animate fielders if there's fielding action
    if (gameState.fieldingAction) {
      this.animateFielding(gameState.fieldingPosition);
    }
  }
  
  // Animate the ball delivery and shot
  animateBall(ballPath) {
    // Remove any existing ball
    if (this.ball) {
      this.app.stage.removeChild(this.ball);
    }
    
    // Create the ball
    this.ball = new PIXI.Graphics();
    this.ball.beginFill(0xFFFFFF);
    this.ball.drawCircle(0, 0, 5);
    this.ball.endFill();
    
    // Set the initial position to the bowler
    this.ball.position.set(this.bowler.x, this.bowler.y);
    this.app.stage.addChild(this.ball);
    
    // Create animation for the ball
    if (this.animations.ball) {
      this.animations.ball.stop();
    }
    
    // Define the ball path points
    const startPoint = { x: this.bowler.x, y: this.bowler.y };
    const endPoint = { x: this.batsman.x, y: this.batsman.y };
    
    // If there's a specific path from the server, use it
    const path = ballPath || [
      startPoint,
      { x: endPoint.x, y: startPoint.y + (endPoint.y - startPoint.y) * 0.6 },
      endPoint
    ];
    
    // Create and start the animation
    let progress = 0;
    const animationSpeed = 0.01;
    
    this.animations.ball = () => {
      progress += animationSpeed;
      
      if (progress >= 1) {
        // Animation completed
        this.app.ticker.remove(this.animations.ball);
        this.animations.ball = null;
        
        // Notify about ball delivery completed
        if (this.onGameEvent) {
          this.onGameEvent({ type: 'ball_delivered' });
        }
        
        return;
      }
      
      // Calculate current position using quadratic bezier curve for smooth motion
      if (path.length === 3) {
        const p0 = path[0];
        const p1 = path[1];
        const p2 = path[2];
        
        // Quadratic bezier formula: (1-t)²*P0 + 2(1-t)t*P1 + t²*P2
        const oneMinusT = 1 - progress;
        const oneMinusTSquared = oneMinusT * oneMinusT;
        const tSquared = progress * progress;
        const twoOneMinusT_t = 2 * oneMinusT * progress;
        
        this.ball.x = oneMinusTSquared * p0.x + twoOneMinusT_t * p1.x + tSquared * p2.x;
        this.ball.y = oneMinusTSquared * p0.y + twoOneMinusT_t * p1.y + tSquared * p2.y;
      } else {
        // Linear interpolation if we don't have bezier control points
        const p0 = path[0];
        const p1 = path[path.length - 1];
        
        this.ball.x = p0.x + (p1.x - p0.x) * progress;
        this.ball.y = p0.y + (p1.y - p0.y) * progress;
      }
    };
    
    // Add the animation to the ticker
    this.app.ticker.add(this.animations.ball);
  }
  
  // Animate the batsman's shot
  animateBatsman(shotType) {
    // Create animation for the batsman
    if (this.animations.batsman) {
      this.app.ticker.remove(this.animations.batsman);
    }
    
    // Default animation just scales the batsman up and down
    let progress = 0;
    const animationDuration = 30; // frames
    let frameCount = 0;
    
    // Store the original scale
    const originalScale = { x: this.batsman.scale.x, y: this.batsman.scale.y };
    
    this.animations.batsman = () => {
      frameCount++;
      
      // Simple scale animation
      if (frameCount <= animationDuration / 2) {
        progress = frameCount / (animationDuration / 2);
        this.batsman.scale.set(
          originalScale.x * (1 + progress * 0.3),
          originalScale.y * (1 + progress * 0.3)
        );
      } else if (frameCount <= animationDuration) {
        progress = (animationDuration - frameCount) / (animationDuration / 2);
        this.batsman.scale.set(
          originalScale.x * (1 + progress * 0.3),
          originalScale.y * (1 + progress * 0.3)
        );
      } else {
        // Animation completed
        this.batsman.scale.set(originalScale.x, originalScale.y);
        this.app.ticker.remove(this.animations.batsman);
        this.animations.batsman = null;
        
        // Notify about batsman action completed
        if (this.onGameEvent) {
          this.onGameEvent({ type: 'shot_played', shotType });
        }
      }
    };
    
    // Add the animation to the ticker
    this.app.ticker.add(this.animations.batsman);
  }
  
  // Animate fielder movement to catch or retrieve the ball
  animateFielding(position) {
    // Find the closest fielder to the target position
    if (!position || this.fieldsmen.length === 0) return;
    
    let closestFielderIndex = 0;
    let minDistance = Number.MAX_VALUE;
    
    for (let i = 0; i < this.fieldsmen.length; i++) {
      const fieldsman = this.fieldsmen[i];
      const distance = Math.sqrt(
        Math.pow(fieldsman.x - position.x, 2) + 
        Math.pow(fieldsman.y - position.y, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestFielderIndex = i;
      }
    }
    
    const fielder = this.fieldsmen[closestFielderIndex];
    const startPosition = { x: fielder.x, y: fielder.y };
    
    // Create animation for the fielder
    if (this.animations[`fielder${closestFielderIndex}`]) {
      this.app.ticker.remove(this.animations[`fielder${closestFielderIndex}`]);
    }
    
    let progress = 0;
    const animationSpeed = 0.02;
    
    this.animations[`fielder${closestFielderIndex}`] = () => {
      progress += animationSpeed;
      
      if (progress >= 1) {
        // Animation completed
        this.app.ticker.remove(this.animations[`fielder${closestFielderIndex}`]);
        this.animations[`fielder${closestFielderIndex}`] = null;
        
        // Start return animation after a brief pause
        setTimeout(() => {
          this.animateFielderReturn(closestFielderIndex, startPosition);
        }, 500);
        
        return;
      }
      
      // Move the fielder toward the target
      fielder.x = startPosition.x + (position.x - startPosition.x) * progress;
      fielder.y = startPosition.y + (position.y - startPosition.y) * progress;
    };
    
    // Add the animation to the ticker
    this.app.ticker.add(this.animations[`fielder${closestFielderIndex}`]);
  }
  
  // Animate a fielder returning to their original position
  animateFielderReturn(fielderIndex, originalPosition) {
    const fielder = this.fieldsmen[fielderIndex];
    const startPosition = { x: fielder.x, y: fielder.y };
    
    // Create animation for the fielder
    if (this.animations[`fielderReturn${fielderIndex}`]) {
      this.app.ticker.remove(this.animations[`fielderReturn${fielderIndex}`]);
    }
    
    let progress = 0;
    const animationSpeed = 0.01;
    
    this.animations[`fielderReturn${fielderIndex}`] = () => {
      progress += animationSpeed;
      
      if (progress >= 1) {
        // Animation completed
        this.app.ticker.remove(this.animations[`fielderReturn${fielderIndex}`]);
        this.animations[`fielderReturn${fielderIndex}`] = null;
        
        // Notify about fielding action completed
        if (this.onGameEvent) {
          this.onGameEvent({ type: 'fielding_complete' });
        }
        
        return;
      }
      
      // Move the fielder back to original position
      fielder.x = startPosition.x + (originalPosition.x - startPosition.x) * progress;
      fielder.y = startPosition.y + (originalPosition.y - startPosition.y) * progress;
    };
    
    // Add the animation to the ticker
    this.app.ticker.add(this.animations[`fielderReturn${fielderIndex}`]);
  }
  
  gameLoop(delta) {
    // Skip if game is not active
    if (!this.gameState || this.gameState.status !== 'playing') {
      return;
    }
    
    // Update ball physics if ball is in motion
    if (this.ball && this.ball.visible && this.ball.inMotion) {
      const result = this.physics.updateBallPosition(this.ball, delta);
      
      // Update ball sprite position and scale for 3D effect
      this.updateBallVisuals();
      
      // Handle physics events
      if (result === 'bounce') {
        this.sounds.play('ball_bounce', 0.4);
        this.onGameEvent({ type: 'ball_bounce', position: { x: this.ball.x, y: this.ball.y } });
      } else if (result === 'stopped') {
        this.ball.inMotion = false;
        this.onGameEvent({ type: 'ball_stopped', position: { x: this.ball.x, y: this.ball.y } });
      }
      
      // Check for wicket collision
      if (this.checkWicketCollision()) {
        this.sounds.play('wicket', 0.8);
        this.ball.inMotion = false;
        this.onGameEvent({ type: 'wicket_hit' });
      }
    }
    
    // Update animations
    this.updateAnimations(delta);
  }
  
  updateBallVisuals() {
    if (!this.ball) return;
    
    // Position the sprite based on 3D coordinates
    this.ball.sprite.x = this.ball.x;
    this.ball.sprite.y = this.ball.y - this.ball.z; // Z affects vertical position for pseudo-3D
    
    // Scale based on z position for perspective effect
    const baseScale = 0.1;
    const zFactor = Math.max(0.5, Math.min(1.5, 1 + this.ball.z / 300));
    this.ball.sprite.scale.set(baseScale * zFactor);
    
    // Add shadow
    if (this.ball.shadow) {
      this.ball.shadow.x = this.ball.x;
      this.ball.shadow.y = this.ball.groundLevel;
      
      // Shadow gets smaller as ball goes higher
      const shadowScale = Math.max(0.05, baseScale - (this.ball.groundLevel - this.ball.y) / 500);
      this.ball.shadow.scale.set(shadowScale * 1.5, shadowScale * 0.5);
      
      // Shadow gets more transparent as ball goes higher
      const distance = Math.abs(this.ball.groundLevel - this.ball.y);
      this.ball.shadow.alpha = Math.max(0.1, Math.min(0.7, 1 - distance / 300));
    }
  }
  
  updateAnimations(delta) {
    // Update all active animations
    Object.values(this.animations).forEach(animation => {
      if (animation.active) {
        animation.progress += delta * animation.speed;
        
        // Check if animation is complete
        if (animation.progress >= 1) {
          animation.active = false;
          if (animation.onComplete) {
            animation.onComplete();
          }
        } else {
          // Update animation
          animation.update(animation.progress);
        }
      }
    });
  }
  
  checkWicketCollision() {
    if (!this.ball || !this.wickets) return false;
    
    // Use physics to check for collision
    return this.physics.checkWicketHit(
      this.ball,
      this.wickets.position,
      this.wickets.size
    );
  }
  
  // Clean up the game, remove listeners, etc.
  destroy() {
    // Stop all animations
    for (const key in this.animations) {
      if (this.animations[key]) {
        this.app.ticker.remove(this.animations[key]);
        this.animations[key] = null;
      }
    }
    
    // Remove event listeners
    window.removeEventListener('resize', this.handleResize.bind(this));
    
    // Destroy the PIXI application
    if (this.app) {
      this.app.destroy(true, true);
      this.app = null;
    }
    
    // Remove the canvas from the container
    if (this.container.children.length > 0) {
      this.container.innerHTML = '';
    }
  }
  
  bowlBall(bowlingData) {
    // Create ball if it doesn't exist
    if (!this.ball) {
      this.createBall();
    }
    
    // Get stage dimensions
    const stageWidth = this.app.screen.width;
    const stageHeight = this.app.screen.height;
    
    // Set ball initial position (bowler's end)
    this.ball.x = stageWidth / 2;
    this.ball.y = stageHeight / 2 + this.PITCH_LENGTH / 2 - 20;
    this.ball.z = 10;
    this.ball.groundLevel = stageHeight / 2;
    
    // Calculate ball trajectory based on bowling type
    const trajectory = this.physics.calculateBallTrajectory(bowlingData);
    
    // Set ball velocity and properties
    this.ball.velocityX = trajectory.velocityX;
    this.ball.velocityY = trajectory.velocityY;
    this.ball.velocityZ = trajectory.velocityZ;
    this.ball.spin = trajectory.spin;
    this.ball.inMotion = true;
    
    // Make ball visible
    this.ball.visible = true;
    this.ball.sprite.visible = true;
    if (this.ball.shadow) this.ball.shadow.visible = true;
    
    // Play bowling sound
    this.sounds.play('bowler_run', 0.6);
    
    // Animate bowler
    this.animateBowler();
    
    // Return ball for reference
    return this.ball;
  }
  
  createBall() {
    // Create ball container for physics properties
    this.ball = {
      x: 0,
      y: 0,
      z: 0,
      velocityX: 0,
      velocityY: 0, 
      velocityZ: 0,
      spin: 0,
      groundLevel: this.app.screen.height / 2,
      inMotion: false,
      visible: false
    };
    
    // Create ball sprite
    const ballGraphics = new PIXI.Graphics();
    ballGraphics.beginFill(0xED1C24);
    ballGraphics.drawCircle(0, 0, 50);
    ballGraphics.endFill();
    
    // Add seam
    ballGraphics.lineStyle(5, 0xFFFFFF, 0.8);
    ballGraphics.arc(0, 0, 35, 0, Math.PI);
    
    // Convert to sprite for better performance
    const ballTexture = this.app.renderer.generateTexture(ballGraphics);
    this.ball.sprite = new PIXI.Sprite(ballTexture);
    this.ball.sprite.anchor.set(0.5);
    this.ball.sprite.scale.set(0.1);
    this.ball.sprite.visible = false;
    this.app.stage.addChild(this.ball.sprite);
    
    // Create shadow
    const shadowGraphics = new PIXI.Graphics();
    shadowGraphics.beginFill(0x000000, 0.5);
    shadowGraphics.drawEllipse(0, 0, 50, 20);
    shadowGraphics.endFill();
    
    const shadowTexture = this.app.renderer.generateTexture(shadowGraphics);
    this.ball.shadow = new PIXI.Sprite(shadowTexture);
    this.ball.shadow.anchor.set(0.5);
    this.ball.shadow.scale.set(0.1);
    this.ball.shadow.visible = false;
    this.app.stage.addChild(this.ball.shadow);
  }
  
  playShot(shotData) {
    // Skip if ball is not in motion or not near batsman
    if (!this.ball || !this.ball.inMotion) {
      return { success: false, message: 'No ball in play' };
    }
    
    // Check if ball is in the hitting zone
    const batsmanPosition = {
      x: this.app.screen.width / 2,
      y: this.app.screen.height / 2 - this.PITCH_LENGTH / 2 + 20
    };
    
    const distanceToBatsman = Math.sqrt(
      Math.pow(this.ball.x - batsmanPosition.x, 2) + 
      Math.pow(this.ball.y - batsmanPosition.y, 2)
    );
    
    // If ball is not close to batsman yet
    if (distanceToBatsman > 50) {
      return { 
        success: false, 
        message: 'Ball not in hitting zone',
        timing: -1 
      };
    }
    
    // Calculate hit timing (-1 to 1, with 0 being perfect)
    const timing = (distanceToBatsman - 25) / 25;
    
    // Create bat if it doesn't exist
    if (!this.batsman.bat) {
      this.createBat();
    }
    
    // Calculate collision result
    const result = this.physics.calculateBatBallCollision(
      this.batsman.bat, 
      this.ball, 
      { ...shotData, timing }
    );
    
    // If successful hit
    if (result.collision) {
      // Animate bat swing
      this.animateBatSwing(shotData.direction);
      
      // Play appropriate sound
      if (result.outcome === 'boundary') {
        this.sounds.play('boundary', 0.8);
        setTimeout(() => this.sounds.play('crowd_cheer', 0.6), 500);
      } else if (result.outcome === 'wicket') {
        this.sounds.play('bat_hit', 0.3);
      } else {
        this.sounds.play('bat_hit', 0.7);
      }
      
      return { 
        success: true, 
        outcome: result.outcome,
        timing: timing,
        power: result.timingFactor
      };
    }
    
    // Miss
    return { 
      success: false,
      message: 'Missed the ball',
      timing
    };
  }
  
  createBat() {
    const batGraphics = new PIXI.Graphics();
    
    // Handle
    batGraphics.beginFill(0x8B4513);
    batGraphics.drawRect(-5, -80, 10, 60);
    batGraphics.endFill();
    
    // Blade
    batGraphics.beginFill(0xE0C9A6);
    batGraphics.drawRoundedRect(-15, -20, 30, 120, 5);
    batGraphics.endFill();
    
    // Convert to sprite
    const batTexture = this.app.renderer.generateTexture(batGraphics);
    
    if (!this.batsman) {
      this.batsman = {};
    }
    
    this.batsman.bat = new PIXI.Sprite(batTexture);
    this.batsman.bat.anchor.set(0.5, 1);
    this.batsman.bat.scale.set(0.5);
    this.batsman.bat.rotation = -Math.PI / 4; // 45 degrees
    this.batsman.bat.position.set(
      this.app.screen.width / 2, 
      this.app.screen.height / 2 - this.PITCH_LENGTH / 2 + 40
    );
    
    this.app.stage.addChild(this.batsman.bat);
  }
  
  animateBatSwing(direction) {
    if (!this.batsman || !this.batsman.bat) return;
    
    // Store initial rotation
    const initialRotation = this.batsman.bat.rotation;
    
    // Create animation
    this.animations.batSwing = {
      active: true,
      progress: 0,
      speed: 0.1,
      update: (progress) => {
        // Swing animation curve using sine
        const swingCurve = Math.sin(progress * Math.PI);
        
        // Determine swing direction
        const swingDirection = direction > 0 ? 1 : -1;
        
        // Rotate bat
        this.batsman.bat.rotation = initialRotation + (swingDirection * Math.PI * 0.75 * swingCurve);
      },
      onComplete: () => {
        // Reset bat position
        this.batsman.bat.rotation = initialRotation;
      }
    };
  }
  
  animateBowler() {
    if (!this.bowler) return;
    
    // Store initial position
    const initialX = this.bowler.x;
    const initialY = this.bowler.y;
    
    // Create animation
    this.animations.bowling = {
      active: true,
      progress: 0,
      speed: 0.03,
      update: (progress) => {
        // Bowling animation sequence
        if (progress < 0.3) {
          // Run up
          this.bowler.y = initialY + (progress / 0.3) * 50;
        } else if (progress < 0.5) {
          // Jumping
          const jumpProgress = (progress - 0.3) / 0.2;
          this.bowler.y = initialY + 50 - (Math.sin(jumpProgress * Math.PI) * 30);
        } else if (progress < 0.7) {
          // Arm action
          this.bowler.y = initialY;
        } else {
          // Follow through
          const followProgress = (progress - 0.7) / 0.3;
          this.bowler.y = initialY - (followProgress * 20);
        }
      },
      onComplete: () => {
        // Reset bowler position
        this.bowler.x = initialX;
        this.bowler.y = initialY;
      }
    };
  }
}

export default CricketGame;
