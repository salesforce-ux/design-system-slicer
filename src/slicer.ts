// Copyright (c) 2015-present, salesforce.com, inc. All rights reserved
// Licensed under BSD 3-Clause - see LICENSE.txt or git.io/sfdc-license

import { Cache } from './cache';

export type Css = string;

export function sliceForComponents(cache: Cache, ...components: string[]): Css {
  return cache
    .filter(slice => components.includes(slice.name))
    .reduce(
      (css, slice) => css + slice.rules.map(r => r.toString()).join('\n'),
      ''
    );
}

export class Slicer {
  private cache: Cache;
  constructor(cache: Cache) {
    this.cache = cache;
  }
  sliceForComponents(...components: string[]): Css {
    return sliceForComponents(this.cache, ...components);
  }
}

export function create(cache: Cache): Slicer {
  return new Slicer(cache);
}
