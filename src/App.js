import React, { Component } from 'react';
import ReactDOM from 'react-dom'
// import logo from './logo.svg';
import './App.css';
import './tile.js';



let N_TILES = 6;
let N_OPS = 6; 
let JOINED = N_OPS;

var OP_TILE_COLOR = '#cccccc';
var ACTIVE_OP_TILE_COLOR = '#cfcccc';
var LEFT_MARGIN = 100;
var TILE_WIDTH = 30;
var NUM_LINE_TOP = 250; 
var OP_LINE_TOP = 350; 
var OPERATIONS = ['+', '+', '-', '-', '%', 'X'];
var OPERATIONS_MAP = {
  '+': ' + ',
  '-': ' - ', 
  '%': ' / ', 
  'X': ' * ', 
  '=': ' == '
};

var equation = [];
var bracket_flag = 0;

let log = console.log;



function random_digit(max) {
  return Math.floor(Math.random() * max);
}


function _get_spacer_position(i) {
  return LEFT_MARGIN + (2*i + 1)*TILE_WIDTH
}


function NumTile(props) {
  return (
    <div className="num_tile block" style={props.style}>
      {props.value}
    </div>
  );
}
//  ==================================== ===


function Spacer(props) {
  return (
    <div className="spacer block" style={props.style} onClick={props.onClick}>
    </div>
  );
}
// ==================================== ===


function OpTile(props) {
  return (
    <button className="op_tile block" style={props.style} onClick={props.onClick}>
      {props.value}
    </button>
  );
}
// ==================================== ===


function BracketTile(props) {
  return (
    <div className='bracket_tile block' style={props.style} onClick={props.onClick}>
      '( )'
    </div>
    );
}


function ResetTile(props) {
  return (
    <button className="reset_tile" style={props.style} onClick={props.onClick}>
      'Reset' 
    </button>
  );
}
//  =================================== ===


function Equation(props) {
  return (
    <div className="equation" >
      {props.equation} 
    </div>
  );
}
//  =================================== ===

function PlayButton(props) {
  return (
    <div className='play button' onClick={props.onClick}>
      'Play'
    </div>
  );
}
// ========================================

// Tile movements are managed as follows; 
// Each space can be flagged with a number corresponding to an operator and that operator fills the space. 
// Alternatively, the space can be flagged as a joining space such that the adjacent numbers join together to cover the space. 


class Board extends Component {

  constructor(props) {
    super(props);
    this.populate_board()

  }


