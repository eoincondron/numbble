
export const R_BRACKET = ')';
export const L_BRACKET = '(';
export const SPACE = ' ';
export let OPERATIONS = ['+', '-', '/', 'X'];
export let NUMBERS = '0123456789'.split('');


export function random_digit(max) {
    return Math.floor(Math.random() * max);
}


export function split_num_string(num_string) {
    // Splits a string into a list of individual characters separated by spaces.
    // Example: split_num_string('123') -. ['1', ' ', '2', ' ', '3']
    let chars = num_string.split('')
    if (chars.length === 0 || !NUMBERS.includes(chars[0])) {
        throw "Cannot split num string: " + num_string;
    }
    let n_chars = chars.length;
    for (let i = 0; i < n_chars - 1; i++) {
        chars.splice(2*i + 1, 0, SPACE)
    }
    return chars
}
