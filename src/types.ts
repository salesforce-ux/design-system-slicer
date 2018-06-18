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
