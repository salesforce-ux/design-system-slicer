// Copyright (c) 2015-present, salesforce.com, inc. All rights reserved
// Licensed under BSD 3-Clause - see LICENSE.txt or git.io/sfdc-license

export interface UI {
  components: {
    [propName: string]: UINode;
  };
  utilities: {
    [propName: string]: UINode;
  };
}

export interface UINode {
  annotations: UINodeAnnotations;
  restrictees: UINode[];
}

export interface UINodeAnnotations {
  selector: string;
  restrict: string;
}

export function reduceNode<T>(
  reducer: (result: T, node: UINode) => T,
  empty: T,
  node: UINode
): T {
  return node.restrictees.reduce(
    (result, n) => reduceNode(reducer, result, n),
    reducer(empty, node)
  );
}

export function reduceNodeRight<T>(
  reducer: (result: T, node: UINode) => T,
  empty: T,
  node: UINode
): T {
  return reducer(
    node.restrictees.reduceRight(
      (result, n) => reduceNodeRight(reducer, result, n),
      empty
    ),
    node
  );
}

export function toList(node: UINode): UINode[] {
  return reduceNodeRight<UINode[]>((a, b) => a.concat(b), [], node);
}
