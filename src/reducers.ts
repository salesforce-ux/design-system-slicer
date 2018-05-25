import Immutable from 'immutable';

import {
  ComponentName,
  ComponentLookup,
  Selector,
  Rule,
  CacheBuildState,
  CacheItem
} from './types';
import escapeRegExp from 'lodash.escaperegexp';

export type ReducingFn<S = any> = (state: S, value: any) => S;

export type Semigroup<S = any> = (x: S) => S;

export type Reducer = { run: ReducingFn; concat: Semigroup<Reducer> };

const reducer = (run: ReducingFn): Reducer => ({
  run,
  concat: other => reducer((acc, rule) => other.run(run(acc, rule), rule))
});

const miscReducer: Reducer = reducer((acc, rule) => {
  return (acc.get('changed')
    ? acc
    : acc.updateIn(['result', 'misc'], (xs: Immutable.List<Rule>) =>
        (xs || Immutable.List()).push(rule)
      )
  ).set('changed', false);
});

function firstCapture(str: String, regex: RegExp): string | undefined {
  const found = str.match(regex);
  return found != null ? found[1] : undefined;
}
const extractMatchesFromSelector = (
  selector: Selector,
  regex: RegExp
): Immutable.Set<Selector> =>
  selectorParts(selector)
    .map(sel => firstCapture(sel, regex) || '')
    .filter(x => x.length > 0)
    .toSet();

const classNameRegex = /(\.[a-zA-Z\-\_\d]+)/;
const tagNameRegex = /^([A-Za-z]+[^\W])/;

const classNames = (selector: Selector): Immutable.Set<Selector> =>
  extractMatchesFromSelector(selector, classNameRegex);

const tagNames = (selector: Selector): Immutable.Set<Selector> =>
  extractMatchesFromSelector(selector, tagNameRegex).map(t => t.trim());

const htmlReducer: Reducer = reducer((acc, rule) => {
  const tags = tagNames(rule.selector);
  return tags.count() > 0
    ? acc.push({ selectors: tags, css: rule.toString(), type: 'html' })
    : acc;
});

// We only support [class*=] right now
function selectorFromComplex(selector: Selector): string | undefined {
  return firstCapture(selector, /\[class\*='([a-zA-Z\-\_]+)'\]/);
}

function isComplexSelector(selector: Selector): Boolean {
  return !!selectorFromComplex(selector);
}

function selectorParts(selector: Selector): Immutable.List<Selector> {
  return Immutable.List(selector.split(',')).map(x => x.trim());
}

const classNameReducer: Reducer = reducer((acc, rule) => {
  const classes = classNames(rule.selector);
  return classes.count() > 0
    ? acc.push({
        selectors: classes.toArray(),
        css: rule.toString(),
        type: 'className'
      })
    : acc;
});

const atRuleReducer: Reducer = reducer(
  (acc, rule) =>
    rule.type === 'atrule' && rule.rule.name === 'media'
      ? (rule.rule.nodes || [])
          .filter((n: Rule) => n.selector)
          .reduce((a: Immutable.List<CacheItem>, subRule: Rule) => {
            const classes = classNames(subRule.selector);
            return classes.count() > 0
              ? a.push({
                  selectors: classes.toArray(),
                  css: rule.rule.toString(),
                  type: 'atrule'
                })
              : a;
          }, acc)
      : acc
);

export { htmlReducer, classNameReducer, atRuleReducer, miscReducer };
