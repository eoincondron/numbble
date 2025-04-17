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
    NumTile,
    Spacer,
    WaitingBracketTile,
    WaitingOpTile
} from './divs';
import {TileArray} from "./tile_array";
import {
    EMPTY,
    is_num_string,
    MINUS,
    OPERATIONS,
    L_BRACKET,
    R_BRACKET,
    BRACKETS,
    SPACE,
} from "./util";
let ALL_OP_SYMBOLS = OPERATIONS.concat(BRACKETS)


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
let TILE_WIDTH = 80;
// LEFT_MARGIN will be calculated after TILE_WIDTH is defined
let LEFT_MARGIN;


let log = console.log;


//  =================================== ===


// Tile movements are managed as follows; 
// Each space can be flagged with a number corresponding to an operator and that operator fills the space. 
// Alternatively, the space can be flagged as a joining space such that the adjacent numbers join together to cover the space. 


class Board extends Component {

    constructor(props) {
        super(props);
        // Calculate LEFT_MARGIN here to ensure TILE_WIDTH is defined
        LEFT_MARGIN = window.innerWidth / 2 - (N_TILES * TILE_WIDTH / 2);
        this.state = {
            ...this.populate_board(),
            backgroundClass: 'bg-solid',
            timer: 0,
            isTimerRunning: false
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
            active_op: EMPTY
        };
    }

    deactive_op () {
        this.setState({active_op: EMPTY})
    }

    renderNumTile(array_pos, left_position) {
        let value = this.state.tile_array.string_array[array_pos]
        return (
            <NumTile
                value={value}
                style={{
                    left: left_position + 'px'
                }}
                onClick={
                    () => this.handleNumClick(array_pos)
                }
            />
        );
    }

    _insertBrackets(array_pos) {
        // Insert brackets at array pos if current active op is a bracket and return boolean indicating if we did
        // This could be the place for automatically activating a second bracket.
        let outstanding_bracket = EMPTY;
        this.state.tile_array._insert_bracket(this.state.active_op, array_pos);
        this.deactive_op()
        outstanding_bracket = this.state.tile_array._outstanding_bracket();
        if (outstanding_bracket !== EMPTY) {
            this.setState({active_op: outstanding_bracket})
        }
    }

    handleNumClick(array_pos) {
        if (BRACKETS.includes(this.state.active_op)) {
            this._insertBrackets(array_pos)
        }
        else if (this.state.active_op === MINUS) {
            this.state.tile_array.negate_number(array_pos)
            this.deactive_op()
        }
        else {
            this.state.tile_array.remove_brackets(array_pos)
            this.state.tile_array.split_numbers(array_pos)
        }
        this.setState({})
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
        this.setState({active_op: this._getBracketValue(is_left)})
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
        this.deactive_op()
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
        this.setState({active_op: op_string})
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
        if (OPERATIONS.includes(this.state.active_op)) {
            this.state.tile_array.insert_operation(array_pos, this.state.active_op);
            this.deactive_op();
        }
    }

    // SPACE TILES
    renderSpacer(array_pos, left_position) {
        // Determine if this space should be highlighted (when an operator is active)
        const isHighlighted = OPERATIONS.includes(this.state.active_op);
        
        return (<Spacer
                isHighlighted={isHighlighted}
                style={{
                    left: left_position + 'px'
                }}
                onClick={
                    () => this.handleSpaceClick(array_pos)
                }
            />
        );
    }

