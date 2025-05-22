// Sound effects manager for the cricket game
class SoundEffects {
  constructor() {
    this.sounds = {};
    this.loadSounds();
    this.muted = false;
  }

  loadSounds() {
    // Define all game sounds
    const soundFiles = {
      bat_hit: '/sounds/bat_hit.mp3',
      boundary: '/sounds/boundary.mp3',
      wicket: '/sounds/wicket.mp3',
      crowd_cheer: '/sounds/crowd_cheer.mp3',
      bowler_run: '/sounds/bowler_run.mp3',
      ball_bounce: '/sounds/ball_bounce.mp3',
      game_start: '/sounds/game_start.mp3',
      toss_coin: '/sounds/toss_coin.mp3',
      victory: '/sounds/victory.mp3',
      menu_click: '/sounds/menu_click.mp3'
    };

    // Load each sound
    Object.entries(soundFiles).forEach(([key, path]) => {
      const audio = new Audio(path);
      this.sounds[key] = audio;
      audio.preload = 'auto';
    });
  }

  play(soundName, volume = 1.0) {
    if (this.muted || !this.sounds[soundName]) return;
    
    // Create a new audio instance from the original to allow overlapping sounds
    const sound = this.sounds[soundName].cloneNode();
    sound.volume = volume;
    sound.play().catch(err => console.error('Error playing sound:', err));
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  setMuted(value) {
    this.muted = !!value;
  }
}

export default SoundEffects;
