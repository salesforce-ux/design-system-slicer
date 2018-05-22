import Immutable from 'immutable';

export type ComponentName = string;

export type Selector = string;

export type ComponentLookup = Immutable.Map<Selector, ComponentName>;

export type RootSelectorsMap = Immutable.Map<
  ComponentName,
  Immutable.List<Selector>
>;

export interface RootSelectors {
  [componentName: string]: Selector[];
}

export type Cache = CacheItem[];

export interface CacheItem {
  name: string;
  css: string;
}
