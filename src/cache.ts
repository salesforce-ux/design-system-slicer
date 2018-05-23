// Copyright (c) 2015-present, salesforce.com, inc. All rights reserved
// Licensed under BSD 3-Clause - see LICENSE.txt or git.io/sfdc-license

import Immutable from 'immutable';

import postcss, {
  Root as PostCssRoot,
  Rule as PostCssRule,
  AtRule as PostCssAtRule,
  ChildNode as PostCssChildNode,
  Result as PostCssResult
} from 'postcss';

import {
  Reducer,
  setFirstSelectorReducer,
  normalizeReducer,
  utilReducer,
  componentReducer,
  atRuleReducer,
  miscReducer
} from './reducers';

import {
  ComponentName,
  ComponentLookup,
  Selector,
  RootSelectors,
  CacheBuildState,
  Cache,
  AtRuleAdapter,
  Rule,
  TempCache
} from './types';

import _ from 'lodash';

function atRuleToRule(atrule: PostCssAtRule): AtRuleAdapter {
  return { selector: 'atrule', type: 'atrule', rule: atrule };
}

function handleRule(
  visitor: (rule: Rule) => void,
  node: PostCssChildNode
): void {
  switch (node.type) {
    case 'comment':
      node.remove();
      break;
    case 'rule':
      visitor(node);
      break;
    case 'atrule':
      visitor(atRuleToRule(node));
      break;
  }
}

function visitorPlugin(visitor: (rule: Rule) => void) {
  return (root: PostCssRoot, result?: PostCssResult): void => {
    // root.walkAtRules(r => r.remove());
    root.walk(r => handleRule(visitor, r));
    //root.walkRules(r => visitor(r));
  };
}

function walkCss(css: string, visitor: (rule: Rule) => void): Promise<string> {
  return postcss()
    .use(visitorPlugin(visitor))
    .process(css, { from: undefined })
    .then(result => result.css);
}

function allRules(css: string): Immutable.List<Rule> {
  const acc: Rule[] = [];
  walkCss(css, rule => acc.push(rule));
  return Immutable.List(acc);
}

function build(
  lookup: ComponentLookup,
  utilities: Immutable.Set<Selector>,
  rules: Immutable.List<Rule>
): Cache {
  let rootSelectors = Immutable.List(lookup.keys());

  const reduction: Reducer = setFirstSelectorReducer
    .concat(normalizeReducer)
    .concat(utilReducer(utilities))
    .concat(componentReducer(rootSelectors, lookup))
    .concat(atRuleReducer(rootSelectors, lookup))
    .concat(miscReducer);

  const state: TempCache = rules
    .reduce(
      reduction.run,
      Immutable.Map({
        result: Immutable.OrderedMap(),
        firstSelectorFound: false,
        changed: false
      })
    )
    .get('result');

  return state.reduce<Cache>(
    (cache, rules, name) =>
      cache.concat({ name, css: rules.map(r => r.toString()).join('\n') }),
    []
  );
}

function flip<T, U>(
  map: Immutable.Map<T, Immutable.List<U>>
): Immutable.Map<U, T> {
  return map.reduce(
    (acc, values, key) => values.reduce((a, value) => a.set(value, key), acc),
    Immutable.Map()
  );
}

export function create(
  rootSelectors: RootSelectors,
  utilities: string[],
  css: string
): Promise<Cache> {
  return Promise.resolve(rootSelectors)
    .then(Immutable.fromJS)
    .then(rootSelectors => flip<string, string>(rootSelectors))
    .then(lookup => build(lookup, Immutable.Set(utilities), allRules(css)));
}
