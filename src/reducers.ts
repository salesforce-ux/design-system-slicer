import Immutable from 'immutable';

import {
  ComponentName,
  ComponentLookup,
  Selector,
  Rule,
  CacheBuildState
} from './types';
import escapeRegExp from 'lodash.escaperegexp';

export type ReducingFn<S = any> = (state: S, value: any) => S;

export type Semigroup<S = any> = (x: S) => S;

export type Reducer = { run: ReducingFn; concat: Semigroup<Reducer> };

const reducer = (run: ReducingFn): Reducer => ({
  run,
  concat: other => reducer((acc, rule) => other.run(run(acc, rule), rule))
});

function fromNullable<T>(value?: T): Immutable.List<T> {
  return value ? Immutable.List.of(value) : Immutable.List();
}

function findRootSelector(
  rootSelectors: Immutable.List<string>,
  selector: string
): Immutable.List<string> {
  return fromNullable(
    rootSelectors.find(rootSelector =>
      selector
        .split(',')
        .some(
          part =>
            !!part.match(
              new RegExp(`^(\\w+)?${escapeRegExp(rootSelector)}`, 'ig')
            )
        )
    )
  );
}

const miscReducer: Reducer = reducer((acc, rule) => {
  if (!acc.get('changed')) console.log("NOT CHAGNGED'", rule.selector);
  return (acc.get('changed')
    ? acc
    : acc.updateIn(['result', 'misc'], (xs: Immutable.List<Rule>) =>
        (xs || Immutable.List()).push(rule)
      )
  ).set('changed', false);
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
      ? acc
          .updateIn(
            ['result', 'normalize'],
            (maybeRules: Immutable.List<Rule> | undefined) => {
              let rules = maybeRules
                ? (maybeRules as Immutable.List<Rule>)
                : Immutable.List();
              return rules.push(rule);
            }
          )
          .set('changed', true)
      : acc
);

// We only support [class*=] right now
function selectorFromComplex(selector: Selector): String | undefined {
  const match = selector.match(/\[class\*='([a-zA-Z\-\_]+)'\]/);
  return match != null ? match[1] : undefined;
}

function isComplexSelector(selector: Selector): Boolean {
  return !!selectorFromComplex(selector);
}

function insertRuleToCache(
  acc: CacheBuildState,
  selector: Selector | undefined,
  rule: Rule
): CacheBuildState {
  return selector
    ? acc
        .updateIn(
          ['result', selector],
          (maybeRules: Immutable.List<Rule> | undefined) => {
            let rules = maybeRules
              ? (maybeRules as Immutable.List<Rule>)
              : Immutable.List();
            return rules.push(rule);
          }
        )
        .set('changed', true)
    : acc;
}

function utilReducer(utilities: Immutable.Set<Selector>): Reducer {
  return reducer((acc, rule) => {
    const foundUtil: Selector | undefined = utilities.find(
      u =>
        isComplexSelector(u)
          ? rule.selector.match(selectorFromComplex(u))
          : rule.selector.includes(u)
    );
    return insertRuleToCache(acc, foundUtil, rule);
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
        .map(foundComponent => insertRuleToCache(acc, foundComponent, rule))
        .first() || acc
  );
}

function atRuleReducer(
  rootSelectors: Immutable.List<Selector>,
  lookup: ComponentLookup
): Reducer {
  return reducer((acc, rule) => {
    if (rule.type === 'atrule') {
      const firstNodeSelector = rule.rule.nodes && rule.rule.nodes[0].selector;
      return (
        findRootSelector(rootSelectors, firstNodeSelector || '')
          .map(key => lookup.get(key))
          .map(foundComponent =>
            insertRuleToCache(acc, foundComponent, rule.rule)
          )
          .first() || acc
      ).set('changed', true);
    } else {
      return acc;
    }
  });
}

export {
  setFirstSelectorReducer,
  normalizeReducer,
  utilReducer,
  componentReducer,
  atRuleReducer,
  miscReducer
};
