import React, { Component } from 'react';

export class LandscapeMessage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isPortrait: false
    };
    this.checkOrientation = this.checkOrientation.bind(this);
  }

  componentDidMount() {
    this.checkOrientation();
    window.addEventListener('resize', this.checkOrientation);
    window.addEventListener('orientationchange', this.checkOrientation);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.checkOrientation);
    window.removeEventListener('orientationchange', this.checkOrientation);
  }

  checkOrientation() {
    const isPortrait = window.matchMedia("(orientation: portrait)").matches;
    this.setState({ isPortrait });
  }

  render() {
    if (!this.state.isPortrait) return null;
    
    return (
      <div className="landscape-message">
        <div>
          <span style={{ fontSize: '10vh' }}>📱</span>
          <span style={{ fontSize: '8vh' }}>↺</span>
        </div>
        <p>Please rotate your device to landscape mode for the best experience.</p>
      </div>
    );
  }
}

export default LandscapeMessage;