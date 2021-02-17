
import {random_digit, NUMBERS, L_BRACKET, R_BRACKET, SPACE, OPERATIONS, split_num_string, is_num_string} from './util.js';


export class TileArray {

    // Class for storing array of numbers, spaces and active tiles, everything need for the equation
    // Has interface for manipulating an array in allowable ways and knows how to build and resolve its equation.
    // All entries are represented as strings.

    constructor(n_numbers) {
        this.n_numbers = n_numbers;
        this.array = this.initialize_array()
    }

    initialize_array() {
        let array = Array(2 * this.n_numbers - 1);  // length accommodates spaces and numbers
        for (let i = 0; i < this.n_numbers; i++) {
            array[2 * i] = random_digit(10).toString();
            if (i <= this.n_numbers) {
                array[2 * i + 1] = SPACE;
            }
        }
        return array;
    }

    join_numbers(space_location) {
        // Join adjacent numbers by removing a space. This should be called when an empty space tile is clicked.
        // If brackets are in the way we do nothing as this is valid state.
        // If space is not empty we throw as the method should not be called in this state
        // If the space has other non-numeric characters adjacent we throw as this is invalid state.
        let content = this.array[space_location];
        if (content !== SPACE) {
            throw "Cannot join numbers, space contains " + content;
        }
        let to_left = this.array[space_location - 1];
        if (to_left === R_BRACKET) {
            return
            // Maybe we want to raise here and catch downstream. Decide Later.
            // We may also want to allow it if there is a left bracket to the right.
        }
        let to_right = this.array[space_location + 1];
        if (to_right === L_BRACKET) {
            return
        }
        if (!(NUMBERS.includes(to_left) && NUMBERS.includes(to_right))) {
            throw "Space is adjacent non-numeric characters :".concat(to_left, ', ', to_right)
        }
        this.array[space_location - 1] = to_left + to_right; // numbers are represented as strings
        this.array.splice(space_location, 2);
    }

    split_numbers(location) {
        // Replace multi-digit number at location with a sub-list of individual digits and spaces.
        // Used to reverse calls to join_numbers
        let content = this.array[location];
        let split = split_num_string(content);
        this.array.splice(location, 1, ...split)
    }

    insert_operation(space_location, operation) {
        // Insert an operation into an empty space.
        // Throw if array does not contain a SPACE at space_location.
        let content = this.array[space_location];
        if (content === SPACE) {
            this.array[space_location] = operation;
        } else {
            throw "Cannot insert operation, space contains " + content;
        }
    }

    remove_operation(op_location) {
        // Remove an operation from the array, replacing with a SPACE.
        // Throw if array does not contain an operation at the given location.
        let content = this.array[op_location];
        if (OPERATIONS.includes(content)) {
            this.array[op_location] = SPACE;
        } else {
            throw "Cannot remove operation, space contains " + content;
        }
    }

    _check_contain_num_at(num_location, action) {
        let content = this.array[num_location];
        let msg = "Cannot " + action;
        if (!is_num_string(content)) {
            throw msg.concat(" as there is no number at ", num_location, ". Content: ", content)
        }
    }

    insert_left_bracket(num_location) {
        // Insert a bracket to the left of the chosen number
        // Throw if array does not contain number
        this._check_contain_num_at(num_location, 'insert a bracket')
        this.array.splice(num_location, 0, L_BRACKET)
    }

    insert_right_bracket(num_location) {
        // Inert a bracket to the right of the chosen number
        // Throw if array does not contain number
        this._check_contain_num_at(num_location, 'insert a bracket')
        this.array.splice(num_location + 1, 0, R_BRACKET)
    }
}
