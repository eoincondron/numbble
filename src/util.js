
export const R_BRACKET = ')';
export const L_BRACKET = '(';
export const SPACE = ' ';
export let OPERATIONS = ['+', '-', '/', 'X'];
export let NUMBERS = '0123456789'.split('');


export function random_digit(max) {
    return Math.floor(Math.random() * max);
}
