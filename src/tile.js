// var blocks = document.getElementsByClassName('block');
var num_tiles = document.getElementsByClassName('num_tile');
var op_tiles = document.getElementsByClassName('op_tile');
var spacers = document.getElementsByClassName('spacer');
var i = 0;
var active_block_id = "";
var tile = null;

var OP_TILE_COLOR = '#cccccc';
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



function get_tile_number(tile) {
	return Number(tile.getAttribute('id').substr(-1));
}


function random_digit(max) {
	return Math.floor(Math.random() * max);
}


function update_number(tile) {
	var digit = random_digit(10);
	tile.innerHTML = digit;
	equation[2*(get_tile_number(tile) - 1)] = digit;
}


function update_operation(tile) {
	if (get_tile_number(tile) == op_tiles.length) {
		tile.innerHTML = '=';
	} else {
		tile.innerHTML = OPERATIONS[random_digit(OPERATIONS.length)];
	}
}


function place_numtile (tile) {
	let j = get_tile_number(tile);
	tile.style.top = NUM_LINE_TOP + 'px';
	tile.style.left = (LEFT_MARGIN + 2*TILE_WIDTH*j) + 'px';
}


function set_numtile (tile) {
	place_numtile(tile);
	update_number(tile);
	mouse_highlight(tile, 'orange');
}


function place_optile (tile) {
	let j = get_tile_number(tile);
	tile.style.top = OP_LINE_TOP + 'px';
	tile.style.left = (LEFT_MARGIN + 2*TILE_WIDTH*(j - 1)) + 'px';
	equation[2*j - 1] = undefined;
}


function set_optile (tile) {
	place_optile(tile);
	mouse_highlight(tile, '#eeeeee');
	tile.addEventListener("click", activate_block)
	update_operation(tile)
}


function reset_optile () {
	place_optile(this)
}


function set_spacer (tile) {
	let j = get_tile_number(tile);
	tile.style.top = NUM_LINE_TOP + 'px';
	tile.style.left = (LEFT_MARGIN + TILE_WIDTH * (1 + 2*j)) + 'px';
	tile.style.width = TILE_WIDTH + 'px';
	// mouse_highlight(tile, 'white');
	tile.addEventListener("click", space_click);
	tile.has_joined = false;
}


function set_num_tiles () {
	for (i = 0; i < num_tiles.length; i++) {
		set_numtile(num_tiles[i], true);
	};
}


function set_op_tiles () {
	for (i = 0; i < op_tiles.length; i++) {
		set_optile(op_tiles[i], true);
	};
}


function set_spacers () {
	for (i = 0; i < spacers.length; i++) {
		set_spacer(spacers[i]);
	}
}

function set_brackets () {
	tile = document.getElementById('brackets')
	tile.style.top = OP_LINE_TOP / 2 + NUM_LINE_TOP / 2 + 'px'
	tile.style.left = LEFT_MARGIN + TILE_WIDTH * 14 + 'px'
	tile.addEventListener('click', activate_brackets)
}



function build_equation (numbers, space_contents) {
	let equation = '';
	var sc;
	let n = numbers.length;
	let started = 0; 

	for (i = 0; i < n; i++) {
		equation += numbers[i]
		sc = space_contents[i]
		if (i < n - 1) {
			if (sc == 0 && started) {
				return equation
			} else if (sc != 'join') {
				equation += sc;     // add operator
				started = 1; 
			} 
			// otherwise we have join in which case we just continue as the next number is appended on the next iterations
		}
	}
	if (started == 1) {
		return equation
	}
	else {
		return ''
	}
}


function play () {
	var filled = [];
	var has_equals = false;
	var first = 0;
	var last = 0;
	var eq = '';
	var op = '';

	for (i = 1; i < 6; i++) {
		if (equation[2*i - 1] != undefined) {
			filled[i] = true;
			if (first && !filled[i - 1]) {
				alert('No gaps allowed in equation!'); 
				return
			} else if (!first) {
				first = i;
			}
			last = i;
		}
	}
	for (i = first; i <= last; i++) {
		eq += equation[2*(i - 1)];
		op = equation[2*i - 1]; 
		eq += op;
		if (op == OPERATIONS_MAP['=']) {
			has_equals = true;
		}
		if (i == last) {
			eq += equation[2*i];
		}
	}
	if (!has_equals) {
		alert('Equation must have at least one "="!');
		return
	};
	log('equation: ' + eq);

	if (eval(eq)) {
		alert("Well done!");
		for (i = first; i <= last; i++) {
			set_numtile(num_tiles[i - 1]);
			if (i == last) {
				set_numtile(num_tiles[i]);
			}
		reset_played();
		deactivate_brackets();
		}

	} else {
		alert("Sorry, the equation is invalid: " + eq);
	}
}

