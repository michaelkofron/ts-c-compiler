import { walkOverFields } from '@compiler/grammar/decorators/walkOverFields';

import { NodeLocation } from '@compiler/grammar/tree/NodeLocation';
import { ASTCCompilerKind, ASTCCompilerNode } from './ASTCCompilerNode';

/**
 * Statement with:
 *  dupa:
 */
@walkOverFields({
  fields: ['expression', 'statement'],
})
export class ASTCCaseStatement extends ASTCCompilerNode {
  constructor(
    loc: NodeLocation,
    readonly expression: ASTCCompilerNode,
    readonly statement: ASTCCompilerNode,
  ) {
    super(ASTCCompilerKind.CaseStmt, loc);
  }
}

/**
 * Statement with:
 *  default:
 */
@walkOverFields({
  fields: ['statement'],
})
export class ASTCDefaultCaseStatement extends ASTCCompilerNode {
  constructor(loc: NodeLocation, readonly statement: ASTCCompilerNode) {
    super(ASTCCompilerKind.DefaultCaseStmt, loc);
  }
}
