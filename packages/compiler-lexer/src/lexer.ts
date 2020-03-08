import * as R from 'ramda';

import {
  isComment,
  isQuote,
  isNewline,
  matchQuote,
  matchBracket,
  flipBracket,
} from './utils/matchCharacter';

import {LexerError, LexerErrorCode} from './shared/LexerError';
import {
  Token,
  TokenType,
  TokenLocation,
  TokenKind,
} from './tokens';

export type TokenParsersMap = {
  [parser: number]: (token: string, loc?: TokenLocation) => boolean|Token,
};

const SEPARATOR_CHARACTERS: {[operator: string]: TokenType} = {
  ',': TokenType.COMMA,
  ':': TokenType.COLON,
  '+': TokenType.PLUS,
  '-': TokenType.MINUS,
  '*': TokenType.MUL,
  '/': TokenType.DIV,
};

/**
 * Analyze single token
 *
 * @param {TokenParsersMap} tokensParsers
 * @param {TokenLocation} location
 * @param {string} token
 * @returns {Token}
 */
function parseToken(
  tokensParsers: TokenParsersMap,
  location: TokenLocation,
  token: string,
): Token {
  if (!token || !token.length)
    return null;

  for (const tokenType in tokensParsers) {
    const result = tokensParsers[tokenType](token, location);
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

  throw new LexerError(LexerErrorCode.UNKNOWN_TOKEN, null, {token});
}

/**
 * Split code into tokens
 *
 * @see
 *  It contains also lexer logic!
 *
 * @export
 * @param {TokenParsersMap} tokensParsers
 * @param {string} code
 * @param {boolean} [appendEOF=true]
 * @param {boolean} [signOperatorsAsSeparateTokens=false]
 * @returns {IterableIterator<Token>}
 */
export function* lexer(
  tokensParsers: TokenParsersMap,
  code: string,
  appendEOF: boolean = true,
  signOperatorsAsSeparateTokens: boolean = false,
): IterableIterator<Token> {
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
        parseToken(tokensParsers, location, tokenBuffer),
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
    for (;; ++offset) {
      if (fetchUntil(code[offset]))
        break;

      if (offset >= length)
        throw new LexerError(LexerErrorCode.UNTERMINATED_STRING);

      tokenBuffer += code[offset];
    }

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

    // ignore line, it is comment
    if (isComment(character)) {
      for (; offset < length - 1; ++offset) {
        if (isNewline(code[offset + 1]))
          break;
      }
      continue;
    }

    // special tokens that might contain spaces inside them
    const quote = matchQuote(character);
    if (quote) {
      if (tokenBuffer)
        throw new LexerError(LexerErrorCode.UNKNOWN_TOKEN, null, {token: tokenBuffer});

      offset++;
      yield* appendTokenWithSpaces(TokenType.QUOTE, quote, isQuote);
      continue;
    }

    const bracket = matchBracket(character);
    if (bracket) {
      if (tokenBuffer)
        throw new LexerError(LexerErrorCode.UNKNOWN_TOKEN, null, {token: tokenBuffer});

      const flippedBracket = flipBracket(character);
      let nesting = 1;

      offset++;
      yield* appendTokenWithSpaces(
        TokenType.BRACKET,
        bracket,
        (c) => {
          if (c === character)
            nesting++;
          else if (c === flippedBracket)
            nesting--;

          return nesting <= 0;
        },
      );
      continue;
    }

    // end of line
    if (newLine)
      yield* appendCharToken(TokenType.EOL, character);
    else {
      // match cahracters that divides word
      const separator = SEPARATOR_CHARACTERS[character];

      if (separator) {
        // numbers - +1, -2
        if (!signOperatorsAsSeparateTokens
            && (separator === TokenType.PLUS || separator === TokenType.MINUS)
            && Number.isInteger(+code[offset + 1]))
          tokenBuffer += character;
        else
          yield* appendCharToken(separator, character);
      } else if (character !== ' ') {
        // append character and find matching token
        tokenBuffer += character;
      } else {
        // if empty character
        yield* appendToken(
          parseToken(tokensParsers, location, tokenBuffer),
        );
      }
    }
  }

  if (tokenBuffer) {
    yield* appendToken(
      parseToken(tokensParsers, location, tokenBuffer),
    );
  }

  // end of file
  if (appendEOF)
    yield* appendCharToken(TokenType.EOF, null);
}