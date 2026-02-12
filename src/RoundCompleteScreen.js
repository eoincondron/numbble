import React from 'react';
import './EndGameScreen.css'; // Reuse the same CSS

function RoundCompleteScreen(props) {
    const {
        equation,
        timeString,
        scoreResult,
        currentRound,
        totalRounds,
        onContinue
    } = props;

    // Parse the score message to extract components
    const lines = scoreResult.scoreMessage.split('\n').filter(line => line.trim());
    const baseScoreLine = lines.find(line => line.includes('Base Score'));
    const baseScore = baseScoreLine ? baseScoreLine.split(':')[1].trim() : '';
    const bonuses = lines.filter(line =>
        line.includes('Bonus') || line.includes('bonus') || line.includes('using all')
    );

    return (
        <div className="end-game-overlay">
            <div className="end-game-panel">
                <h1 className="end-game-title">Correct! ✓</h1>

                <div className="round-equation">
                    {equation}
                </div>

                <div className="end-game-stats">
                    <div className="stat-item">
                        <span className="stat-label">Time:</span>
                        <span className="stat-value">{timeString}</span>
                    </div>

                    <div className="stat-item">
                        <span className="stat-label">Base Score:</span>
                        <span className="stat-value">{baseScore}</span>
                    </div>

                    {bonuses.map((bonus, index) => (
                        <div key={index} className="stat-item bonus-item">
                            <span className="stat-label bonus-label">{bonus}</span>
                        </div>
                    ))}

                    <div className="stat-divider"></div>

                    <div className="stat-item main-stat">
                        <span className="stat-label">Round Score:</span>
                        <span className="stat-value game-score">{scoreResult.finalScore}</span>
                    </div>

                    <div className="stat-item">
                        <span className="stat-label">Progress:</span>
                        <span className="stat-value">Round {currentRound}/{totalRounds}</span>
                    </div>
                </div>

                <button className="new-game-button" onClick={onContinue}>
                    Continue to Next Round
                </button>
            </div>
        </div>
    );
}

export default RoundCompleteScreen;
