import * as R from 'ramda';

import { NodeLocation } from '@compiler/grammar/tree/NodeLocation';
import { CTypeQualifier } from '@compiler/pico-c/constants';
import { SyntaxError } from '@compiler/grammar/Grammar';
import { ASTCTypeQualifiersList } from '@compiler/pico-c/frontend/parser/ast';
import { CGrammar } from '../shared';

import { matchTypeQualifier } from './typeQualifier';

/**
 * type_qualifier_list
 *  : type_qualifier
 *  | type_qualifier_list type_qualifier
 *  ;
 */
export function typeQualifiers(grammar: CGrammar): ASTCTypeQualifiersList {
  const { g } = grammar;
  const items: CTypeQualifier[] = [];

  let loc: NodeLocation = null;

  do {
    if (!loc) {
      loc = NodeLocation.fromTokenLoc(g.currentToken.loc);
    }

    const result = g.try(() => matchTypeQualifier(grammar));
    if (!result) {
      break;
    }

    items.push(result);
  } while (true);

  if (R.isEmpty(items)) {
    throw new SyntaxError();
  }

  return new ASTCTypeQualifiersList(loc, items);
}
