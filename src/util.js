
const EMPTY = ''
const R_BRACKET = ')'
const L_BRACKET = '('
const SPACE = ' '
const EQUALS = '='
const PLUS = '+'
const MINUS = '-'
const MULTIPLY = 'X'
const DIVIDE = '/'
const DECIMAL_POINT = '.'
const SQUARE = '**2'
const SQRT = '**(1/2)'
const OPERATIONS = [PLUS, MINUS, MULTIPLY, DIVIDE, DECIMAL_POINT, SQUARE, SQRT];
const SPACE_FILLERS = [PLUS, MINUS, DIVIDE, MULTIPLY, DECIMAL_POINT, EQUALS]
const EXPONENTS = [SQUARE, SQRT]

const OP_EVAL_MAP = {
    '=': '===',
    'X': '*'
};

// Scoring system for operations
const OP_SCORES = {
    [PLUS]: 5,         // Plus: 5 points
    [MINUS]: 5,        // Minus: 5 points
    [MULTIPLY]: 10,    // Multiply: 10 points
    [DIVIDE]: 10,      // Divide: 10 points
    [DECIMAL_POINT]: 25, // Decimal: 25 points
    [SQUARE]: 15,      // Square: 15 points
    [SQRT]: 20,        // Square root: 20 points
    [EQUALS]: 0        // Equals: No points
};
const NUMBERS = '0123456789'.split('');
const BRACKETS = [L_BRACKET, R_BRACKET]
const NUMERICAL_STRINGS = NUMBERS.concat(BRACKETS).concat(['*'])


function random_digit(max) {
    return Math.floor(Math.random() * max);
}


function is_num_string(string) {
    // Check if a string contains digits only characters that can live in a number tile space,
    // i.e., digits, brackets and exponents
    // Feels like this should be easier but functions like Number do not handle empty strings and '+'
    // the way we want
    let chars = string.split('');
    if (chars[0] === '-') {
        chars = chars.slice(1)
    }
    return (chars.length > 0) && !!Math.min(...chars.map(x => NUMERICAL_STRINGS.includes(x)))
}


function split_num_string(num_string) {
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

function count_element(value, array) {
    let count = 0;
    for (let elem of array) {
         if (elem === value) {
             count += 1
         }
    }
    return count
}

function _isSpaceFiller(tile_symbol) {
    return SPACE_FILLERS.includes(tile_symbol)
}

// Export all functions and constants
export {
    EMPTY,
    R_BRACKET,
    L_BRACKET,
    SPACE,
    EQUALS,
    PLUS,
    MINUS,
    MULTIPLY,
    DIVIDE,
    DECIMAL_POINT,
    SQUARE,
    SQRT,
    OPERATIONS,
    SPACE_FILLERS,
    EXPONENTS,
    OP_EVAL_MAP,
    OP_SCORES,
    NUMBERS,
    BRACKETS,
    NUMERICAL_STRINGS,
    random_digit,
    is_num_string,
    split_num_string,
    count_element,
    _isSpaceFiller
};
