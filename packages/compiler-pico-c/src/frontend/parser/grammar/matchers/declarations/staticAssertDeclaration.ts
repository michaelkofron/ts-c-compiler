import { TokenType } from '@compiler/lexer/shared';
import { CCompilerKeyword } from '@compiler/pico-c/constants';
import { ASTCStaticAssertDeclaration } from '../../../ast/ASTCStaticAssertDeclaration';
import { CGrammar } from '../shared';

import { constantExpression } from '../expressions/constantExpression';
import { stringLiteral } from '../types/stringLiteral';

/**
 * static_assert_declaration
 *  : STATIC_ASSERT '(' constant_expression ',' STRING_LITERAL ')' ';'
 *  ;
 */
export function staticAssertDeclaration(
  grammar: CGrammar,
): ASTCStaticAssertDeclaration {
  const { g } = grammar;

  g.identifier(CCompilerKeyword.STATIC_ASSERT);
  g.terminal('(');

  const expression = constantExpression(grammar);

  g.terminalType(TokenType.COMMA);

  const literal = stringLiteral(grammar);

  g.terminal(')');
  g.terminalType(TokenType.SEMICOLON);

  return new ASTCStaticAssertDeclaration(
    expression.loc,
    expression,
    literal.stringLiteral,
  );
}