function reset_inplay () {
	for (i = 0; i < 6; i++) {
		place_optile(op_tiles[i]);
		num_tiles[i].innerHTML = num_tiles[i].innerHTML.replace('(', '').replace(')', '');
	}
	deactivate_brackets()

}


function reset_played () {
	for (i = 0; i < op_tiles.length; i++) {
		var tile = op_tiles[i];
		if (tile.placed) {
			place_optile(tile);			
		};
	};
}


// // concatenating tiles:
// // a tile could have "joined left/right" flags. If you click either of them they split.



// set_num_tiles()
// set_op_tiles()
// set_spacers()
// set_brackets()


function mouse_highlight (elem, color) {
  var orig = elem.style.backgroundColor;
  elem.addEventListener("mouseover", 
	  function () {elem.style.backgroundColor=color;})
  elem.addEventListener("mouseout", 
	  function () {elem.style.backgroundColor=orig;})
    }


function activate_block () {
	active_block_id = this.getAttribute('id');
	this.style.backgroundColor = "magenta";
}


function deactivate_current_block () {
	if (active_block_id != "") {
		let elem = document.getElementById(active_block_id);
		elem.style.backgroundColor = OP_TILE_COLOR;
		active_block_id = "";
	}
}
 

function space_click () {
	log(this.has_joined)
	if (this.has_joined) {
		split_adjacent_blocks(this);
	} else if (active_block_id) {
		move_active_block_to_spacer(this);
	} else {
		join_adjacent_blocks(this);
	}
}


function move_active_block_to_spacer(spacer) {
	var tile = document.getElementById(active_block_id);
	tile.style.top = spacer.style.top;
	tile.style.left = spacer.style.left;
	tile.style.backgroundColor = 'blue';
	tile.addEventListener('click', reset_optile)
	tile.placed = true;
	deactivate_current_block()
	equation[2 * get_tile_number(spacer) - 1] = OPERATIONS_MAP[tile.innerHTML];
}


function join_adjacent_blocks (spacer) {
	var i = get_tile_number(spacer);
	var left = document.getElementById('num' + i);
	var right = document.getElementById('num' + (i + 1));
	equation[2*i - 1] = '';

	left.style.left = _get_left(left) + TILE_WIDTH / 2 + 'px';
	right.style.left = _get_left(right) - TILE_WIDTH / 2 + 'px';
	spacer.style.left = left.style.left;
	spacer.style.width = 2 * TILE_WIDTH + 'px';
	spacer.has_joined = true;
}


function split_adjacent_blocks (spacer) {
	var i = get_tile_number(spacer);
	equation[2*i - 1] = undefined;
	place_numtile(document.getElementById('num' + i));
	place_numtile(document.getElementById('num' + (i + 1)));
	set_spacer(spacer);
}


function _get_left (tile) {
	return Number(tile.style.left.replace('px', ''));
}

function _get_top (tile) {
	return Number(tile.style.top.replace('px', ''));
}


function activate_brackets () {
	for (i = 0; i < num_tiles.length; i++) {
		num_tiles[i].addEventListener('click', add_bracket);
	}
	var tile = document.getElementById('brackets');
	tile.style.backgroundColor = 'orange';
	tile.style.height = TILE_WIDTH + 15 + 'px';
	tile.style.width = TILE_WIDTH + 15 + 'px';
}


function deactivate_brackets () {
	for (i = 0; i < num_tiles.length; i++) {
		num_tiles[i].removeEventListener('click', add_bracket);
	}
	var tile = document.getElementById('brackets');
	tile.style.backgroundColor = 'yellow';
	tile.style.height = TILE_WIDTH + 'px';
	tile.style.height = TILE_WIDTH + 'px';
	tile.innerHTML = '()';
}


function add_bracket () {
	var tile = document.getElementById('brackets');
	if (bracket_flag == 0) {
		this.innerHTML = '(' + this.innerHTML;
		bracket_flag = 1;
		tile.innerHTML = ' )'
	} else {
		this.innerHTML += ')'
		bracket_flag = 0; 
		deactivate_brackets();
	}
}
