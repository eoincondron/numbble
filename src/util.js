
export const EMPTY = ''
export const R_BRACKET = ')'
export const L_BRACKET = '('
export const SPACE = ' '
export const EQUALS = '='
export const PLUS = '+'
export const MINUS = '-'
export const MULTIPLY = 'X'
export const DIVIDE = '/'
export let OPERATIONS = [PLUS, MINUS, MULTIPLY, DIVIDE, EQUALS];
export let OP_EVAL_MAP = {
    '=': '===',
    'X': '*'
};
export let NUMBERS = '0123456789'.split('');
export let BRACKETS = [L_BRACKET, R_BRACKET]
let NUMBRACK = NUMBERS + BRACKETS


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
    return (chars.length > 0) && !!Math.min(...chars.map(x => NUMBRACK.includes(x)))
}


export function split_num_string(num_string) {
    // Splits a string into a list of individual characters separated by spaces.
    // Example: split_num_string('123') -. ['1', ' ', '2', ' ', '3']
    let split_locations = [];
    for (let i = 0; i < num_string.length - 1; i++) {
        if (NUMBERS.includes(num_string[i]) && NUMBERS.includes(num_string[i + 1])) {
            split_locations.push(i)
        }
    }

    let start = 0;
    let split = [];
    for (const loc of split_locations) {
        split.push(num_string.slice(start, loc + 1))
        split.push(SPACE)
        start = loc + 1
    }

    split.push(num_string.slice(start))
    return split
}

export function count_element(value, array) {
    let count = 0;
    for (let elem of array) {
         if (elem === value) {
             count += 1
         }
    }
    return count
}
