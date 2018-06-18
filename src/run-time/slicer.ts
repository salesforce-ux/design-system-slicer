// Copyright (c) 2015-present, salesforce.com, inc. All rights reserved
// Licensed under BSD 3-Clause - see LICENSE.txt or git.io/sfdc-license

import { Cache, CacheItem, Selector } from '../types';
import { uniq, intersectionBy } from './lib/set-fns';

export type Css = string;
export type Slicer = {
  slice: (...selectors: string[]) => Css;
  normalize: (...elements: string[]) => Css;
};

const ruleDoesNotContainSelectorWithClassName = (rule: CacheItem) =>
  rule.selectors.some(
    selector => !rule.css.match(RegExp('\\' + selector + '.[a-zA-Z-_d]+'))
  );

const sliceForAndAssociateAnimations = (
  cache: Cache,
  ...passedInSelectors: string[]
): CacheItem[] => {
  let rules = sliceFor(cache, ...passedInSelectors);
  return rules.reduce(
    (acc, rule) =>
      acc.concat(associateAnimations(cache, rule.relatedSelectors)),
    rules
  );
};

const associateAnimations = (
  cache: Cache,
  passedInSelectors: string[]
): CacheItem[] =>
  uniq(
    cache
      .filter(slice => slice.type === 'animation')
      .filter(slice =>
        intersectionBy(slice.selectors, passedInSelectors, (sel, key) =>
          sel.startsWith(key)
        )
      )
  );

const sliceFor = (cache: Cache, ...passedInSelectors: string[]): CacheItem[] =>
  uniq(
    cache.filter(slice =>
      intersectionBy(slice.selectors, passedInSelectors, (sel, key) =>
        sel.startsWith(key)
      )
    )
  );

export const create = (cache: Cache): Slicer => ({
  slice: (...selectors: string[]): Css =>
    sliceForAndAssociateAnimations(cache, ...selectors)
      .map(rule => rule.css)
      .join('\n'),
  normalize: (...elements: string[]): Css =>
    elements.length > 0
      ? sliceForAndAssociateAnimations(cache, ...elements)
          .filter(ruleDoesNotContainSelectorWithClassName)
          .map(rule => rule.css)
          .join('\n')
      : cache
          .filter(k => k.type === 'html')
          .filter(ruleDoesNotContainSelectorWithClassName)
          .map(rule => rule.css)
          .join('\n')
});
