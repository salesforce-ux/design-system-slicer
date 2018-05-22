// Copyright (c) 2015-present, salesforce.com, inc. All rights reserved
// Licensed under BSD 3-Clause - see LICENSE.txt or git.io/sfdc-license

import Immutable from 'immutable';

import postcss, {
  Root as PostCssRoot,
  Rule as PostCssRule,
  Result as PostCssResult
} from 'postcss';

import {
  Reducer,
  setFirstSelectorReducer,
  normalizeReducer,
  utilReducer,
  componentReducer
} from './reducers';

import {
  ComponentName,
  ComponentLookup,
  Selector,
  RootSelectors,
  Cache
} from './types';

type CacheBuildState = {
  result: Immutable.OrderedMap<ComponentName, Immutable.List<PostCssRule>>;
  firstSelectorFound: boolean;
};

function visitorPlugin(visitor: (rule: PostCssRule) => void) {
  return (root: PostCssRoot, result?: PostCssResult): void => {
    // root.walkAtRules(r => r.remove());
    // root.walkComments(c => c.remove());
    root.walkRules(r => visitor(r));
  };
}

function walkCss(
  css: string,
  visitor: (rule: PostCssRule) => void
): Promise<string> {
  return postcss()
    .use(visitorPlugin(visitor))
    .process(css, { from: undefined })
    .then(result => result.css);
}

function allRules(css: string): Immutable.List<PostCssRule> {
  const acc: PostCssRule[] = [];
  walkCss(css, rule => acc.push(rule));
  return Immutable.List(acc);
}

function build(
  lookup: ComponentLookup,
  utilities: Immutable.Set<Selector>,
  rules: Immutable.List<PostCssRule>
): Cache {
  let rootSelectors = Immutable.List(lookup.keys());

  const reduction: Reducer = setFirstSelectorReducer
    .concat(normalizeReducer)
    .concat(utilReducer(utilities))
    .concat(componentReducer(rootSelectors, lookup));

  const state: CacheBuildState = rules
    .reduce(
      reduction.run,
      Immutable.Map({
        result: Immutable.OrderedMap(),
        firstSelectorFound: false
      })
    )
    .toObject();

  return state.result.reduce<Cache>(
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
