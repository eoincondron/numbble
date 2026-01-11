import React, { Component } from 'react';
import VolumeControl from './VolumeControl';
import './SettingsMenu.css';

const BACKGROUNDS = [
    { id: 'solid', name: 'Indigo', class: 'bg-solid' },
    { id: 'grid', name: 'Teal Grid', class: 'bg-grid' },
    { id: 'dots', name: 'Purple Dots', class: 'bg-dots' },
    { id: 'waves', name: 'Orange Waves', class: 'bg-waves' },
    { id: 'circuit', name: 'Blue Circuit', class: 'bg-circuit' }
];

class SettingsMenu extends Component {
    constructor(props) {
        super(props);
        this.state = {
            inputValue: props.roundsPerGame.toString()
        };
    }

    componentDidUpdate(prevProps) {
        // Sync input value when prop changes externally
        if (prevProps.roundsPerGame !== this.props.roundsPerGame) {
            this.setState({ inputValue: this.props.roundsPerGame.toString() });
        }
        // Reset input value when opening the menu
        if (!prevProps.isOpen && this.props.isOpen) {
            this.setState({ inputValue: this.props.roundsPerGame.toString() });
        }
    }

    toggleMenu = () => {
        this.props.onToggleMenu();
    };

    closeMenu = () => {
        this.props.onCloseMenu();
    };

    render() {
        const {
            isOpen,
            backgroundClass,
            onBackgroundChange,
            roundsPerGame,
            onRoundsPerGameChange
        } = this.props;

        return (
            <div className="settings-container">
                <button
                    className="settings-button"
                    onClick={this.toggleMenu}
                    aria-label="Settings"
                >
                    <span className="settings-icon">⚙</span>
                </button>

                {isOpen && (
                    <div className="settings-overlay" onClick={this.closeMenu}>
                        <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
                            <div className="settings-header">
                                <h2>Settings</h2>
                                <button
                                    className="settings-close"
                                    onClick={this.closeMenu}
                                    aria-label="Close settings"
                                >
                                    <span className="close-icon">✕</span>
                                </button>
                            </div>

                            <div className="settings-content">
                                {/* Rounds per game setting */}
                                <div className="setting-item">
                                    <label htmlFor="rounds-per-game">Rounds per Game:</label>
                                    <input
                                        id="rounds-per-game"
                                        type="number"
                                        min="1"
                                        max="50"
                                        value={this.state.inputValue}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            // Update local state immediately to allow editing
                                            this.setState({ inputValue: value });

                                            // Only update parent if valid
                                            if (value !== '') {
                                                const num = parseInt(value, 10);
                                                if (!isNaN(num) && num >= 1 && num <= 50) {
                                                    onRoundsPerGameChange(num);
                                                }
                                            }
                                        }}
                                        onBlur={() => {
                                            // On blur, ensure we have a valid value
                                            const value = this.state.inputValue;
                                            if (value === '' || isNaN(parseInt(value, 10))) {
                                                this.setState({ inputValue: '10' });
                                                onRoundsPerGameChange(10);
                                            } else {
                                                const num = parseInt(value, 10);
                                                if (num < 1) {
                                                    this.setState({ inputValue: '1' });
                                                    onRoundsPerGameChange(1);
                                                } else if (num > 50) {
                                                    this.setState({ inputValue: '50' });
                                                    onRoundsPerGameChange(50);
                                                }
                                            }
                                        }}
                                        className="rounds-input"
                                    />
                                </div>

                                {/* Background selector */}
                                <div className="setting-item">
                                    <label htmlFor="background-select">Background:</label>
                                    <select
                                        id="background-select"
                                        value={backgroundClass}
                                        onChange={(e) => onBackgroundChange(e.target.value)}
                                        className="background-select"
                                    >
                                        {BACKGROUNDS.map(bg => (
                                            <option key={bg.id} value={bg.class}>
                                                {bg.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Volume control */}
                                <div className="setting-item">
                                    <label>Volume:</label>
                                    <div className="volume-container">
                                        <VolumeControl />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default SettingsMenu;
