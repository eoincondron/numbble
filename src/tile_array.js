
import {random_digit, NUMBERS, L_BRACKET, R_BRACKET, SPACE, OPERATIONS} from './util.js';


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
}
