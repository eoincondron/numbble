import React, {Component} from 'react';
import ReactDOM from 'react-dom'
// import logo from './logo.svg';
import './App.css';
import {
    BackgroundSelector,
    DormantBracketTile,
    DormantOpTile,
    Equation,
    PlacedOpTile,
    PlayButton,
    ResetTile,
    SessionScore,
    SkipTile,
    NumTile,
    Spacer,
    WaitingBracketTile,
    WaitingOpTile
} from './divs';
import {TileArray} from "./tile_array";
import {
    EMPTY,
    is_num_string,
    count_element,
    PLUS,
    MINUS,
    MULTIPLY,
    DIVIDE,
    SQUARE,
    SQRT,
    EQUALS,
    OPERATIONS,
    L_BRACKET,
    R_BRACKET,
    BRACKETS,
    SPACE,
    OP_SCORES,
    DECIMAL_POINT,
} from "./util";
let ALL_OP_SYMBOLS = OPERATIONS.concat(BRACKETS).concat([EQUALS])
let ONE_USE_OPS = [SQUARE, SQRT]
// Find a better way to state the ordering of the operation tiles.


// Tailwind configuration and custom styles
const styles = {
    board: 'bg-gray-100 p-6 rounded-lg shadow-md max-w-4xl mx-auto',
    tile: 'inline-block text-center transition-all duration-200 ease-in-out',
    numTile: 'bg-blue-500 text-white rounded-md hover:bg-blue-600',
    opTile: 'bg-green-500 text-white rounded-md hover:bg-green-600',
    bracketTile: 'bg-purple-500 text-white rounded-md hover:bg-purple-600',
    dormantTile: 'opacity-50 cursor-pointer',
    activeTile: 'ring-2 ring-blue-400',
};

// Available background patterns
const BACKGROUNDS = [
    { id: 'solid', name: 'Indigo', class: 'bg-solid' },
    { id: 'grid', name: 'Teal Grid', class: 'bg-grid' },
    { id: 'dots', name: 'Purple Dots', class: 'bg-dots' },
    { id: 'waves', name: 'Orange Waves', class: 'bg-waves' },
    { id: 'circuit', name: 'Blue Circuit', class: 'bg-circuit' }
];



let N_TILES = 6;
let N_SPACES = N_TILES - 1;
let TILE_WIDTH = 80;
// LEFT_MARGIN will be calculated after TILE_WIDTH is defined
let LEFT_MARGIN;


let log = console.log;


//  =================================== ===


// Tile movements are managed as follows; 
// Each space can be flagged with a number corresponding to an operator and that operator fills the space. 
// Alternatively, the space can be flagged as a joining space such that the adjacent numbers join together to cover the space. 

let SPACE_FILLERS = [PLUS, MINUS, DIVIDE, MULTIPLY, DECIMAL_POINT, EQUALS]

function _isSpaceFiller (tile_symbol) {
    return SPACE_FILLERS.includes(tile_symbol)
}

class Board extends Component {

