import React, {Component} from 'react';
import ReactDOM from 'react-dom'
// import logo from './logo.svg';
import './App.css';
import {MultiNumTile, SingleNumTile, DormantBracketTile, WaitingBracketTile, PlacedBracketTile} from './divs';
import {TileArray} from "./tile_array";
import {L_BRACKET, R_BRACKET} from "./util";


let N_TILES = 6;
let N_OPS = 6;

let OP_TILE_COLOR = '#cccccc';
let ACTIVE_OP_TILE_COLOR = '#cfcccc';
let LEFT_MARGIN = 100;
let TILE_WIDTH = 30;
let NUM_LINE_TOP = 250;
let OP_LINE_TOP = 350;
let OPERATIONS = ['+', '+', '-', '-', '/', 'X'];
const JOIN = 'join';

let log = console.log;




function _get_spacer_position(i) {
    return LEFT_MARGIN + (2 * i + 1) * TILE_WIDTH
}



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
            active_op: ''
        };
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
            return true
        } else if (this.state.active_op === L_BRACKET) {
            this.state.tile_array.insert_left_bracket(array_pos)
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

    renderDormantBracketTile(is_left) {
        return (<DormantBracketTile
                value={this._getBracketValue(is_left)}
                onClick={
                    () => this.handleDormantBracketClick(is_left)
                }
            />
        );
    }

    //
    handleDormantBracketClick(is_left) {
        this.setState({active_op: this._getBracketValue(is_left)})
    }

    renderWaitingBracketTile(is_left) {
        return (<WaitingBracketTile
                value={this._getBracketValue(is_left)}
                onClick={
                    () => this.handleWaitingBracketClick(is_left)
                }
            />
        );
    }

    //
    handleWaitingBracketClick(is_left) {
        // reset to dormant
        this.setState({active_op: ''})
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

    renderBracketTile(i) {
        let top = OP_LINE_TOP + 2 * TILE_WIDTH;
        let left = _get_spacer_position(0) - 2 * TILE_WIDTH;

        if (this.state.bracket_state > 0) {
            top = top - 10;  // make it stand out
        }

        return (<BracketTile
                style={{
                    top: top + 'px',
                    left: left + 'px',
                }}
                onClick={
                    () => this.handleBracketClick()
                }
            />
        );
    }

    //
    handleBracketClick() {
        let bracket_state = this.state.bracket_state;
        if (bracket_state === 0) {
            bracket_state = 1;
        } else {
            bracket_state = 0;
        }
        this.setState({bracket_state: bracket_state})
    }

    // OP TILES
    renderOpTile(i) {
        let bg_color = OP_TILE_COLOR;
        let top;
        let left = _get_spacer_position(i) - 2 * TILE_WIDTH;

        let assigned_space = this.state.op_assignments[i];

        if (assigned_space >= 0) {
            top = NUM_LINE_TOP;
            left = _get_spacer_position(assigned_space);
        } else if (this.state.active_op === i) {
            bg_color = ACTIVE_OP_TILE_COLOR;
            top = OP_LINE_TOP - 10;  // make it stand out
        } else {
            top = OP_LINE_TOP;
        }

        return (<OpTile
                value={this.state.operators[i]}
                style={{
                    top: top + 'px',
                    left: left + 'px',
                    backgroundColor: bg_color
                }}
                onClick={
                    () => this.handleOpClick(i)
                }
            />
        );
    }

    //
    handleOpClick(i) {
        const op_assignments = this.state.op_assignments.slice()
        const space_contents = this.state.space_contents.slice()
        const assignment = op_assignments[i];

        // reset if assigned
        if (assignment > -1) {
            op_assignments[i] = -1;
            space_contents[assignment] = 0
        }
        // deactivate if activated
        if (this.state.active_op === i) {
            this.setState({active_op: -1});
        }
        // activate
        else {
            this.setState({active_op: i});
        }
        this.setState({op_assignments: op_assignments, space_contents: space_contents})
    }


    // SPACE TILES
    renderSpacer(i) {
        return (<Spacer
                style={{
                    top: NUM_LINE_TOP + 'px',
                    left: _get_spacer_position(i) + 'px'
                }}
                onClick={
                    () => this.handleSpaceClick(i)
                }
            />
        );
    }

    //
    handleSpaceClick(i) {
        const space_contents = this.state.space_contents.slice();
        // Cancel join if joined
        if (this.state.space_contents[i] === JOIN) {
            space_contents[i] = 0;
        }
        // Join if no operator is active
        else if (this.state.active_op === -1) {
            space_contents[i] = JOIN
        } else {
            // assign this space to active operator
            const op_assignments = this.state.op_assignments.slice();
            op_assignments[this.state.active_op] = i;
            this.setState({op_assignments: op_assignments});
            space_contents[i] = this.state.operators[this.state.active_op];   // add operator to space contents;
        }
        this.setState({space_contents: space_contents});
    }

    renderReset() {
        return (<ResetTile
                style={{
                    top: NUM_LINE_TOP + 'px',
                    left: _get_spacer_position(-2) + 'px'
                }}
                onClick={
                    () => this.handleResetClick()}
            />
        );
    }

    //

    handleResetClick() {
        this.setState({op_assignments: Array(N_OPS).fill(-1)})
        this.setState({space_contents: Array(N_TILES - 1).fill(0)})
        this.setState({active_op: -1});
    }

    renderEquation() {
        let eq = this.build_equation();
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
        let eq = this.build_equation();
        let eval_eq = eq.replace('=', '===').replace('X', '*');
        if (eval(eval_eq)) {
            alert(eq + " is correct. Well done !");
            this.setState(this.populate_board());
        } else {
            alert("Sorry, the equation is invalid: " + eq);
        }
    }

    build_equation() {
        let equation = '';
        let space_content;
        let i;
        let n_nums = this.state.numbers.length;
        let started = false;
        let finished = false;
        let has_equals = false;

        for (i = 0; i < n_nums; i++) {
            if (!finished) {
                equation += this._getNumTileContent(i)
            }
            space_content = this.state.space_contents[i];
            if (i < n_nums - 1) {
                if (space_content === 0) {
                    if (started) {
                        finished = true
                    } else {
                        equation = ''
                    }
                } else if (finished) {
                    return ''// Equation contains gaps
                } else if (space_content !== JOIN) {
                    equation += space_content;     // add operator
                    started = true;
                    if (space_content === '=') {
                        has_equals = true;
                    }
                }
                // otherwise we have join in which case we just continue as
                // the next number is appended on the next iterations
            }
        }
        if (started & has_equals) {
            return equation
        } else {
            return ''
        }
    }


    render() {
        let objs = [];

        for (let tile_num = 0; tile_num < N_TILES; tile_num++) {
            objs.push(this.renderNumTile(tile_num));
        }
        for (let tile_num = 0; tile_num <= N_OPS; tile_num++) {
            objs.push(this.renderOpTile(tile_num));
        }
        for (let tile_num = 0; tile_num < N_TILES - 1; tile_num++) {
            objs.push(this.renderSpacer(tile_num));
        }

        objs.push(this.renderReset());
        objs.push(this.renderEquation());
        objs.push(this.renderPlay());
        objs.push(this.renderBracketTile());

        return (
            <div className="table">
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




