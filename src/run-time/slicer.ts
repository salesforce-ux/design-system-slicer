// Copyright (c) 2015-present, salesforce.com, inc. All rights reserved
// Licensed under BSD 3-Clause - see LICENSE.txt or git.io/sfdc-license

import { Cache, CacheItem, Selector } from '../types';

import { uniq, intersectionBy } from './lib/set-fns';

export type Css = string;
export type Slicer = {
  slice: (...selectors: string[]) => Css;
  normalize: () => Css;
};

const sliceFor = (cache: Cache, ...passedInSelectors: string[]): Css =>
  uniq(
    cache
      .filter(slice =>
        intersectionBy(slice.selectors, passedInSelectors, (sel, key) =>
          sel.startsWith(key)
        )
      )
      .map(slice => slice.css)
  ).join('\n');

export const create = (cache: Cache): Slicer => ({
  slice: (...selectors: string[]): Css => sliceFor(cache, ...selectors),
  normalize: () =>
    cache
      .filter(k => k.type === 'html')
      .map(x => x.css)
      .join('\n')
});
