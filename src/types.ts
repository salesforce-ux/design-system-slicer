import Immutable from 'immutable';
import { Rule as PostCssRule, AtRule as PostCssAtRule } from 'postcss';

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

export type AtRuleAdapter = {
  selector: String;
  type: String;
  rule: PostCssAtRule;
};
export type Rule = PostCssRule | AtRuleAdapter;

export type TempCache = Immutable.OrderedMap<
  ComponentName,
  Immutable.List<Rule>
>;

export type CacheBuildState = Immutable.Map<String, TempCache | boolean>;
