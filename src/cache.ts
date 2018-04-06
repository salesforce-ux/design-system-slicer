// Copyright (c) 2015-present, salesforce.com, inc. All rights reserved
// Licensed under BSD 3-Clause - see LICENSE.txt or git.io/sfdc-license

import Immutable from 'immutable';
import postcss, {
  Root as PostCssRoot,
  Rule as PostCssRule,
  Result as PostCssResult
} from 'postcss';

export type ComponentName = string;

export type Selector = string;

type ReducingFn<S = any> = (state: S, value: any) => S;

type Semigroup<S = any> = (x: S) => S;

type Reducer = { run: ReducingFn; concat: Semigroup<Reducer> };

type CacheBuildState = {
  result: Immutable.OrderedMap<ComponentName, Immutable.List<PostCssRule>>;
  firstSelectorFound: boolean;
};

export type ComponentLookup = Immutable.Map<Selector, ComponentName>;

export type RootSelectorsMap = Immutable.Map<
  ComponentName,
  Immutable.List<Selector>
>;

export interface RootSelectors {
  [componentName: string]: Selector[];
}

export type Cache = CacheItem[];

export interface CacheItem {
  name: string;
  css: string;
}

function fromNullable<T>(value?: T): Immutable.List<T> {
  return value ? Immutable.List.of(value) : Immutable.List();
}

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

function findRootSelector(
  rootSelectors: Immutable.List<string>,
  selector: string
): Immutable.List<string> {
  return fromNullable(
    rootSelectors.find(rootSelector =>
      selector.split(',').some(part => part.startsWith(rootSelector))
    )
  );
}

function allRules(css: string): Immutable.List<PostCssRule> {
  const acc: PostCssRule[] = [];
  walkCss(css, rule => acc.push(rule));
  return Immutable.List(acc);
}

const reducer = (run: ReducingFn): Reducer => ({
  run,
  concat: other => reducer((acc, rule) => other.run(run(acc, rule), rule))
});

const setFirstSelectorReducer: Reducer = reducer(
  (acc, rule) =>
    acc.get('firstSelectorFound')
      ? acc
      : acc.set('firstSelectorFound', /^\./.test(rule.selector))
);

const normalizeReducer: Reducer = reducer(
  (acc, rule) =>
    !acc.get('firstSelectorFound')
      ? acc.updateIn(
          ['result', 'normalize'],
          (maybeRules: Immutable.List<PostCssRule> | undefined) => {
            let rules = maybeRules
              ? (maybeRules as Immutable.List<PostCssRule>)
              : Immutable.List();
            return rules.push(rule);
          }
        )
      : acc
);

function utilReducer(utilities: Immutable.Set<Selector>): Reducer {
  return reducer((acc, rule) => {
    const foundUtil: Selector | undefined = utilities.find(u =>
      rule.selector.includes(u)
    );
    return foundUtil
      ? acc.setIn(['result', foundUtil], Immutable.List.of(rule))
      : acc;
  });
}

function componentReducer(
  rootSelectors: Immutable.List<Selector>,
  lookup: ComponentLookup
): Reducer {
  return reducer(
    (acc, rule) =>
      findRootSelector(rootSelectors, rule.selector)
        .map(key => lookup.get(key))
        .map(componentName =>
          acc.updateIn(
            ['result', componentName],
            (maybeRules: Immutable.List<PostCssRule> | undefined) => {
              let rules = maybeRules
                ? (maybeRules as Immutable.List<PostCssRule>)
                : Immutable.List();
              return rules.push(rule);
            }
          )
        )
        .first() || acc
  );
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
