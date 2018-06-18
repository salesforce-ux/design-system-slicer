// Copyright (c) 2015-present, salesforce.com, inc. All rights reserved
// Licensed under BSD 3-Clause - see LICENSE.txt or git.io/sfdc-license

import Immutable from 'immutable';
import escapeRegExp from 'lodash.escaperegexp';

import {
  parseClassNames,
  parseTagNames,
  Rule,
  Selector
} from './lib/parse-css';

import { CacheItem } from '../types';

export type ReducingFn<S = any> = (state: S, value: any) => S;

export type Semigroup<S = any> = (x: S) => S;

export type Reducer = { run: ReducingFn; concat: Semigroup<Reducer> };

const reducer = (run: ReducingFn): Reducer => ({
  run,
  concat: other => reducer((acc, rule) => other.run(run(acc, rule), rule))
});

const getAnimationsForCSS = (animationRules: CacheItem[], css: string) =>
  animationRules
    .filter(animationRule =>
      animationRule.selectors.some(
        selector =>
          !!css.match(
            RegExp('(?:animation: |animation-name: )' + selector + '[; ]')
          )
      )
    )
    .map(animationRule => animationRule.selectors[0]);

const tagNameEqualsAnimationName = (
  tagName: string,
  animationRules: CacheItem[]
) =>
  tagName === 'to' ||
  tagName === 'slds' ||
  animationRules.some(rule =>
    rule.selectors.some(selector => selector === tagName)
  );

const extractTags: Reducer = reducer((acc, rule) => {
  const animationRules = acc.filter((r: Rule) => r.type === 'animation');
  const tags = Immutable.Set(parseTagNames(rule.selector)).filter(
    tagName => !tagNameEqualsAnimationName(tagName, animationRules)
  );
  return tags.count() > 0
    ? acc.push({
        selectors: tags,
        css: rule.toString(),
        type: 'html',
        relatedSelectors: getAnimationsForCSS(animationRules, rule.toString())
      })
    : acc;
});

const extractClassNames: Reducer = reducer((acc, rule) => {
  const classes = Immutable.Set(parseClassNames(rule.selector));
  return classes.count() > 0
    ? acc.push({
        selectors: classes.toArray(),
        css: rule.toString(),
        type: 'className',
        relatedSelectors: getAnimationsForCSS(
          acc.filter((r: Rule) => r.type === 'animation'),
          rule.toString()
        )
      })
    : acc;
});

const extractAnimations: Reducer = reducer(
  (acc, rule) =>
    rule.type === 'animation' && rule.name === 'keyframes'
      ? acc.push({
          selectors: [rule.selector],
          css: rule.toString(),
          type: rule.type
        })
      : acc
);

const extractSelectorsFromAtRuleAndRecurse = (recurse: Reducer): Reducer =>
  reducer((acc, rule) => {
    return rule.type === 'atrule' && rule.name === 'media'
      ? (rule.nodes || [])
          .filter((n: Rule) => n.selector)
          .reduce(recurse.run, acc)
      : acc;
  });

export {
  extractTags,
  extractClassNames,
  extractSelectorsFromAtRuleAndRecurse,
  extractAnimations
};
