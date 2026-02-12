import React, { Component } from 'react';
import ReactDOM from 'react-dom'
// import logo from './logo.svg';
import './App.css';
import {
    DormantBracketTile,
    DormantOpTile,
    Equation,
    NumTile,
    PlacedOpTile,
    PlayButton,
    ResetTile,
    SessionScore,
    SkipTile,
    Spacer,
    WaitingBracketTile,
    WaitingOpTile
} from './divs';
import soundManager from './SoundManager';
import SettingsMenu from './SettingsMenu';
import EndGameScreen from './EndGameScreen';
import RoundCompleteScreen from './RoundCompleteScreen';
import LandscapeMessage from './LandscapeMessage';
import { TileArray } from "./tile_array";
import {
    _isSpaceFiller,
    BRACKETS,
    count_element,
    EMPTY,
    EQUALS, EXPONENTS,
    L_BRACKET,
    MINUS,
    OP_SCORES,
    OPERATIONS,
    R_BRACKET,
    SPACE,
    SQRT,
    SQUARE,
    DECIMAL_POINT,
} from "./util";

let ALL_OP_SYMBOLS = OPERATIONS.concat(BRACKETS).concat([EQUALS])
let ONE_USE_OPS = [SQUARE, SQRT]
// Find a better way to state the ordering of the operation tiles.

let N_TILES = 6;
let N_SPACES = N_TILES - 1;
let TILE_WIDTH = Math.round(window.innerWidth * .06);
// LEFT_MARGIN will be calculated after TILE_WIDTH is defined
let LEFT_MARGIN;


//  =================================== ===


// Tile movements are managed as follows; 
// Each space can be flagged with a number corresponding to an operator and that operator fills the space. 
// Alternatively, the space can be flagged as a joining space such that the adjacent numbers join together to cover the space. 


function get_common_style_attributes(left_position) {
    return {
        left: left_position + 'px',
        width: 'max(6dvw, 8dvh)',
        height: 'max(6dvw, 8dvh)',
    }
}

class Board extends Component {

    constructor(props) {
        super(props);
        // Calculate LEFT_MARGIN here to ensure TILE_WIDTH is defined
        LEFT_MARGIN = window.innerWidth / 2 - (N_TILES * TILE_WIDTH / 2);

        const roundsPerGame = 5; // Default value
        const preGeneratedRounds = this.generateRounds(roundsPerGame);

        this.state = {
            // Game structure
            roundsPerGame: roundsPerGame,
            preGeneratedRounds: preGeneratedRounds,
            currentRoundIndex: 0,
            gameScore: 0,
            isGameComplete: false,

            // Current round state
            ...this.loadRound(preGeneratedRounds[0]),

            // UI state
            backgroundClass: 'bg-grid',
            timer: 0,
            isTimerRunning: false,
            isSettingsOpen: false,
            isRoundComplete: false,
            roundCompleteData: null,

            // Session state
            totalScore: 0,
            gamesCompleted: 0
        };

        this.timerInterval = null;
        this.startTimer = this.startTimer.bind(this);
        this.stopTimer = this.stopTimer.bind(this);
        this.resetTimer = this.resetTimer.bind(this);
        this.formatTime = this.formatTime.bind(this);
    }

    componentDidMount() {
        // Start the timer when component mounts
        this.startTimer();
    }

    componentWillUnmount() {
        // Clear timer when component unmounts
        this.stopTimer();
    }

