// Copyright (c) 2015-present, salesforce.com, inc. All rights reserved
// Licensed under BSD 3-Clause - see LICENSE.txt or git.io/sfdc-license

import { Cache, Selector } from './types';

export type Css = string;

function uniq<T>(xs: Array<T>): Array<T> {
  return [...Array.from(new Set(xs))];
}

export function sliceFor(cache: Cache, ...keys: string[]): Css {
  return uniq(
    cache
      .filter(slice =>
        slice.selectors.some(sel => keys.some(key => sel.startsWith(key)))
      )
      .map(slice => slice.css)
  ).join('\n');
}

// We only support [class*=] right now
function selectorFromComplex(selector: Selector): string | undefined {
  const match = selector.match(/\[class\*='([a-zA-Z\-\_]+)'\]/);
  return match != null ? match[1] : undefined;
}

function isComplexSelector(selector: Selector): Boolean {
  return !!selectorFromComplex(selector);
}

export class Slicer {
  private cache: Cache;
  constructor(cache: Cache) {
    this.cache = cache;
  }
  slice(...selectors: string[]): Css {
    return sliceFor(this.cache, ...selectors);
  }
  sliceForComponents(...names: string[]): Css {
    return sliceFor(this.cache, ...names);
  }
  normalize(): Css {
    return this.cache
      .filter(k => k.type === 'html')
      .map(x => x.css)
      .join('\n');
  }

  utils(...selectors: string[]): Css {
    return sliceFor(this.cache, ...selectors);
    // return this.cache
    //   .filter(slice => {
    //     const complex = selectorFromComplex(slice.selectors);
    //     return complex
    //       ? selectors.some(s => !!s.match(complex))
    //       : selectors.includes(slice.name);
    //   })
    //   .reduce((css, slice) => css + slice.css, "");
  }
}

export function create(cache: Cache): Slicer {
  return new Slicer(cache);
}
