
import {
    random_digit,
    L_BRACKET,
    R_BRACKET,
    SPACE,
    OPERATIONS,
    EMPTY,
    EQUALS,
    split_num_string,
    is_num_string,
    OP_EVAL_MAP,
    _isSpaceFiller
} from './util.js';


export class TileArray {

    // Class for storing array of numbers, spaces and active tiles, everything need for the equation
    // Has interface for manipulating an array in allowable ways and knows how to build and resolve its equation.
    // All entries are represented as strings.

    constructor(numbers) {
        // If an integer is passed we build a random array of numbers that size
        if (typeof numbers === 'number') {
            numbers = this.build_random_num_array(numbers);
        }
        this.num_array = numbers;
        this.string_array = this.build_tile_array_from_numbers(this.num_array);
        this.open_bracket = EMPTY;
    }

    build_random_num_array(n_numbers) {
        let num_array = Array(n_numbers);
        for (let i = 0; i < n_numbers; i++) {
            num_array[i] = random_digit(10);
        }
        return num_array
    }

    build_tile_array_from_numbers(num_array) {
        let n_numbers = num_array.length;
        let tile_array = Array(2 * n_numbers - 1);  // length accommodates spaces and numbers
        for (let i = 0; i < n_numbers; i++) {
            tile_array[2 * i] = num_array[i].toString();
            if (i < n_numbers - 1) {
                tile_array[2 * i + 1] = SPACE;
            }
        }
        return tile_array
    }

    reset_board () {
        // return the board by to its original state
        this.string_array = this.build_tile_array_from_numbers(this.num_array)
    }

    join_numbers(space_location) {
        // Join adjacent numbers by removing a space. This should be called when an empty space tile is clicked.
        // If brackets are in the way we do nothing as this is valid state.
        // If space is not empty we throw as the method should not be called in this state
        // If the space has other non-numeric characters adjacent we throw as this is invalid state.
        let content = this.string_array[space_location];
        if (content !== SPACE) {
            throw "Cannot join numbers, space contains " + content;
        }
        let to_left = this.string_array[space_location - 1];
        if (to_left === R_BRACKET) {
            return
            // Maybe we want to raise here and catch downstream. Decide Later.
            // We may also want to allow it if there is a left bracket to the right.
        }
        let to_right = this.string_array[space_location + 1];
        if (to_right === L_BRACKET) {
            return
        }
        if (!(is_num_string(to_left) && is_num_string(to_right))) {
            throw "Space is adjacent non-numeric characters :".concat(to_left, ', ', to_right)
        }
        this.string_array[space_location - 1] = to_left + to_right; // numbers are represented as strings
        this.string_array.splice(space_location, 2);
    }

    split_numbers(location) {
        // Replace multi-digit number at location with a sub-list of individual digits and spaces.
        // Used to reverse calls to join_numbers
        let content = this.string_array[location];
        let split = split_num_string(content);
        this.string_array.splice(location, 1, ...split)
    }

    insert_operation(space_location, operation) {
        // Insert an operation into an empty space.
        // Throw if array does not contain a SPACE at space_location.
        let content = this.string_array[space_location];
        if (content === SPACE) {
            this.string_array[space_location] = operation;
        } else {
            throw "Cannot insert operation, space contains " + content;
        }
    }

    remove_operation(op_location) {
        // Remove an operation from the array, replacing with a SPACE.
        // Throw if array does not contain an operation at the given location.
        let content = this.string_array[op_location];
        if (_isSpaceFiller(content)) {
            this.string_array[op_location] = SPACE;
        } else {
            throw "Cannot remove operation, space contains " + content;
        }
    }

    _check_contains_num_at(num_location, action) {
        let content = this.string_array[num_location];
        let msg = "Cannot " + action;
        if (!is_num_string(content)) {
            throw msg.concat(" as there is no number at ", num_location, ". Content: ", content)
        }
    }

    _insert_bracket(bracket_type, num_location) {
        // Insert a bracket to adjacent to the chosen number
        // Throw if array does not contain a number at the given location
        this._check_contains_num_at(num_location, 'insert a bracket')
        let value = this.string_array[num_location];
        value = (bracket_type === L_BRACKET) ? L_BRACKET + value: value + R_BRACKET;
        this.string_array[num_location] = value;

        if (this.open_bracket === bracket_type) {
            throw "Inserting a bracket when there is already an open bracket of the same side is not allowed" }
        else if (this.open_bracket === EMPTY) {
            this.open_bracket = bracket_type
        } else {
            this.open_bracket = EMPTY
        }
    }

    _outstanding_bracket() {
        switch (this.open_bracket) {
            case L_BRACKET:
                return R_BRACKET
            case R_BRACKET:
                return L_BRACKET
            case EMPTY:
                return EMPTY
        }

    }

    insert_left_bracket(num_location) {
        // Insert a bracket to the left of the chosen number
        // Throw if array does not contain a number at the given location
        this._insert_bracket(L_BRACKET, num_location)
    }

    insert_right_bracket(num_location) {
        // Insert a bracket to the right of the chosen number
        // Throw if array does not contain a number at the given location
        this._insert_bracket(R_BRACKET, num_location)
    }

    _remove_brackets_of_type(bracket_type, location) {
        // Remove brackets adjacent to a number at a given location
        // Throw if the array does not contain a number here
        this._check_contains_num_at(location, "remove brackets")
        let opposite = (bracket_type === L_BRACKET) ? R_BRACKET : L_BRACKET
        while (this.string_array[location].includes(bracket_type)) {
            this.string_array[location] = this.string_array[location].replace(bracket_type, '')
            for (let i = location; i < this.string_array.length - 1; i++) {
                let s = this.string_array[i]
                if (s.includes(opposite)) {
                    this.string_array[i] = s.replace(opposite, '')
                    break
                }
            }
        }
    }

    remove_brackets(location) {
        this._remove_brackets_of_type(L_BRACKET, location)
        this._remove_brackets_of_type(R_BRACKET, location)
    }

    remove_exponents(location) {
        this.string_array[location] = this.string_array[location].split('**')[0]
    }
    negate_number(num_location) {
        // Negates a number at the location by prefixing a '-'
        // Do nothing if number is already negative
        // Throw if a number is not contained at the given location
        this._check_contains_num_at(num_location, "negate number")
        let num_string = this.string_array[num_location];
        if (!num_string.startsWith('-')) {
            this.string_array[num_location] = '-' + num_string
        }
    }

    index_of_nth_space(n) {
        let space_count = 0;
        for (let i in this.string_array) {
            if (this.string_array[i] === SPACE) {
                if (space_count === n) {
                    return i
                }
                space_count += 1
            }
        }
        return -1
    }

    build_equation (evaluable = false) {
        // Build a single string containing an equation from the board by concatenating
        // the unique sublist containing an equality if such exists.
        // Returns SPACE if no such sub-list is found
        // If evaluable is true then we use characters understood by the eval method, e.g., mapping '=' -> '==='.

        let equation = EMPTY
        let as_string = this.string_array.join('')
        let chunks = as_string.split(SPACE)
        for (let chunk of chunks) {
            if (chunk.includes(EQUALS)) {
                equation = chunk
            }
        }

        if (evaluable) {
            for (const s in OP_EVAL_MAP) {
                equation = equation.replaceAll(s, OP_EVAL_MAP[s])
            }
        }
        return equation
    }
}
