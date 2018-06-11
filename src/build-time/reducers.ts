import Immutable from 'immutable';
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

const associateAnimations = (animations: Rule[], css: string) =>
  animations.reduce(
    reducer(
      (acc, rule) =>
        css.indexOf(rule.selector) > -1 ? (acc += rule.toString()) : acc
    ).run,
    css
  );

const extractTags: Reducer = reducer((acc, rule) => {
  const tags = Immutable.Set(parseTagNames(rule.selector));
  return tags.count() > 0
    ? acc.push({
        selectors: tags,
        css: associateAnimations(
          acc.filter((r: Rule) => r.type === 'animation'),
          rule.toString()
        ),
        type: 'html'
      })
    : acc;
});

const extractClassNames: Reducer = reducer((acc, rule) => {
  const classes = Immutable.Set(parseClassNames(rule.selector));
  return classes.count() > 0
    ? acc.push({
        selectors: classes.toArray(),
        css: associateAnimations(
          acc.filter((r: Rule) => r.type === 'animation'),
          rule.toString()
        ),
        type: 'className'
      })
    : acc;
});

const extractAnimations: Reducer = reducer(
  (acc, rule) =>
    rule.type === 'animation' && rule.name === 'keyframes'
      ? acc.push(rule)
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