  populate_board () {
    let numbers = Array(N_TILES);
    for (let i = 0; i < N_TILES; i++) {
      numbers[i] = random_digit(10);
    };

    let operators = Array(N_OPS);
    for (let i = 0; i < N_OPS; i++) {
      operators[i] = OPERATIONS[random_digit(OPERATIONS.length)];
    };
    operators[N_OPS] = '='

    let op_assignments = Array(N_OPS).fill(-1); 
    let space_contents = Array(N_TILES - 1).fill(0); 

    this.state = {
      numbers: numbers,
      operators: operators, 
      active_op: -1, 
      op_assignments: op_assignments,      // map from operation to space
      space_contents: space_contents,     // record of adjacent numbers to be joined
      equation: ''
    };
  }
  //
  renderNumTile(i) {
    let left = LEFT_MARGIN + 2*i*TILE_WIDTH; 

    if (this.state.space_contents[i] == 'join') {
      left = left + TILE_WIDTH / 2; 
      log('shifting ' + i + ' right')
    } else if (this.state.space_contents[i - 1] == 'join') {
      left = left - TILE_WIDTH / 2;
    }
    return (
    <NumTile 
       value={this.state.numbers[i]}
       style={{
          top: NUM_LINE_TOP + 'px', 
          left: left + 'px'}}
    />
    );
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
        log('assigned_space ' + assigned_space)
    } else if (this.state.active_op == i) {
      bg_color = ACTIVE_OP_TILE_COLOR;
      top = OP_LINE_TOP - 10;  // make it stand out
    }
    else {
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
  handleOpClick (i) {
    const ops = this.state.op_assignments.slice()

    log('clicked op ' + i)
    // reset if assigned
    if (ops[i] > -1) {
      ops[i] = -1;
    }
    // deactivate if activated
    if (this.state.active_op == i) {
      this.setState({active_op: -1});        
    } 
    // activate
    else {
       this.setState({active_op: i});
    }
    this.setState({op_assignments: ops})
  }


  // SPACE TILES
  renderSpacer(i) {
    return (<Spacer 
       style={{
          top: NUM_LINE_TOP + 'px', 
          left: _get_spacer_position(i) + 'px'}}
       onClick={
          () => this.handleSpaceClick(i)
       }
    />
    );
  } 
  //
  handleSpaceClick (i) {
    log('clicked space ' + i)
    const sc = this.state.space_contents.slice(); 
    // Cancel join if joined
    if (this.state.space_contents[i] == 'join') {
      sc[i] = 0; 
    } 
    // Join if no operator is active
    else if (this.state.active_op == -1) {
      sc[i] = 'join'; 
    // assign this space to active operator
  }
    else {
      const ops = this.state.op_assignments.slice(); 
      ops[this.state.active_op] = i; 
      this.setState({op_assignments: ops});
      sc[i] = this.state.operators[this.state.active_op];   // add operator to space contents; 
    }
    this.setState({space_contents: sc});
  }

  renderReset () {
    return (<ResetTile 
       style={{
          top: NUM_LINE_TOP + 'px', 
          left: _get_spacer_position(-2) + 'px'}}
       onClick={
          () => this.handleResetClick()}
    />
    );
  } 
  //

  handleResetClick () {
    this.setState({op_assignments: Array(N_OPS).fill(-1)})
    this.setState({space_contents: Array(N_TILES - 1).fill(0)})
    this.setState({active_op: -1}); 
  }

  renderEquation () {
    let eq = build_equation(this.state.numbers, this.state.space_contents);
    // this.setState({equation: eq}); 
    log(eq)
    return (<Equation
        equation={eq}
      />
      );
  };

  renderPlay () {
    return (<PlayButton
      onClick={
        () => this.handlePlayClick()}
      />)
  }

  handlePlayClick () {
    let eq = build_equation(this.state.numbers, this.state.space_contents);
    if (eval(eq)) {
      alert(eq + " is correct. Well done !");
      this.populate_board();
    } else {
      alert("Sorry, the equation is invalid: " + eq);
    }
  }


  render() {
    log('op flags' + this.state.op_assignments)
    log('space contents' + this.state.space_contents)
    log('active op' + this.state.active_op)
    let eq = build_equation(this.state.numbers, this.state.space_contents);
    log('equation ' + eq)
    var objs = [];  

  for (var i = 0; i < N_TILES; i++) {
      objs.push(this.renderNumTile(i));
  }
  for (var i = 0; i <= N_OPS; i++) {
      objs.push(this.renderOpTile(i));
  }  
  for (var i = 0; i < N_TILES - 1; i++) {
      objs.push(this.renderSpacer(i));
  }

  objs.push(this.renderReset()); 
  objs.push(this.renderEquation()); 
  objs.push(this.renderPlay()); 

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
          <Board />
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
  <Game />,
  document.getElementById('root')
)



export default Game;



function build_equation (numbers, space_contents) {
  let equation = '';
  var sc;
  var i; 
  let n = numbers.length;
  let started = false; 
  let finished = false;
  let has_equals = false;



  for (i = 0; i < n; i++) {
    if (!finished) {
      equation += numbers[i]
    }
    sc = space_contents[i]
    if (i < n - 1) {
      if (sc == 0) {
        if (started) {
          finished = true 
        } else {
          equation = ''
        }
      }
      else if (finished) {
        return ''// Equation contains gaps
      }
      else if (sc != 'join') {
        equation += OPERATIONS_MAP[sc];     // add operator
        started = true;  
      } 
      // otherwise we have join in which case we just continue as the next number is appended on the next iterations
    }
  }
  if (started) {
    return equation
  }
  else {
    return ''
  }
}


