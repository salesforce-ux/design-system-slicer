// Copyright (c) 2015-present, salesforce.com, inc. All rights reserved
// Licensed under BSD 3-Clause - see LICENSE.txt or git.io/sfdc-license

import Immutable from 'immutable';

import { CacheBuildState, CacheItem } from '../types';
import escapeRegExp from 'lodash.escaperegexp';

import {
  parseClassNames,
  parseTagNames,
  Rule,
  Selector
} from './lib/parse-css';

export type ReducingFn<S = any> = (state: S, value: any) => S;

export type Semigroup<S = any> = (x: S) => S;

export type Reducer = { run: ReducingFn; concat: Semigroup<Reducer> };

const reducer = (run: ReducingFn): Reducer => ({
  run,
  concat: other => reducer((acc, rule) => other.run(run(acc, rule), rule))
});

const extractTags: Reducer = reducer((acc, rule) => {
  const tags = Immutable.Set(parseTagNames(rule.selector));
  return tags.count() > 0
    ? acc.push({ selectors: tags, css: rule.toString(), type: 'html' })
    : acc;
});

const extractClassNames: Reducer = reducer((acc, rule) => {
  const classes = Immutable.Set(parseClassNames(rule.selector));
  return classes.count() > 0
    ? acc.push({
        selectors: classes.toArray(),
        css: rule.toString(),
        type: 'className'
      })
    : acc;
});

const extractSelectorsFromAtRuleAndRecurse = (recurse: Reducer): Reducer =>
  reducer(
    (acc, rule) =>
      rule.type === 'atrule' && rule.name === 'media'
        ? (rule.nodes || [])
            .filter((n: Rule) => n.selector)
            .reduce(recurse.run, acc)
        : acc
  );

export { extractTags, extractClassNames, extractSelectorsFromAtRuleAndRecurse };
