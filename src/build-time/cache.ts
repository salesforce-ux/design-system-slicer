// Copyright (c) 2015-present, salesforce.com, inc. All rights reserved
// Licensed under BSD 3-Clause - see LICENSE.txt or git.io/sfdc-license

import Immutable from 'immutable';

import {
  Reducer,
  extractTags,
  extractClassNames,
  extractSelectorsFromAtRuleAndRecurse,
  extractAnimations
} from './reducers';

import { Cache, CacheItem } from '../types';

import { getAllRulesFromCss, Rule } from './lib/parse-css';

const extractTagsAndClassNames: Reducer = extractTags.concat(extractClassNames);

// order matters
const extractSelectorPartsAndAssociateCss: Reducer = extractSelectorsFromAtRuleAndRecurse(
  extractTagsAndClassNames
).concat(extractTagsAndClassNames);

const mapSelectorsToMatchingCss = (rules: Rule[]): Cache => {
  const acc = Immutable.List(rules).reduce(
    extractAnimations.run,
    Immutable.List()
  );

  return Immutable.List(rules).reduce(
    extractSelectorPartsAndAssociateCss.run,
    acc
  );
};

export const create = (css: string): Promise<Cache> =>
  getAllRulesFromCss(css).then(mapSelectorsToMatchingCss);
