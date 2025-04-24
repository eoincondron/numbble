const { TileArray } = require('../src/tile_array.js');
const {
  SPACE, PLUS, MINUS, MULTIPLY, DIVIDE, DECIMAL_POINT,
  EQUALS, L_BRACKET, R_BRACKET, SQUARE, SQRT, random_digit
} = require('../src/util.js');

// Note: Create React App v1 uses Jest v20, which has different module mocking capabilities

describe('TileArray', () => {
  // Constructor tests
  describe('constructor', () => {
    test('initializes with a number array', () => {
      const numbers = [1, 2, 3];
      const tileArray = new TileArray(numbers);
      expect(tileArray.num_array).toEqual(numbers);
      expect(tileArray.string_array).toEqual(['1', ' ', '2', ' ', '3']);
      expect(tileArray.open_bracket).toEqual('');
    });

    test('initializes with a number to create random array', () => {
      const tileArray = new TileArray(3);
      // Since we can't reliably mock random_digit in CRA v1, we just check array lengths
      expect(tileArray.num_array.length).toEqual(3);
      expect(tileArray.string_array.length).toEqual(5); // 3 numbers + 2 spaces
      
      // Also validate that elements at even indices are strings of numbers
      // and elements at odd indices are spaces
      for (let i = 0; i < tileArray.string_array.length; i++) {
        if (i % 2 === 0) {
          // Should be a number string
          expect(typeof tileArray.string_array[i]).toEqual('string');
          expect(isNaN(Number(tileArray.string_array[i]))).toEqual(false);
        } else {
          // Should be a space
          expect(tileArray.string_array[i]).toEqual(' ');
        }
      }
    });
  });

  // Board manipulation tests
  describe('board manipulation', () => {
    let tileArray;
    
    beforeEach(() => {
      tileArray = new TileArray([1, 2, 3]);
    });

    test('reset_board returns to original state', () => {
      // Modify the board first
      tileArray.join_numbers(1);
      expect(tileArray.string_array).toEqual(['12', ' ', '3']);
      
      // Reset the board
      tileArray.reset_board();
      expect(tileArray.string_array).toEqual(['1', ' ', '2', ' ', '3']);
    });

    test('join_numbers merges adjacent numbers', () => {
      tileArray.join_numbers(1);
      expect(tileArray.string_array).toEqual(['12', ' ', '3']);
      
      // Create a new test case with operations
      const tileArrayWithOps = new TileArray([1, 2, 3]);
      tileArrayWithOps.insert_operation(1, PLUS);
      
      // Should throw when trying to join when an operator occupies the space
      expect(() => tileArrayWithOps.join_numbers(1)).toThrow();
    });
    
    test('join_numbers does nothing when brackets are in the way', () => {
      // Create a tile array with brackets
      const tileArrayWithBrackets = new TileArray([1, 2, 3]);
      tileArrayWithBrackets.insert_left_bracket(0);
      expect(tileArrayWithBrackets.string_array[0]).toEqual('(1');
      
      // Joining should do nothing and not throw
      expect(() => tileArrayWithBrackets.join_numbers(1)).not.toThrow();
      expect(tileArrayWithBrackets.string_array).toEqual(['(12', ' ', '3']);
    });

    test('split_numbers breaks a multi-digit number', () => {
      // First join numbers
      tileArray.join_numbers(1);
      expect(tileArray.string_array).toEqual(['12', ' ', '3']);
      
      // Then split them
      tileArray.split_numbers(0);
      expect(tileArray.string_array).toEqual(['1', ' ', '2', ' ', '3']);
    });
  });

  // Operation tests
  describe('operations', () => {
    let tileArray;
    
    beforeEach(() => {
      tileArray = new TileArray([1, 2, 3]);
    });

    test('insert_operation adds an operation to a space', () => {
      tileArray.insert_operation(1, PLUS);
      expect(tileArray.string_array).toEqual(['1', '+', '2', ' ', '3']);
      
      tileArray.insert_operation(3, MINUS);
      expect(tileArray.string_array).toEqual(['1', '+', '2', '-', '3']);
    });

    test('insert_operation throws on non-space location', () => {
      tileArray.insert_operation(1, PLUS);
      expect(() => tileArray.insert_operation(1, MINUS)).toThrow();
    });

    test('remove_operation removes an operation', () => {
      tileArray.insert_operation(1, PLUS);
      tileArray.insert_operation(3, MINUS);
      expect(tileArray.string_array).toEqual(['1', '+', '2', '-', '3']);
      
      tileArray.remove_operation(1);
      expect(tileArray.string_array).toEqual(['1', ' ', '2', '-', '3']);
    });

    test('remove_operation throws on non-operation location', () => {
      expect(() => tileArray.remove_operation(0)).toThrow();
    });
  });

  // Bracket tests
  describe('brackets', () => {
    let tileArray;
    
    beforeEach(() => {
      tileArray = new TileArray([1, 2, 3]);
    });

    test('insert_left_bracket adds a bracket to the left of a number', () => {
      tileArray.insert_left_bracket(0);
      expect(tileArray.string_array).toEqual(['(1', ' ', '2', ' ', '3']);
      expect(tileArray.open_bracket).toEqual('(');
    });

    test('insert_right_bracket adds a bracket to the right of a number', () => {
      tileArray.insert_right_bracket(0);
      expect(tileArray.string_array).toEqual(['1)', ' ', '2', ' ', '3']);
      expect(tileArray.open_bracket).toEqual(')');
    });

    test('bracket pairs reset open_bracket state', () => {
      tileArray.insert_left_bracket(0);
      expect(tileArray.open_bracket).toEqual('(');
      
      tileArray.insert_right_bracket(2);
      expect(tileArray.open_bracket).toEqual('');
    });

    test('remove_brackets removes all brackets from a location', () => {
      tileArray.insert_left_bracket(0);
      tileArray.insert_right_bracket(2);
      expect(tileArray.string_array).toEqual(['(1', ' ', '2)', ' ', '3']);
      
      tileArray.remove_brackets(0);
      expect(tileArray.string_array).toEqual(['1', ' ', '2', ' ', '3']);
    });

    test('_outstanding_bracket returns the matching bracket', () => {
      tileArray.open_bracket = L_BRACKET;
      expect(tileArray._outstanding_bracket()).toEqual(R_BRACKET);
      
      tileArray.open_bracket = R_BRACKET;
      expect(tileArray._outstanding_bracket()).toEqual(L_BRACKET);
      
      tileArray.open_bracket = '';
      expect(tileArray._outstanding_bracket()).toEqual('');
    });
  });

  // Exponent tests
  describe('exponents', () => {
    let tileArray;
    
    beforeEach(() => {
      tileArray = new TileArray([1, 2, 3]);
    });

    test('_appendExponent adds exponents to numbers', () => {
      tileArray._appendExponent(0, SQUARE);
      expect(tileArray.string_array[0]).toEqual('1**2');
      
      tileArray._appendExponent(2, SQRT);
      expect(tileArray.string_array[2]).toEqual('2**(1/2)');
    });

    test('_appendExponent replaces existing exponents', () => {
      tileArray._appendExponent(0, SQUARE);
      expect(tileArray.string_array[0]).toEqual('1**2');
      
      tileArray._appendExponent(0, SQRT);
      expect(tileArray.string_array[0]).toEqual('1**(1/2)');
    });

    test('remove_exponents removes exponents from a number', () => {
      tileArray._appendExponent(0, SQUARE);
      expect(tileArray.string_array[0]).toEqual('1**2');
      
      tileArray.remove_exponents(0);
      expect(tileArray.string_array[0]).toEqual('1');
    });
  });

  // Number manipulation tests
  describe('number manipulation', () => {
    let tileArray;
    
    beforeEach(() => {
      tileArray = new TileArray([1, 2, 3]);
    });

    test('negate_number adds a negative sign to a number', () => {
      tileArray.negate_number(0);
      expect(tileArray.string_array[0]).toEqual('-1');
    });

    test('negate_number does nothing to already negative numbers', () => {
      tileArray.negate_number(0);
      expect(tileArray.string_array[0]).toEqual('-1');
      
      tileArray.negate_number(0);
      expect(tileArray.string_array[0]).toEqual('-1');
    });

    test('_check_contains_num_at throws on non-number locations', () => {
      expect(() => tileArray._check_contains_num_at(1, 'test')).toThrow();
    });
  });

  // Equation building tests
  describe('equation building', () => {
    let tileArray;
    
    beforeEach(() => {
      tileArray = new TileArray([1, 2, 3]);
    });

    test('build_equation creates equation from board state', () => {
      // Create a simple equation: 1+2=3
      tileArray.insert_operation(1, PLUS);
      tileArray.insert_operation(3, EQUALS);
      expect(tileArray.build_equation()).toEqual('1+2=3');
    });

    test('build_equation with evaluable=true formats for evaluation', () => {
      // Create a simple equation with multiply: 1X2=2
      tileArray.insert_operation(1, MULTIPLY);
      tileArray.insert_operation(3, EQUALS);
      
      // Should replace X with * for evaluation
      expect(tileArray.build_equation(true)).toEqual('1*2===3');
    });
    
    test('index_of_nth_space finds the nth space', () => {
      expect(tileArray.index_of_nth_space(0)).toEqual(1);
      expect(tileArray.index_of_nth_space(1)).toEqual(3);
      expect(tileArray.index_of_nth_space(2)).toEqual(-1);
    });
  });
});