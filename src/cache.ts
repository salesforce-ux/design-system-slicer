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
  htmlReducer,
  classNameReducer,
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
  Rule
} from './types';

import _ from 'lodash';

function atRuleToRule(atrule: PostCssAtRule): AtRuleAdapter {
  return { selector: '', type: 'atrule', rule: atrule };
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
    root.walk(r => handleRule(visitor, r));
  };
}

function walkCss(css: string, visitor: (rule: Rule) => void): Promise<string> {
  return postcss()
    .use(visitorPlugin(visitor))
    .process(css, { from: undefined })
    .then(result => result.css);
}

function allRules(css: string): Promise<Immutable.List<Rule>> {
  const acc: Rule[] = [];
  return walkCss(css, rule => acc.push(rule)).then(() => Immutable.List(acc));
}

// order matters
const reduction: Reducer = atRuleReducer
  .concat(htmlReducer)
  .concat(classNameReducer)
  .concat(miscReducer);

function build(rules: Immutable.List<Rule>): Cache {
  return rules.reduce(reduction.run, Immutable.List());
}
export function create(
  rootSelectors: RootSelectors,
  utilities: string[],
  css: string
): Promise<Cache> {
  return allRules(css).then(build);
}
