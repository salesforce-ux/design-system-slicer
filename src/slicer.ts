// Copyright (c) 2015-present, salesforce.com, inc. All rights reserved
// Licensed under BSD 3-Clause - see LICENSE.txt or git.io/sfdc-license

import { Cache } from './cache';

export type Css = string;

export function sliceFor(cache: Cache, ...keys: string[]): Css {
  return cache
    .filter(slice => keys.includes(slice.name))
    .reduce((css, slice) => css + slice.css, '');
}

export class Slicer {
  private cache: Cache;
  constructor(cache: Cache) {
    this.cache = cache;
  }
  sliceForComponents(...names: string[]): Css {
    return sliceFor(this.cache, ...names);
  }
  normalize(): Css {
    return this.cache[0].css;
  }

  utils(...selectors: string[]): Css {
    return sliceFor(this.cache, ...selectors);
  }
}

export function create(cache: Cache): Slicer {
  return new Slicer(cache);
}
