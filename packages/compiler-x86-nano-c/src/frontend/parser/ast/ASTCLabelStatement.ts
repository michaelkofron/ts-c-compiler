import {walkOverFields} from '@compiler/grammar/decorators/walkOverFields';

import {NodeLocation} from '@compiler/grammar/tree/NodeLocation';
import {Token} from '@compiler/lexer/tokens';
import {ASTCCompilerKind, ASTCCompilerNode} from './ASTCCompilerNode';

@walkOverFields(
  {
    fields: ['statement'],
  },
)
export class ASTCLabelStatement extends ASTCCompilerNode {
  constructor(
    loc: NodeLocation,
    public readonly name: Token<string>,
    public readonly statement: ASTCCompilerNode,
  ) {
    super(ASTCCompilerKind.LabelStmt, loc);
  }

  toString() {
    const {kind, name} = this;

    return ASTCCompilerNode.dumpAttributesToString(
      kind,
      {
        name: name.text,
      },
    );
  }
}