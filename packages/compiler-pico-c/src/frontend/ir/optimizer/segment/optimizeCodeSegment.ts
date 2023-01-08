import * as R from 'ramda';

import { IRCodeSegmentBuilderResult } from '../../generator';
import { optimizeInstructionsBlock } from '../block';

export function optimizeCodeSegment(
  segment: IRCodeSegmentBuilderResult,
): IRCodeSegmentBuilderResult {
  return {
    ...segment,
    functions: R.mapObjIndexed(
      fn => ({
        ...fn,
        block: optimizeInstructionsBlock(fn.block),
      }),
      segment.functions,
    ),
  };
}