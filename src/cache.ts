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
    root.walkAtRules(r => r.remove());
    root.walkComments(c => c.remove());
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

function build(
  lookup: ComponentLookup,
  utilities: Immutable.Set<Selector>,
  css: string
): Promise<Cache> {
  let result: Immutable.OrderedMap<
    ComponentName,
    Immutable.List<PostCssRule>
  > = Immutable.OrderedMap();
  let rootSelectors = Immutable.List(lookup.keys());
  let firstSelectorFound: boolean = false;
  return walkCss(css, rule => {
    const foundUtil: Selector | undefined = utilities.find(u =>
      rule.selector.includes(u)
    );
    if (foundUtil) {
      return (result = result.set(foundUtil, Immutable.List.of(rule)));
    }
    if (!firstSelectorFound) {
      firstSelectorFound = /^\./.test(rule.selector);
    }
    if (firstSelectorFound) {
      findRootSelector(rootSelectors, rule.selector)
        .map(key => lookup.get(key))
        .map(componentName => {
          result = result.update(<string>componentName, maybeRules => {
            let rules = maybeRules
              ? (maybeRules as Immutable.List<PostCssRule>)
              : Immutable.List();
            return rules.push(rule);
          });
        });
    } else {
      result = result.update('normalize', maybeRules => {
        let rules = maybeRules
          ? (maybeRules as Immutable.List<PostCssRule>)
          : Immutable.List();
        return rules.push(rule);
      });
    }
  }).then(() => {
    return result.reduce<Cache>(
      (cache, rules, name) =>
        cache.concat({ name, css: rules.map(r => r.toString()).join('\n') }),
      []
    );
  });
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
    .then(lookup => build(lookup, Immutable.Set(utilities), css));
}
