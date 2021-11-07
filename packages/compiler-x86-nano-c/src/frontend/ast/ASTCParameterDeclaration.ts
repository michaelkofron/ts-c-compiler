import {walkOverFields} from '@compiler/grammar/decorators/walkOverFields';

import {NodeLocation} from '@compiler/grammar/tree/NodeLocation';
import {ASTCCompilerKind, ASTCCompilerNode} from './ASTCCompilerNode';
import {ASTCDeclarationSpecifier} from './ASTCDeclarationSpecifier';
import {ASTCDeclarator} from './ASTCDeclarator';
import {ASTCAbstractDeclarator} from './ASTCAbstractDeclarator';

/**
 * @export
 * @class ASTCParameterDeclaration
 * @extends {ASTCCompilerNode}
 */
@walkOverFields(
  {
    fields: [
      'specifier',
      'declarator',
      'abstractDeclarator',
    ],
  },
)
export class ASTCParameterDeclaration extends ASTCCompilerNode {
  constructor(
    loc: NodeLocation,
    public readonly specifier: ASTCDeclarationSpecifier,
    public readonly declarator?: ASTCDeclarator,
    public readonly abstractDeclarator?: ASTCAbstractDeclarator,
  ) {
    super(ASTCCompilerKind.ParameterDeclaration, loc);
  }
}
