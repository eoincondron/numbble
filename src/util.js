
export const R_BRACKET = ')';
export const L_BRACKET = '(';
export const SPACE = ' ';
export const EQUALS = '='
export let OPERATIONS = ['+', '-', '/', 'X'];
export let OP_EVAL_MAP = {
    '=': '===',
    'X': '*'
};
export let NUMBERS = '0123456789'.split('');


export function random_digit(max) {
    return Math.floor(Math.random() * max);
}


export function is_num_string(string) {
    // Check if a string contains digits only except for an optional negative sign at the beginning
    // Feels like this should be easier but functions like Number do not handle empty strings and '+'
    // the way we want
    let chars = string.split('');
    if (chars[0] === '-') {
        chars = chars.slice(1)
    }
    return (chars.length > 0) && !!Math.min(...chars.map(x => NUMBERS.includes(x)))
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