    startTimer() {
        if (!this.timerInterval) {
            this.setState({ isTimerRunning: true });
            this.timerInterval = setInterval(() => {
                this.setState(prevState => ({
                    timer: prevState.timer + 1
                }));
            }, 1000);
        }
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
            this.setState({ isTimerRunning: false });
        }
    }

    resetTimer() {
        this.stopTimer();
        this.setState({ timer: 0 }, () => {
            this.startTimer();
        });
    }

    generateRounds(count) {
        // Pre-generate all rounds for the game
        const rounds = [];
        for (let i = 0; i < count; i++) {
            rounds.push(new TileArray(N_TILES));
        }
        return rounds;
    }

    loadRound(tileArray) {
        // Load a specific round into the board state
        return {
            tile_array: tileArray,
            active_op: EMPTY,
            active_space: -1
        };
    }

    populate_board() {
        let tile_array = new TileArray(N_TILES);

        return {
            tile_array: tile_array,
            active_op: EMPTY,
            active_space: -1
        };
    }

    startNewGame() {
        // Start a completely new game with new rounds
        const preGeneratedRounds = this.generateRounds(this.state.roundsPerGame);

        this.setState({
            preGeneratedRounds: preGeneratedRounds,
            currentRoundIndex: 0,
            gameScore: 0,
            totalScore: 0,
            gamesCompleted: 0,
            isGameComplete: false,
            isRoundComplete: false,
            roundCompleteData: null,
            ...this.loadRound(preGeneratedRounds[0])
        });

        this.resetTimer();
    }

    advanceToNextRound(scoreForThisRound) {
        const nextIndex = this.state.currentRoundIndex + 1;
        const newGameScore = this.state.gameScore + scoreForThisRound;

        if (nextIndex >= this.state.roundsPerGame) {
            // Game is complete
            this.stopTimer();
            soundManager.playGameComplete();
            this.setState({
                isGameComplete: true,
                gameScore: newGameScore,
                totalScore: this.state.totalScore + newGameScore,
                gamesCompleted: this.state.gamesCompleted + 1
            });
        } else {
            // Load next round
            this.setState({
                currentRoundIndex: nextIndex,
                gameScore: newGameScore,
                ...this.loadRound(this.state.preGeneratedRounds[nextIndex])
            });
            this.resetTimer();
        }
    }

    updateRoundsPerGame(newValue) {
        // Update the setting and start a new game
        const preGeneratedRounds = this.generateRounds(newValue);
        this.setState({
            roundsPerGame: newValue,
            preGeneratedRounds: preGeneratedRounds,
            currentRoundIndex: 0,
            gameScore: 0,
            isGameComplete: false,
            ...this.loadRound(preGeneratedRounds[0])
        });
        this.resetTimer();
    }

    activate_op(op_string) {
        this.setState({ active_op: op_string })
        if (this.state.active_space === -1) {
            this.setState({ active_space: 0 })
        }
    }

    deactivate_op() {
        this.setState({ active_op: EMPTY })
        this.setState({ active_space: -1 })
    }

    renderNumTile(array_pos, left_position) {
        let value = this.state.tile_array.string_array[array_pos]

        // Handle drop for drag and drop of brackets
        const handleDrop = (bracket) => {
            // Set this bracket as active
            this.setState({ active_op: bracket }, () => {
                // Then trigger the number click handler to place the bracket
                this.handleNumClick(array_pos);
            });
        };

        return (
            <NumTile
                value={value}
                style={get_common_style_attributes(left_position)}
                onClick={
                    () => this.handleNumClick(array_pos)
                }
                onDrop={handleDrop}
            />
        );
    }

    _insertBrackets(array_pos) {
        // Insert brackets at array pos if current active op is a bracket and return boolean indicating if we did
        // This could be the place for automatically activating a second bracket.
        let outstanding_bracket = EMPTY;
        this.state.tile_array._insert_bracket(this.state.active_op, array_pos);
        this.deactivate_op()
        outstanding_bracket = this.state.tile_array._outstanding_bracket();
        if (outstanding_bracket !== EMPTY) {
            this.activate_op(outstanding_bracket)
        }
    }

    handleNumClick(array_pos) {
        let ta = this.state.tile_array
        if (BRACKETS.includes(this.state.active_op)) {
            this._insertBrackets(array_pos)
        }
        else if (this.state.active_op === MINUS) {
            ta.negate_number(array_pos)
            this.deactivate_op()
        }
        else if (this.state.active_op.startsWith('**')) {
            // Apply exponent to the number by concatenating the string
            ta._appendExponent(array_pos, this.state.active_op)
            this.deactivate_op()
        }
        else if (this.state.active_op === EMPTY) {
            ta.undress_number(array_pos)
        }
        this.setState({})
    }

    // BRACKETS TILES
    _getBracketValue(is_left) {
        return is_left ? L_BRACKET : R_BRACKET
    }

    renderDormantBracketTile(is_left, left_position) {
        return (<DormantBracketTile
            value={this._getBracketValue(is_left)}
            style={{
                left: left_position + 'px',
                width: 'max(3dvw, 4dvh)',
                height: 'max(6dvw, 8dvh)',
            }}
            onClick={
                () => this.handleDormantBracketClick(is_left)
            }
        />
        );
    }

    handleDormantBracketClick(is_left) {
        soundManager.playButtonClick();
        this.activate_op(this._getBracketValue(is_left))
    }

    renderWaitingBracketTile(is_left, left_position) {
        return (<WaitingBracketTile
            value={this._getBracketValue(is_left)}
            style={{
                left: left_position + 'px',
                width: 'max(3dvw, 4dvh)',
                height: 'max(6dvw, 8dvh)',
            }}
            onClick={
                () => this.handleWaitingClick()
            }
        />
        );
    }

    //
    handleWaitingClick() {
        // reset to dormant
        this.deactivate_op()
    }

    renderUnplacedBracketTile(is_left, left_position) {
        let bracket = this._getBracketValue(is_left);
        if (this.state.active_op === bracket) {
            return this.renderWaitingBracketTile(is_left, left_position)
        } else {
            return this.renderDormantBracketTile(is_left, left_position)
        }
    }

    // OP TILES
    renderDormantOpTile(op_string, left_position) {
        return (<DormantOpTile
            value={op_string}
            style={get_common_style_attributes(left_position)}
            onClick={
                () => this.handleDormantOpClick(op_string)
            }
        />
        );
    }

    //
    handleDormantOpClick(op_string) {
        soundManager.playButtonClick();
        this.activate_op(op_string)
    }

    renderWaitingOpTile(op_string, left_position) {
        return (<WaitingOpTile
            value={op_string}
            style={get_common_style_attributes(left_position)}
            onClick={
                () => this.handleWaitingClick()
            }
        />
        );
    }

    renderUnplacedOpTile(op_string, left_position) {
        if (this.state.active_op === op_string) {
            return this.renderWaitingOpTile(op_string, left_position)
        } else {
            return this.renderDormantOpTile(op_string, left_position)
        }
    }

    renderPlacedOpTile(array_pos, left_position) {
        let value = this.state.tile_array.string_array[array_pos];
        return (<PlacedOpTile
            value={value}
            style={get_common_style_attributes(left_position)}
            onClick={
                () => this.handlePlacedOpTileClick(array_pos)
            }
        />
        );
    }

    handlePlacedOpTileClick(array_pos) {
        this.state.tile_array.remove_operation(array_pos)
        this.setState({})
        if (_isSpaceFiller(this.state.active_op)) {
            this.state.tile_array.insert_operation(array_pos, this.state.active_op);
            this.deactivate_op();
        }
    }

    // SPACE TILES
    renderSpacer(array_pos, left_position) {
        // Determine if this space should be highlighted (when an operator is active)
        let space_count = count_element(SPACE, this.state.tile_array.string_array.slice(0, array_pos + 1))
        const isHighlighted = _isSpaceFiller(this.state.active_op);
        const isActive = space_count === this.state.active_space + 1

        // Handle drop for drag and drop
        const handleDrop = (operator) => {
            // Set this operator as active
            this.setState({ active_op: operator }, () => {
                // Then trigger the space click handler
                this.handleSpaceClick(array_pos);
            });
        };

        return (<Spacer
            isHighlighted={isHighlighted}
            isActive={isActive}
            style={get_common_style_attributes(left_position)}
            onClick={() => this.handleSpaceClick(array_pos)}
            onDrop={handleDrop}
        />
        );
    }

    //
    handleSpaceClick(array_pos) {
        if (this.state.active_op === EMPTY) {
            soundManager.playTilePlaced();
            this.state.tile_array.join_numbers(array_pos, this.state.active_op)
            this.setState({});
        } else if (_isSpaceFiller(this.state.active_op)) {
            soundManager.playTilePlaced();
            this.state.tile_array.insert_operation(array_pos, this.state.active_op)
            this.deactivate_op()
        } else if (L_BRACKET === this.state.active_op) {
            this.state.tile_array.insert_left_bracket(array_pos + 1)
            this.deactivate_op()
        } else if (R_BRACKET === this.state.active_op) {
            this.state.tile_array.insert_right_bracket(array_pos - 1)
            this.deactivate_op()
        } else {
            alert("Cannot place that " + this.state.active_op + " in the space. Please select a valid operator or join the numbers.")
        }
    }

    renderReset() {
        return (<ResetTile
            onClick={
                () => this.handleResetClick()}
        />
        );
    }

    handleResetClick() {
        soundManager.playButtonClick();
        this.deactivate_op();
        this.state.tile_array.reset_board();
        // Don't reset the timer when the reset button is hit
        // Only reset timer after successful equation evaluation
        // TODO: this is currently generating a new board
    }

    renderSkip() {
        return (<SkipTile
            onClick={
                () => this.handleSkipClick()}
        />
        );
    }

    handleSkipClick() {
        // Skip to the next round in the game with 0 score
        soundManager.playButtonClick();
        this.deactivate_op();
        this.advanceToNextRound(0);
    }

    renderEquation() {
        let eq;
        try {
            // Try to get the evaluable equation instead of the display string
            eq = this.state.tile_array.build_equation(false);
            eq = "Your Equation:\n" + eq;
        } catch (error) {
            // If there's an error building the equation (like no equals sign yet),
            // just display a placeholder message
            eq = "Your Equation:\n";
        }
        return (<Equation
            equation={eq}
        />
        );
    };

    renderPlay() {
        return (<PlayButton
            onClick={
                () => this.handlePlayClick()}
        />)
    }

    renderSettingsMenu() {
        return (
            <SettingsMenu
                backgroundClass={this.state.backgroundClass}
                onBackgroundChange={(backgroundClass) => this.setState({ backgroundClass })}
                roundsPerGame={this.state.roundsPerGame}
                onRoundsPerGameChange={(value) => this.updateRoundsPerGame(value)}
                isOpen={this.state.isSettingsOpen}
                onToggleMenu={() => this.setState(prevState => ({ isSettingsOpen: !prevState.isSettingsOpen }))}
                onCloseMenu={() => this.setState({ isSettingsOpen: false })}
            />
        );
    }

    renderRoundCompleteScreen() {
        if (!this.state.isRoundComplete || !this.state.roundCompleteData) return null;

        return (
            <RoundCompleteScreen
                equation={this.state.roundCompleteData.equation}
                timeString={this.state.roundCompleteData.timeString}
                scoreResult={this.state.roundCompleteData.scoreResult}
                currentRound={this.state.roundCompleteData.currentRound}
                totalRounds={this.state.roundCompleteData.totalRounds}
                onContinue={() => this.handleContinueToNextRound()}
            />
        );
    }

    renderEndGameScreen() {
        if (!this.state.isGameComplete) return null;

        return (
            <EndGameScreen
                gameScore={this.state.gameScore}
                roundsCompleted={this.state.roundsPerGame}
                sessionTotalScore={this.state.totalScore}
                gamesCompleted={this.state.gamesCompleted}
                onNewGame={() => this.startNewGame()}
            />
        );
    }

    handleContinueToNextRound() {
        const score = this.state.roundCompleteData.score;

        // Hide the round complete screen
        this.setState({
            isRoundComplete: false,
            roundCompleteData: null
        });

        // Advance to next round or complete the game
        this.advanceToNextRound(score);
    }

    calculateScore(equation, time) {
        // Calculate the score based on operators used in the equation
        let score = 0;

        // Score exponents first and then remove as they are multi-character and SQRT contains a decimal point
        // which we don't want to score twice.
        for (const exp of EXPONENTS) {
            if (equation.includes(exp)) {
                score += OP_SCORES[exp];
                equation = equation.replace(exp, '')
            }
        }
        // Loop through each character in the equation
        let current_num = '';
        for (const char of equation) {
            // If this character is an operator with a score, add it
            if (OP_SCORES[char] !== undefined) {
                score += OP_SCORES[char];
                if (current_num.length > 1) {
                    score += (current_num.length - 1) * 25;
                }
                current_num = '';
            } else {
                current_num += char;
            }
        }

        let scoreMessage = `Base Score: ${score} points\n`;

        const used_all_nums = !this.state.tile_array.string_array.includes(SPACE)
        if (used_all_nums) {
            score += 50
            scoreMessage += "50 Bonus points for using all numbers!!\n"
        }

        // Apply time bonus multiplier
        let timeBonus = 1.0; // Default multiplier
        if (time < 15) {
            // Double score if solved under 15 seconds
            timeBonus = 2.0;
            scoreMessage += "Speed Bonus: 2× (under 15 seconds)\n";
        } else if (time < 60) {
            // 1.5× multiplier if solved under 60 seconds
            timeBonus = 1.5;
            scoreMessage += "Speed Bonus: 1.5× (under 60 seconds)\n";
        }
        // Calculate final score with time bonus

        const finalScore = Math.round(score * timeBonus);
        scoreMessage += `Final Score: ${finalScore} points`;

        return {
            finalScore: finalScore,
            scoreMessage: scoreMessage
        };
    }

    handlePlayClick() {
        let eq = this.state.tile_array.build_equation(false);
        let eval_eq = this.state.tile_array.build_equation(true);

        // Check if there's at least one equals sign
        if (!eval_eq.includes('===')) {
            soundManager.playError();
            alert('Please include at least one equals sign (=) in your equation.');
            return;
        }

        let sides = eval_eq.split('===')
        let side_vals = sides.map(x => eval(x))

        console.log(`Evaluating equation: ${eval_eq}`);
        console.log(`Side values: ${side_vals}`);

        const allEqual = side_vals.every(val => val === side_vals[0]);

        if (allEqual) {
            // Play success sound
            soundManager.playSuccess();

            // Stop the timer on successful solution
            this.stopTimer();
            const time = this.state.timer;
            const timeString = this.formatTime(time);

            // Calculate the score for this equation with time bonus
            const scoreResult = this.calculateScore(eq, time);

            // Show round complete screen
            this.setState({
                isRoundComplete: true,
                roundCompleteData: {
                    equation: eq,
                    timeString: timeString,
                    scoreResult: scoreResult,
                    currentRound: this.state.currentRoundIndex + 1,
                    totalRounds: this.state.roundsPerGame,
                    score: scoreResult.finalScore
                }
            });
        } else {
            // Play error sound
            soundManager.playError();
            let simplified = side_vals.join(' = ')
            alert(`Sorry, the equation is invalid: ${eq} \n (Simplifies to ${simplified})`);
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    renderTimer() {
        const timeString = this.formatTime(this.state.timer);
        return (
            <div className="timer">
                {timeString}
            </div>
        );
    }

    renderSessionScore() {
        return (
            <SessionScore
                totalScore={this.state.totalScore}
                gameScore={this.state.gameScore}
                gamesCompleted={this.state.gamesCompleted}
                currentRound={this.state.currentRoundIndex + 1}
                totalRounds={this.state.roundsPerGame}
            />
        );
    }


    buildNumberRowElements() {
        const tiles = this.state.tile_array.string_array;
        const totalWidth = TILE_WIDTH * tiles.length;
        // Center the array horizontally
        let left_position = (window.innerWidth - totalWidth) / 2;

        const tiles_array = this.state.tile_array.string_array;
        let objs = [];

        for (let array_pos = 0; array_pos < tiles_array.length; array_pos++) {
            let content = tiles_array[array_pos];
            if (content === SPACE) {
                objs.push(this.renderSpacer(array_pos, left_position))
                left_position += TILE_WIDTH;
            } else if (_isSpaceFiller(content)) {
                objs.push(this.renderPlacedOpTile(array_pos, left_position))
                left_position += TILE_WIDTH;
            } else {
                objs.push(this.renderNumTile(array_pos, left_position))
                left_position += TILE_WIDTH;
            }
        }
        return objs
    }

    buildOperationsRowElements() {
        const tiles_array = this.state.tile_array.string_array;
        let objs = [];

        // Center the operations row
        const totalOperationsWidth = OPERATIONS.length * TILE_WIDTH + TILE_WIDTH * 2; // Including brackets
        let left_position = (window.innerWidth - totalOperationsWidth) / 2;

        for (let op_string of OPERATIONS) {
            let skip = ONE_USE_OPS.includes(op_string) && tiles_array.join('').includes(op_string)
            if (!skip)
                objs.push(this.renderUnplacedOpTile(op_string, left_position));
            left_position += TILE_WIDTH;
        }

        for (let is_left of [true, false]) {
            objs.push(this.renderUnplacedBracketTile(is_left, left_position));
            left_position += TILE_WIDTH / 2;
        }

        left_position += TILE_WIDTH / 2;
        objs.push(this.renderUnplacedOpTile(EQUALS, left_position));

        return objs
    }

    render() {
        // Calculate the total width needed for all tiles
        TILE_WIDTH = Math.round(window.innerWidth * .06);

        let objs = this.buildOperationsRowElements();
        objs = objs.concat(this.buildNumberRowElements());
        objs.push(this.renderReset());
        objs.push(this.renderSkip());
        objs.push(this.renderEquation());
        objs.push(this.renderPlay());
        objs.push(this.renderTimer());
        objs.push(this.renderSessionScore());
        objs.push(this.renderSettingsMenu());

        return (
            <div className={`board ${this.state.backgroundClass}`}>
                {objs}
                {this.renderRoundCompleteScreen()}
                {this.renderEndGameScreen()}
            </div>
        );
    }
}

// ========================================


class Game extends Component {
    constructor(props) {
        super(props);
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.boardRef = React.createRef();
    }

    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
        window.addEventListener('keydown', this.handleKeyDown);
        // Add click listener to unlock audio on first user interaction
        window.addEventListener('click', () => soundManager.unlock(), { once: true });
        window.addEventListener('keydown', () => soundManager.unlock(), { once: true });
        // Start the timer when component mounts
        this.startTimer();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
        window.removeEventListener('keydown', this.handleKeyDown);
        // Clear timer when component unmounts
        this.stopTimer();
    }

    startTimer() {
        if (!this.timerInterval) {
            this.setState({ isTimerRunning: true });
            this.timerInterval = setInterval(() => {
                this.setState(prevState => ({
                    timer: prevState.timer + 1
                }));
            }, 1000);
        }
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
            this.setState({ isTimerRunning: false });
        }
    }

    updateWindowDimensions() {
        LEFT_MARGIN = window.innerWidth / 2 - (N_TILES * TILE_WIDTH / 2);
        this.forceUpdate();
    }

    handleKeyDown(event) {
        // Unlock audio on first keydown
        soundManager.unlock();

        let board = this.boardRef.current
        let active_op_index
        let active_space
        if (board) {
            // Don't process keyboard events if settings menu is open
            if (board.state.isSettingsOpen) {
                // Allow Escape or Enter key to close settings menu
                if (event.key === 'Escape' || event.key === 'Enter') {
                    board.setState({ isSettingsOpen: false });
                }
                return;
            }

            // Handle Enter key when round complete screen is showing
            if (board.state.isRoundComplete) {
                if (event.key === 'Enter') {
                    board.handleContinueToNextRound();
                }
                return;
            }

            switch (event.key) {
                case 'Enter':
                    // If Enter key is pressed, simulate a click on the Play button
                    if (board.state.isRoundComplete) {
                        board.handleContinueToNextRound();
                    } else if (board.state.isGameComplete) {
                        board.startNewGame();
                    } else if (board.state.isSettingsOpen) {
                        board.setState({ isSettingsOpen: false });
                    }
                    else {
                        board.handlePlayClick();
                    }
                    break;
                case 'Escape':
                    if (board.state.isRoundComplete) { board.handleContinueToNextRound(); }
                    else if (board.state.isGameComplete) { board.startNewGame(); }
                    else if (board.state.isSettingsOpen) { board.setState({ isSettingsOpen: false }); }
                    else { board.handleResetClick(); }
                    break
                case 'r':
                    // Use 'r' key for reset instead of Escape which browsers prioritize for exiting fullscreen
                    board.handleResetClick();
                    break;
                case 's':
                    // Use 's' key for skipping/new game
                    board.handleSkipClick();
                    break;
                case ' ':
                    if (_isSpaceFiller(board.state.active_op)) {
                        let array_pos = board.state.tile_array.index_of_nth_space(board.state.active_space)
                        if (array_pos >= 0) {
                            board.handleSpaceClick(array_pos)
                        }
                    }
                    break;
                case 'ArrowRight':
                    active_op_index = ALL_OP_SYMBOLS.indexOf(board.state.active_op)  // -1 if active_op is EMPTY
                    active_op_index = (active_op_index + 1) % ALL_OP_SYMBOLS.length
                    board.activate_op(ALL_OP_SYMBOLS[active_op_index])
                    break;
                case 'ArrowLeft':
                    active_op_index = ALL_OP_SYMBOLS.indexOf(board.state.active_op)  // -1 if active_op is EMPTY
                    if (active_op_index === -1) {
                        active_op_index = ALL_OP_SYMBOLS.length - 1
                    }
                    else {
                        active_op_index = (active_op_index - 1) % ALL_OP_SYMBOLS.length
                    }
                    board.activate_op(ALL_OP_SYMBOLS[active_op_index])
                    break;
                case 'ArrowUp':
                    active_space = (board.state.active_space + 1) % N_SPACES
                    board.setState({ active_space: active_space })
                    break;
                case 'ArrowDown':
                    active_space = board.state.active_space - 1
                    if (active_space < 0) {
                        active_space = N_SPACES + active_space
                    }
                    board.setState({ active_space: active_space })
                    break;
                default:
                    return
            }

        }
    }

    render() {
        return (
            <div className="game">
                <LandscapeMessage />
                <div className="game-board">
                    <Board ref={this.boardRef} />
                </div>
            </div>
        );
    }
}


// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
)


export default Game;




