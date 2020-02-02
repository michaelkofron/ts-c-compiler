import * as R from 'ramda';

import {
  isQuote,
  isNewline,
  isBracket,
  matchQuote,
  matchBracket,
} from '../../utils/matchCharacter';

import {
  Token,
  NumberToken,
  TokenType,
  TokenLocation,
  RegisterToken,
  TokenKind,
} from './tokens';

/**
 * Set of all parsers
 */
export const TOKEN_PARSERS: {
  [parser: number]: (token: string, loc?: TokenLocation) => boolean|Token,
} = Object.freeze(
  {
    /** NUMBER */
    [TokenType.NUMBER]: NumberToken.parse,

    /** KEYWORD */
    [TokenType.KEYWORD]: (token: string, loc?: TokenLocation): boolean|Token => (
      RegisterToken.parse(token, loc) || true
    ),
  },
);

const SEPARATOR_CHARACTERS: {[operator: string]: TokenType} = {
  ',': TokenType.COMMA,
  '+': TokenType.PLUS,
  '-': TokenType.MINUS,
  '*': TokenType.MUL,
  '/': TokenType.DIV,
};

/**
 * Analyze single token
 *
 * @param {TokenLocation} location
 * @param {string} token
 * @returns {Token}
 */
function parseToken(location: TokenLocation, token: string): Token {
  if (!token || !token.length)
    return null;

  for (const tokenType in TOKEN_PARSERS) {
    const result = TOKEN_PARSERS[tokenType](token, location);
    if (!result)
      continue;

    // result might return boolean return from has() function
    if (result === true)
      return new Token(<any> tokenType, null, token, location.clone());

    // it might be also object without type
    if (!result?.type)
      return new Token(<any> tokenType, null, token, location.clone(), result);

    return result;
  }

  throw new Error(`Unknown "${token}" token!`);
}

/**
 * Split code into tokens
 *
 * @see
 *  It contains also lexer logic!
 *
 * @param {String} code
 *
 * @returns {Token[]}
 */
export function* lexer(code: string): IterableIterator<Token> {
  const {length} = code;
  const location = new TokenLocation;

  let tokenBuffer = '';
  let offset = 0;

  function* appendToken(token: Token): Iterable<Token> {
    if (!token)
      return;

    tokenBuffer = '';
    yield token;
  }

  function* appendCharToken(type: TokenType, character: string): IterableIterator<Token> {
    if (R.trim(tokenBuffer).length) {
      yield* appendToken(
        parseToken(location, tokenBuffer),
      );
    }

    yield* appendToken(
      new Token(
        type,
        null,
        character,
        location.clone(),
      ),
    );
  }

  function* appendTokenWithSpaces(
    type: TokenType,
    kind: TokenKind,
    fetchUntil: (str: string) => boolean,
  ): Iterable<Token> {
    tokenBuffer = '';
    for (; offset < length && !fetchUntil(code[offset]); ++offset)
      tokenBuffer += code[offset];

    yield* appendToken(
      new Token(type, kind, tokenBuffer, location.clone()),
    );

    tokenBuffer = '';
  }

  for (; offset < length; ++offset) {
    const character = code[offset];
    const newLine = isNewline(character);

    // used for logger
    if (newLine) {
      location.column = 0;
      location.row++;
    } else
      location.column++;

    // special tokens that might contain spaces inside them
    const quote = matchQuote(character);
    if (quote) {
      offset++;
      yield* appendTokenWithSpaces(TokenType.QUOTE, quote, isQuote);
      continue;
    }

    const bracket = matchBracket(character);
    if (bracket) {
      offset++;
      yield* appendTokenWithSpaces(TokenType.BRACKET, bracket, isBracket);
      continue;
    }

    // end of line
    if (newLine)
      yield* appendCharToken(TokenType.EOL, character);

    // match cahracters that divides word
    const separator = SEPARATOR_CHARACTERS[character];
    if (separator)
      yield* appendCharToken(separator, character);
    else if (character !== ' ') {
      // append character and find matching token
      tokenBuffer += character;
    } else {
      // if empty character
      yield* appendToken(
        parseToken(location, tokenBuffer),
      );
    }
  }

  // end of file
  yield* appendCharToken(TokenType.EOF, null);
}
