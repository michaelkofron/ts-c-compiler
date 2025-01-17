import { isCompilerTreeNode } from '@compiler/pico-c/frontend/parser';

import { AbstractTreeVisitor } from '@compiler/grammar/tree/AbstractTreeVisitor';
import { CVariableInitializeValue } from '../../scope/variables';

export class CVariableInitializerVisitor extends AbstractTreeVisitor<CVariableInitializeValue> {
  shouldVisitNode(node: CVariableInitializeValue): boolean {
    return !isCompilerTreeNode(node);
  }
}
