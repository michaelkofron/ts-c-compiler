import { TokenType } from '@compiler/lexer/shared';
import { CGrammar } from '../shared';
import { ASTCTreeNode } from '../../../ast';

import { createLeftRecursiveOperatorMatcher } from '../utils';
import { multiplicativeExpression } from './multiplicativeExpression';

/**
 * @see
 * add = mul add'
 * add' = ε
 * add' = "+" mul add'
 * add' = "-" mul add'
 */
const additiveOp = createLeftRecursiveOperatorMatcher({
  parentExpression: multiplicativeExpression,
  operator: [TokenType.PLUS, TokenType.MINUS],
}).op;

export function additiveExpression(grammar: CGrammar): ASTCTreeNode {
  const { g } = grammar;

  return <ASTCTreeNode>g.or({
    additiveOp: () => additiveOp(grammar),
    empty: () => multiplicativeExpression(grammar),
  });
}
