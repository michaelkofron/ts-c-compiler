import { Result, ok, err } from '@compiler/core/monads/Result';
import { Token } from '@compiler/lexer/tokens';
import { ASTCTreeNode } from '../ast';
import { CGrammarError, CGrammarErrorCode } from './errors/CGrammarError';
import { createCCompilerGrammar } from './grammar';

/**
 * Generates C syntax AST tree
 */
export function generateTree(tokens: Token[]): ASTCTreeNode {
  return createCCompilerGrammar().process(tokens);
}

/**
 * Returns result monad from tree generator
 */
export function safeGenerateTree(
  tokens: Token[],
): Result<ASTCTreeNode, CGrammarError[]> {
  try {
    return ok(generateTree(tokens));
  } catch (e) {
    e.code = e.code ?? CGrammarErrorCode.SYNTAX_ERROR;

    return err([e]);
  }
}