    //
    handleSpaceClick(array_pos) {
        if (this.state.active_op === EMPTY) {
            this.state.tile_array.join_numbers(array_pos, this.state.active_op)
            this.setState({});
        } else if (OPERATIONS.includes(this.state.active_op)) {
            this.state.tile_array.insert_operation(array_pos, this.state.active_op)
            this.deactive_op()
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
        this.deactive_op();
        this.state.tile_array.reset_board();
        // Don't reset the timer when the reset button is hit
        // Only reset timer after successful equation evaluation
        // TODO: this is currently generating a new board
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

    handlePlayClick() {
        let eq = this.state.tile_array.build_equation(false);
        let eval_eq = this.state.tile_array.build_equation(true);
        if (eval(eval_eq)) {
            // Stop the timer on successful solution
            this.stopTimer();
            const timeString = this.formatTime(this.state.timer);
            alert(`${eq} is correct. Well done!\nYou solved it in: ${timeString}`);
            
            // Reset the board and timer
            this.setState(this.populate_board());
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

    render() {
        // Calculate the total width needed for all tiles
        let totalWidth = 0;
        const tiles = this.state.tile_array.string_array;
        
        // First pass to calculate the total width
        for (let array_pos = 0; array_pos < tiles.length; array_pos++) {
            const content = tiles[array_pos];
            if (content === L_BRACKET || content === R_BRACKET) {
                totalWidth += TILE_WIDTH / 2;
            } else if (content === SPACE || OPERATIONS.includes(content)) {
                totalWidth += TILE_WIDTH;
            } else {
                if (content.length === 1) {
                    totalWidth += TILE_WIDTH;
                } else {
                    totalWidth += TILE_WIDTH + (content.length - 1) * TILE_WIDTH / 2;
                }
            }
        }
        
        // Center the array horizontally
        let left_position = (window.innerWidth - totalWidth) / 2;
        let objs = [];
        const tiles_array = this.state.tile_array.string_array;

        for (let array_pos = 0; array_pos < tiles_array.length; array_pos++) {
            let content = tiles_array[array_pos];
            if (content === SPACE) {
                objs.push(this.renderSpacer(array_pos, left_position))
                left_position += TILE_WIDTH;
            } else if (OPERATIONS.includes(content)) {
                objs.push(this.renderPlacedOpTile(array_pos, left_position))
                left_position += TILE_WIDTH;
            } else {
                if (!is_num_string(content)) {
                    throw `content must be a space, bracket, operation or number. Saw ${content}`
                }
                objs.push(this.renderNumTile(array_pos, left_position))
                left_position += TILE_WIDTH;
            }
        }

        // Center the operations row
        const totalOperationsWidth = OPERATIONS.length * TILE_WIDTH + TILE_WIDTH * 2; // Including brackets
        left_position = (window.innerWidth - totalOperationsWidth) / 2;
        
        for (let i = 0; i < OPERATIONS.length; i++) {
            let op_string = OPERATIONS[i];
            objs.push(this.renderUnplacedOpTile(op_string, left_position));
            left_position += TILE_WIDTH;
        }
        
        // Add some spacing between operations and brackets
        left_position += TILE_WIDTH / 4;
        objs.push(this.renderUnplacedBracketTile(true, left_position));
        left_position += TILE_WIDTH / 2;
        objs.push(this.renderUnplacedBracketTile(false, left_position));

        objs.push(this.renderReset());
        objs.push(this.renderEquation());
        objs.push(this.renderPlay());
        objs.push(this.renderBackgroundSelector());
        objs.push(this.renderTimer());

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
        if (board) {
            console.log(event.key)
            switch (event.key) {
                case 'Enter':
                    // If Enter key is pressed, simulate a click on the Play button
                    board.handlePlayClick();
                    break;
                case 'r':
                    // Use 'r' key for reset instead of Escape which browsers prioritize for exiting fullscreen
                    board.handleResetClick();
                    break;
                case 'ArrowRight':
                    active_op_index = ALL_OP_SYMBOLS.indexOf(board.state.active_op)  // -1 if active_op is EMPTY
                    active_op_index = (active_op_index + 1) % ALL_OP_SYMBOLS.length
                    board.setState({active_op: ALL_OP_SYMBOLS[active_op_index]})
                    break;
                case 'ArrowLeft':
                    active_op_index = ALL_OP_SYMBOLS.indexOf(board.state.active_op)  // -1 if active_op is EMPTY
                    if (active_op_index === -1) {
                        active_op_index = ALL_OP_SYMBOLS.length - 1
                    }
                    else {
                        active_op_index = (active_op_index - 1) % ALL_OP_SYMBOLS.length
                    }
                    board.setState({active_op: ALL_OP_SYMBOLS[active_op_index]})
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




