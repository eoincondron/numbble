// SoundManager.js
// A module to handle all sound effects for the Numbble game

class SoundManager {
  constructor() {
    this.sounds = {};
    this.isMuted = false;
    this.volume = 0.5; // Default volume (0-1)
    
    // Preload sounds
    this.loadSound('click', '/sounds/mixkit-message-pop-alert-2354.mp3');
    this.loadSound('pop', '/sounds/mixkit-light-button-2580.wav');
    this.loadSound('success', '/sounds/pop.mp3');
    this.loadSound('error', '/sounds/error.mp3');
  }
  
  // Load a sound file
  loadSound(name, path) {
    const audio = new Audio(path);
    audio.volume = this.volume;
    this.sounds[name] = audio;
  }
  
  // Play a sound by name
  playSound(name) {
    if (this.isMuted || !this.sounds[name]) return;
    
    // Create a new audio element from the original to allow overlapping sounds
    const soundToPlay = this.sounds[name].cloneNode();
    soundToPlay.volume = this.volume;
    
    // Play the sound
    soundToPlay.play().catch(error => {
      // Handle any autoplay restrictions quietly
      console.log(`Error playing sound ${name}:`, error);
    });
  }
  
  // Toggle mute status
  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }
  
  // Set volume (0-1)
  setVolume(level) {
    if (level >= 0 && level <= 1) {
      this.volume = level;
      
      // Update volume for all loaded sounds
      Object.values(this.sounds).forEach(sound => {
        sound.volume = this.volume;
      });
    }
  }
  
  // Sound effect functions for specific game actions
  
  // Tile placement sounds
  playTilePlaced() {
    this.playSound('pop');
  }
  
  // Button click sounds
  playButtonClick() {
    this.playSound('click');
  }
  
  // Success sound (correct equation)
  playSuccess() {
    this.playSound('success');
  }
  
  // Error sound (incorrect equation)
  playError() {
    this.playSound('error');
  }
}

// Create and export singleton instance
const soundManager = new SoundManager();
export default soundManager;