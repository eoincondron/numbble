
import {split_num_string, random_digit, NUMBERS, SPACE, is_num_string, L_BRACKET, R_BRACKET} from './src/util.js';
import {TileArray} from './src/tile_array.js';

let log = console.log;

export let OP_EVAL_MAP = {
    '=': '===',
    'X': '*'
}



// log(split_num_string('12'))
// log(split_num_string('123'))
// log(split_num_string('1234'))
// log(random_digit(9))
// log(NUMBERS)
// log('34'.substring(0, 1))
let ta = new TileArray([1, 2, 3]);
ta.tile_array = ["71", "+", "0", "=", "0", "+", "71"];
log(ta._get_sub_lists())
log(ta.build_equation(true))
//
// log(ta.tile_array)
// log(ta._build_display_string())
// ta.join_numbers(1)
// log(ta._build_display_string())
// ta.split_numbers(0)
// log(ta._build_display_string())
// ta.insert_operation(1, '+')
// ta.insert_operation(3, '-')
// log(ta._build_display_string())
// ta.remove_operation(1)
// log(ta._build_display_string())
// ta.insert_left_bracket(0)
// log(ta._build_display_string())
// ta.insert_left_bracket(1)
// log(ta._build_display_string())
// log(!NUMBERS.includes(ta.tile_array[4]))
// ta.insert_right_bracket(4)
// log(ta._build_display_string())
// ta._check_contains_num_at(4, 'check')
// ta.remove_brackets(4)
// ta.remove_brackets(2)
// log(ta._build_display_string())
// // ta.remove_brackets(0)
// ta.insert_operation(1, '=')
// log(ta._get_sub_lists())
// log(ta.build_equation())
// log(ta.build_equation(true))
//





// render() {
//     let style_left = 0;
//     let objs = [];
//     let i;
//     for (i = 0; i < this.array.length; i++) {
//         let content = this.array[i];
//         if (content === L_BRACKET || content === R_BRACKET) {
//             objs.push(this.renderActiveBracket(style_left, content));
//             style_left += BRACKET_WIDTH;
//         }
//         else if (content === SPACE) {
//             objs.push(this.renderSpacer(style_left))
//             style_left += SPACE_WIDTH;
//         }
//         else if (OPERATIONS.includes(content)) {
//             objs.push(this.renderActiveOp(style_left))
//             style_left += OP_WIDTH;
//         }
//         else {
//             let char1 = content.substring(0, 1);
//             if (!(NUMBERS.includes(char1))) {
//                 throw "content must be a space, bracket, operation or number"
//             }
//             if (content.length === 1) {
//                 objs.push(this.renderSingleNum(style_left, content))
//                 style_left += NUM_WIDTH;
//             }
//             else {
//                 objs.push(this.renderMultiNum(style_left, content))
//             }
//         }
//         return (
//             <div className="tile_array">
//                 {objs}
//             </div>
//         );
//     }
// }
