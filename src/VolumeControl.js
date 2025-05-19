import React, { Component } from 'react';
import soundManager from './SoundManager';

export class VolumeControl extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isMuted: soundManager.isMuted
    };
  }

  toggleMute = () => {
    const newMutedState = soundManager.toggleMute();
    this.setState({ isMuted: newMutedState });
    // Play a test sound if unmuting
    if (!newMutedState) {
      soundManager.playButtonClick();
    }
  };

  render() {
    return (
      <button
        className="volume-control rounded-md shadow-md flex items-center justify-center transition-all hover:shadow-lg"
        onClick={this.toggleMute}
        title={this.state.isMuted ? "Unmute" : "Mute"}
      >
        {this.state.isMuted ? "🔇" : "🔊"}
      </button>
    );
  }
}

export default VolumeControl;