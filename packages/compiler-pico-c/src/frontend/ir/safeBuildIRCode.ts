import { Result, err, ok } from '@compiler/core/monads';

import { CScopeTree } from '../analyze';
import { IRGeneratorConfig } from './constants';
import { IRError, IRErrorCode } from './errors/IRError';
import { IRScopeGeneratorResult } from './generator/emitters';
import { IRGeneratorGlobalVisitor } from './generator';

import { optimizeIRResult } from './optimizer';

export type IRCodeBuilderResult = IRScopeGeneratorResult;

export function safeBuildIRCode(
  config: IRGeneratorConfig,
  tree: CScopeTree,
): Result<IRCodeBuilderResult, IRError[]> {
  try {
    const ir = new IRGeneratorGlobalVisitor(config).visit(tree).flush();
    const optimizedIr = optimizeIRResult(config.optimization, ir);

    return ok(optimizedIr);
  } catch (e) {
    e.code = e.code ?? IRErrorCode.GENERATOR_ERROR;

    return err([e]);
  }
}
