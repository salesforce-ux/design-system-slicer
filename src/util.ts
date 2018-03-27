// Copyright (c) 2015-present, salesforce.com, inc. All rights reserved
// Licensed under BSD 3-Clause - see LICENSE.txt or git.io/sfdc-license

import { UI, UINode, toList } from './ui';

export function allSelectorsForComponent(node: UINode): string[] {
  return node.annotations.selector.split(',').map(s => s.trim());
}

export function findBySelector(node: UINode, selector: string): UINode[] {
  return toList(node).filter(n => n.annotations.selector === selector);
}

export class Util {
  private ui: UI;
  constructor(ui: UI) {
    this.ui = ui;
  }
  allUtilities(): Array<UINode> {
    return Object.keys(this.ui.utilities)
      .map(key => this.ui.utilities[key])
      .reduce<UINode[]>((result, node) => result.concat(toList(node)), []);
  }
  componentsForSelector(selector: string): string[] {
    return Object.keys(this.ui.components).filter(
      key => findBySelector(this.ui.components[key], selector).length > 0
    );
  }
  rootSelectors(componentName: string): string[] {
    let component = this.ui.components[componentName];
    let selectors = component.annotations.selector
      .split(',')
      .map(s => s.trim());
    return component.restrictees
      .map(node =>
        node.restrictees
          .map(
            node =>
              selectors.some(rootSelector =>
                node.annotations.restrict.endsWith(rootSelector)
              )
                ? node.annotations.selector
                : ''
          )
          .filter(x => x)
      )
      .reduce((a, b) => a.concat(b), selectors);
  }
}

export function create(ui: UI): Util {
  return new Util(ui);
}
