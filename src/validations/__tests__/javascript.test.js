import partialRight from 'lodash-es/partialRight';

import javascript from '../javascript';

import testValidatorAcceptance from './testValidatorAcceptance';
import validationTest from './validationHelper';

const analyzer = {
  enabledLibraries: [],
  containsExternalScript: false,
};

const analyzerWithjQuery = {
  enabledLibraries: ['jquery'],
  containsExternalScript: false,
};

const analyzerWithExternalScript = {
  enabledLibraries: [],
  containsExternalScript: true,
};

describe('javascript validation', () => {
  test('invalid LHS error followed by comment', () =>
    validationTest(
      `alert(--"str"
    // comment`,
      partialRight(javascript, analyzer),
      {reason: 'missing-token', row: 0, payload: {token: ')'}},
      {reason: 'invalid-left-hand-string', row: 1, payload: {value: '"str"'}},
    ));

  test('for loop with only initializer', () =>
    validationTest(
      'for(var count=1){',
      partialRight(javascript, analyzer),
      {
        reason: 'strict-operators.custom-case',
        row: 0,
        payload: {goodOperator: ';', badOperator: ')'},
      },
      {
        reason: 'unmatched',
        row: 0,
        payload: {openingSymbol: '{', closingSymbol: '}'},
      },
    ));

  test('undeclared variable', () =>
    validationTest(
      'TinyTurtle.whatever();',
      partialRight(javascript, analyzer),
      {
        reason: 'declare-variable',
        row: 0,
        payload: {variable: 'TinyTurtle'},
      },
    ));

  test('undeclared variable with external script', () =>
    validationTest(
      'TinyTurtle.whatever();',
      partialRight(javascript, analyzerWithExternalScript),
    ));

  test('function used before it is declared', () =>
    validationTest(
      `myFunction();
    function myFunction() {
        return true;
    }`,
      partialRight(javascript, analyzer),
    ));

  test('duplicated variable declaration', () =>
    validationTest(
      `let a = 1;
      let a = 2;`,
      partialRight(javascript, analyzer),
      {
        reason: 'duplicated-declaration',
        row: 1,
        payload: {variable: 'a'},
      },
    ));

  testValidatorAcceptance(
    partialRight(javascript, analyzerWithjQuery),
    'javascript',
  );
});
