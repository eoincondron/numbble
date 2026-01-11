import React from 'react';
import './EndGameScreen.css';

function EndGameScreen(props) {
    const {
        gameScore,
        roundsCompleted,
        onNewGame,
        sessionTotalScore,
        gamesCompleted
    } = props;

    return (
        <div className="end-game-overlay">
            <div className="end-game-panel">
                <h1 className="end-game-title">Game Complete!</h1>

                <div className="end-game-stats">
                    <div className="stat-item">
                        <span className="stat-label">Rounds Completed:</span>
                        <span className="stat-value">{roundsCompleted}</span>
                    </div>

                    <div className="stat-item main-stat">
                        <span className="stat-label">Game Score:</span>
                        <span className="stat-value game-score">{gameScore}</span>
                    </div>

                    <div className="stat-divider"></div>

                    <div className="stat-item">
                        <span className="stat-label">Session Total:</span>
                        <span className="stat-value">{sessionTotalScore}</span>
                    </div>

                    <div className="stat-item">
                        <span className="stat-label">Games Played:</span>
                        <span className="stat-value">{gamesCompleted}</span>
                    </div>
                </div>

                <button className="new-game-button" onClick={onNewGame}>
                    Start New Game
                </button>
            </div>
        </div>
    );
}

export default EndGameScreen;
