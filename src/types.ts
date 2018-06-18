// Copyright (c) 2015-present, salesforce.com, inc. All rights reserved
// Licensed under BSD 3-Clause - see LICENSE.txt or git.io/sfdc-license

import Immutable from 'immutable';

export type Selector = string;

export type Cache = CacheItem[];

export interface CacheItem {
  selectors: string[];
  relatedSelectors?: string[];
  type: string;
  css: string;
}

export type CacheBuildState = Immutable.Map<string, Cache>;
