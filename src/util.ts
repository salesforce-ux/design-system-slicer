// Copyright (c) 2015-present, salesforce.com, inc. All rights reserved
// Licensed under BSD 3-Clause - see LICENSE.txt or git.io/sfdc-license

import { UI, UINode, toList } from './ui';

export function findBySelector(node: UINode, selector: string): UINode[] {
  return toList(node).filter(n => n.annotations.selector === selector);
}

export function allUtilities(ui: UI): Array<UINode> {
  return Object.keys(ui.utilities)
    .map(key => ui.utilities[key])
    .reduce<UINode[]>((result, node) => result.concat(toList(node)), []);
}

export function componentsForSelector(ui: UI, selector: string): UINode[] {
  return Object.keys(ui.components)
    .filter(key => findBySelector(ui.components[key], selector).length > 0)
    .map(key => ui.components[key]);
}

export function allSelectorsForComponent(node: UINode): string[] {
  return node.annotations.selector.split(',').map(s => s.trim());
}