    constructor(props) {
        super(props);
        // Calculate LEFT_MARGIN here to ensure TILE_WIDTH is defined
        LEFT_MARGIN = window.innerWidth / 2 - (N_TILES * TILE_WIDTH / 2);
        this.state = {
            ...this.populate_board(),
            backgroundClass: 'bg-solid',
            timer: 0,
            isTimerRunning: false,
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

    populate_board() {
        let tile_array = new TileArray(N_TILES);

        return {
            tile_array: tile_array,
            active_op: EMPTY,
            active_space: -1
        };
    }

    activate_op (op_string) {
        this.setState({active_op: op_string})
        if (this.state.active_space === -1) {
            this.setState({active_space: 0})
        }
    }

    deactivate_op () {
        this.setState({active_op: EMPTY})
        this.setState({active_space: -1})
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
                style={{
                    left: left_position + 'px'
                }}
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
        if (BRACKETS.includes(this.state.active_op)) {
            this._insertBrackets(array_pos)
        }
        else if (this.state.active_op === MINUS) {
            this.state.tile_array.negate_number(array_pos)
            this.deactivate_op()
        }
        else if (this.state.active_op.startsWith('**')) {
            // Apply exponent to the number by concatenating the string
            this._appendExponent(array_pos, this.state.active_op)
            this.deactivate_op()
        }
        else {
            this.state.tile_array.remove_brackets(array_pos)
            this.state.tile_array.split_numbers(array_pos)
            this.state.tile_array.remove_exponents(array_pos)
        }
        this.setState({})
    }
    
    _appendExponent(array_pos, exponent) {
        // Append the exponent string to the number at array_pos
        const currentValue = this.state.tile_array.string_array[array_pos];
        
        // Only apply to numeric values
        if (is_num_string(currentValue)) {
            // Simply concatenate the exponent to the current value
            // This will make entries like "5**2" or "10**1/2" that will be evaluated when the equation is calculated
            this.state.tile_array.string_array[array_pos] = currentValue + exponent;
        }
    }

    // BRACKETS TILES
    _getBracketValue(left) {
        return left ? L_BRACKET : R_BRACKET
    }

    renderDormantBracketTile(is_left, left_position) {
        return (<DormantBracketTile
                value={this._getBracketValue(is_left)}
                style={{
                    left: left_position + 'px',
                }}
                onClick={
                    () => this.handleDormantBracketClick(is_left)
                }
            />
        );
    }

    handleDormantBracketClick(is_left) {
        this.activate_op(this._getBracketValue(is_left))
    }

    renderWaitingBracketTile(is_left, left_position) {
        return (<WaitingBracketTile
                value={this._getBracketValue(is_left)}
                style={{
                    left: left_position + 'px',
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
                style={{
                    left: left_position + 'px',
                }}
                onClick={
                    () => this.handleDormantOpClick(op_string)
                }
            />
        );
    }

    //
    handleDormantOpClick(op_string) {
        this.activate_op(op_string)
    }

    renderWaitingOpTile(op_string, left_position) {
        return (<WaitingOpTile
                value={op_string}
                style={{
                    left: left_position + 'px',
                }}
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
                style={{
                    left: left_position + 'px',
                }}
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
                style={{
                    left: left_position + 'px'
                }}
                onClick={() => this.handleSpaceClick(array_pos)}
                onDrop={handleDrop}
            />
        );
    }

    //
    handleSpaceClick(array_pos) {
        if (this.state.active_op === EMPTY) {
            this.state.tile_array.join_numbers(array_pos, this.state.active_op)
            this.setState({});
        } else if (_isSpaceFiller(this.state.active_op)) {
            this.state.tile_array.insert_operation(array_pos, this.state.active_op)
            this.deactivate_op()
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
        // Reset the board and generate a new one with new numbers
        this.deactivate_op();
        
        // Create a new tile array with random numbers
        const newState = this.populate_board();
        
        // Reset state with the new board but keep the timer running and total score
        this.setState({
            ...newState,
            totalScore: this.state.totalScore,
            gamesCompleted: this.state.gamesCompleted
        });
    }

    renderEquation() {
        let eq;
        try {
            // Try to get the evaluable equation instead of the display string
            eq = this.state.tile_array.build_equation(false);
            eq = "Your Equation: " + eq;
        } catch (error) {
            // If there's an error building the equation (like no equals sign yet),
            // just display a placeholder message
            eq = "Your Equation: ";
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
    
    renderBackgroundSelector() {
        return (
            <BackgroundSelector 
                backgrounds={BACKGROUNDS}
                currentBackground={this.state.backgroundClass}
                onChange={(backgroundClass) => this.setState({ backgroundClass })}
            />
        );
    }

    calculateScore(equation, time, used_all_nums) {
        // Calculate the score based on operators used in the equation
        let score = 0;
        
        // Loop through each character in the equation
        for (const char of equation) {
            // If this character is an operator with a score, add it
            if (OP_SCORES[char] !== undefined) {
                score += OP_SCORES[char];
            }
        }
        
        let scoreMessage = `Base Score: ${score} points`;

        if (used_all_nums) {
            score += 50
            scoreMessage += "\n50 Bonus points for using all numbers!!\n"
        }

        // Apply time bonus multiplier
        let timeBonus = 1.0; // Default multiplier
        if (time < 15) {
            // Double score if solved under 15 seconds
            timeBonus = 2.0;
            scoreMessage += "Speed Bonus: 2× (under 15 seconds)";
        } else if (time < 60) {
            // 1.5× multiplier if solved under 60 seconds
            timeBonus = 1.5;
            scoreMessage += "Speed Bonus: 1.5× (under 60 seconds)";
        }
        // Calculate final score with time bonus

        const finalScore = Math.round(score * timeBonus);
        scoreMessage += `\nFinal Score: ${finalScore} points`;

        return { 
            finalScore: finalScore,
            scoreMessage: scoreMessage
        };
    }

    handlePlayClick() {
        let eq = this.state.tile_array.build_equation(false);
        let eval_eq = this.state.tile_array.build_equation(true);
        if (eval(eval_eq)) {
            // Stop the timer on successful solution
            this.stopTimer();
            const time = this.state.timer;
            const timeString = this.formatTime(time);
            
            // Calculate the score for this equation with time bonus
            const used_all_nums = !this.state.tile_array.string_array.includes(SPACE)
            const scoreResult = this.calculateScore(eq, time, used_all_nums);
            
            // Update the total score and games completed
            const newTotalScore = this.state.totalScore + scoreResult.finalScore;
            const newGamesCompleted = this.state.gamesCompleted + 1;
            
            // Add session total to the score message
            const updatedScoreMessage = scoreResult.scoreMessage + 
                `\n\nSession Total: ${newTotalScore} points (${newGamesCompleted} games)`;

            alert(`${eq} is correct. Well done!\nYou solved it in: ${timeString}\n\n${updatedScoreMessage}`);
            
            // Reset the board and timer, but keep the total score and games count
            const newState = this.populate_board();
            this.setState({
                ...newState,
                totalScore: newTotalScore,
                gamesCompleted: newGamesCompleted
            });
            this.resetTimer();
        } else {
            let sides = eval_eq.split('===')
            let side_vals = sides.map(x => eval(x))
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
                gamesCompleted={this.state.gamesCompleted}
            />
        );
    }

    render() {
        // Calculate the total width needed for all tiles
        const tiles = this.state.tile_array.string_array;
        let totalWidth = TILE_WIDTH * tiles.length;

        // Center the array horizontally
        let left_position = (window.innerWidth - totalWidth) / 2;
        let objs = [];
        const tiles_array = this.state.tile_array.string_array;

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

        // Center the operations row
        const totalOperationsWidth = OPERATIONS.length * TILE_WIDTH + TILE_WIDTH * 2; // Including brackets
        left_position = (window.innerWidth - totalOperationsWidth) / 2;

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

        objs.push(this.renderReset());
        objs.push(this.renderSkip());
        objs.push(this.renderEquation());
        objs.push(this.renderPlay());
        objs.push(this.renderBackgroundSelector());
        objs.push(this.renderTimer());
        objs.push(this.renderSessionScore());

        return (
            <div className={`board ${this.state.backgroundClass}`}>
                {objs}
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
        let board = this.boardRef.current
        let active_op_index
        let active_space
        if (board) {
            switch (event.key) {
                case 'Enter':
                    // If Enter key is pressed, simulate a click on the Play button
                    board.handlePlayClick();
                    break;
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
                    board.setState({active_space: active_space})
                    break;
                case 'ArrowDown':
                    active_space = board.state.active_space - 1
                    if (active_space < 0) {
                        active_space = N_SPACES + active_space
                    }
                    board.setState({active_space: active_space})
                    break;
                default:
                    return
            }

        }
    }
    
    render() {
        return (
            <div className="game">
                <div className="game-board">
                    <Board ref={this.boardRef}/>
                </div>
            </div>
        );
    }
}


// ========================================

ReactDOM.render(
    <Game/>,
    document.getElementById('root')
)


export default Game;




