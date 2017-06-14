export const STORE = {
  compare : [
  'eq', // == 
  'ne', // !=
  'gt', // >  
  'ge', // >=
  'lt', // <
  'le', // <=
  ],
  logical : [
    'and', // &&
    'or', // ||
    'not' // !
  ],
  arethmatic : [
  'add', // +
  'sub', // -
  'mul', // *
  'div', // /
  'mod' // ???
  ],
  functions : [

  // operators for strings

  'substringof',
  'endswith',
  'startswith',
  'length',
  'indexof',
  'replace',
  'substring',
  'tolower',
  'toupper',
  'trim',
  'concat',

  // operators for Date

  'second',
  'minute',
  'hour',
  'day',
  'month',
  'year',

  // operators for math

  'round',
  'floor',
  'ceiling',

  // boolean operator

  'isof'
  ],
  format : [
  'atom',
  'json',
  'xml'
  ],
  inlineCount : [
  'allpages',
  'none'
  ]
}