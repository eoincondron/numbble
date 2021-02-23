import React, {Component} from 'react';
import ReactDOM from 'react-dom'
// import logo from './logo.svg';
import './App.css';
import {MultiNumTile, SingleNumTile, DormantBracketTile, WaitingBracketTile, PlacedBracketTile,
    PlacedOpTile, DormantOpTile, WaitingOpTile, Spacer, Equation, PlayButton, ResetTile} from './divs';
import {TileArray} from "./tile_array";
import {L_BRACKET, R_BRACKET, SPACE, is_num_string, OPERATIONS} from "./util";


let N_TILES = 6;
let LEFT_MARGIN = 100;
let TILE_WIDTH = 30;
let EMPTY = '';


let log = console.log;


//  =================================== ===


// Tile movements are managed as follows; 
// Each space can be flagged with a number corresponding to an operator and that operator fills the space. 
// Alternatively, the space can be flagged as a joining space such that the adjacent numbers join together to cover the space. 


class Board extends Component {

    constructor(props) {
        super(props);
        this.state = this.populate_board()
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

    renderSingleNumTile(array_pos, left_position) {
        let value = this.state.tile_array.tile_array[array_pos]
        return (
            <SingleNumTile
                value={value}
                style={{
                    left: left_position + 'px'
                }}
                onClick={
                    () => this.handleSingleNumClick(array_pos)
                }
            />
        );
    }

    _maybeInsertBrackets(array_pos) {
        // Insert brackets at array pos if current active op is a bracket and return boolean indicating if we did
        // This could be the place for automatically activating a second bracket.
        if (this.state.active_op === R_BRACKET) {
            this.state.tile_array.insert_right_bracket(array_pos);
            this.deactive_op()
            return true
        } else if (this.state.active_op === L_BRACKET) {
            this.state.tile_array.insert_left_bracket(array_pos)
            this.deactive_op()
            return true
        } else {
            return false
        }
    }

    handleSingleNumClick(array_pos) {
        if (!this._maybeInsertBrackets(array_pos)) {
            this.state.tile_array.remove_brackets(array_pos)
        }
        this.setState({})
    }

    renderMultiNumTile(array_pos, left_position) {
        let value = this.state.tile_array.tile_array[array_pos]
        return (
            <MultiNumTile
                value={value}
                style={{
                    left: left_position + 'px'
                }}
                onClick={
                    () => this.handleMultiNumClick(array_pos)
                }
            />
        );
    }

    handleMultiNumClick(array_pos) {
        if (!this._maybeInsertBrackets(array_pos)) {
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

    renderPlacedBracketTile(is_left, left_position) {
        // Clicking placed brackets does nothing. Click number to which they are assigned to remove
        return (<PlacedBracketTile
                value={this._getBracketValue(is_left)}
                style={{
                    left: left_position + 'px',
                }}
            />
        );
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
        let value = this.state.tile_array.tile_array[array_pos];
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
    }

    // SPACE TILES
    renderSpacer(array_pos, left_position) {
        return (<Spacer
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
        // TODO: this is currently generating a new board
    }

    renderEquation() {
        let eq = this.state.tile_array._build_display_string();
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

    handlePlayClick() {
        let eq = this.state.tile_array.build_equation(false);
        let eval_eq = this.state.tile_array.build_equation(true);
        if (eval(eval_eq)) {
            alert(eq + " is correct. Well done !");
            this.setState(this.populate_board());
        } else {
            alert("Sorry, the equation is invalid: " + eq);
            log(this.state.tile_array.tile_array)
        }
    }

    render() {
        let left_position = LEFT_MARGIN;
        let objs = [];
        let tiles = this.state.tile_array.tile_array;

        for (let array_pos = 0; array_pos < tiles.length; array_pos++) {
            let content = tiles[array_pos];
            if (content === L_BRACKET || content === R_BRACKET) {
                objs.push(this.renderPlacedBracketTile(content === L_BRACKET, left_position));
                left_position += TILE_WIDTH / 2;
            } else if (content === SPACE) {
                objs.push(this.renderSpacer(array_pos, left_position))
                left_position += TILE_WIDTH;
            } else if (OPERATIONS.includes(content)) {
                objs.push(this.renderPlacedOpTile(array_pos, left_position))
                left_position += TILE_WIDTH;
            } else {
                if (!is_num_string(content)) {
                    throw "content must be a space, bracket, operation or number"
                }
                if (content.length === 1) {
                    objs.push(this.renderSingleNumTile(array_pos, left_position))
                    left_position += TILE_WIDTH;
                } else {
                    objs.push(this.renderMultiNumTile(array_pos, left_position))
                    left_position += TILE_WIDTH + (content.length - 1) * TILE_WIDTH / 2;
                }
            }
        }

        left_position = TILE_WIDTH;
        for (let i = 0; i < OPERATIONS.length; i++) {
            let op_string = OPERATIONS[i];
            objs.push(this.renderUnplacedOpTile(op_string, left_position));
            left_position += TILE_WIDTH;
        }
        left_position += TILE_WIDTH / 2;
        objs.push(this.renderUnplacedBracketTile(true, left_position));
        left_position += TILE_WIDTH / 2;
        objs.push(this.renderUnplacedBracketTile(false, left_position));

        objs.push(this.renderReset());
        objs.push(this.renderEquation());
        objs.push(this.renderPlay());

        return (
            <div className="board">
                {objs}
            </div>
        );
    }
}

// ========================================


class Game extends Component {
    render() {
        return (
            <div className="game">
                <div className="game-board">
                    <Board/>
                </div>
                <div className="game-info">
                    <div>{/* status */}</div>
                    <ol>{/* TODO */}</ol>
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




