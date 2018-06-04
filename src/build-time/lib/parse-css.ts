import postcss, {
  Root as PostCssRoot,
  Rule as PostCssRule,
  AtRule as PostCssAtRule,
  ChildNode as PostCssChildNode,
  Result as PostCssResult
} from 'postcss';

type Selector = string;

type Rule = PostCssRule;

function atRuleToRule(atRule: PostCssAtRule): PostCssRule {
  return Object.assign(atRule, { selector: '' });
}

function handleRule(
  visitor: (rule: Rule) => void,
  node: PostCssChildNode
): void {
  switch (node.type) {
    case 'comment':
      node.remove();
      break;
    case 'rule':
      visitor(node);
      break;
    case 'atrule':
      visitor(atRuleToRule(node));
      break;
  }
}

function visitorPlugin(visitor: (rule: Rule) => void) {
  return (root: PostCssRoot, result?: PostCssResult): void => {
    root.walk(r => handleRule(visitor, r));
  };
}

function walkCss(css: string, visitor: (rule: Rule) => void): Promise<string> {
  return postcss()
    .use(visitorPlugin(visitor))
    .process(css, { from: undefined })
    .then(result => result.css);
}

function getAllRulesFromCss(css: string): Promise<Rule[]> {
  const acc: Rule[] = [];
  return walkCss(css, rule => acc.push(rule)).then(() => acc);
}

function firstCapture(str: String, regex: RegExp): string | undefined {
  const found = str.match(regex);
  return found != null ? found[1] : undefined;
}
const extractMatchesFromSelector = (
  selector: Selector,
  regex: RegExp
): Set<Selector> =>
  new Set(
    selectorParts(selector)
      .map(sel => firstCapture(sel, regex) || '')
      .filter(x => x.length > 0)
  );

const classNameRegex = /(\.[a-zA-Z\-\_\d]+)/;
const tagNameRegex = /^([A-Za-z]+[^\W])/;

const parseClassNames = (selector: Selector): Set<Selector> =>
  extractMatchesFromSelector(selector, classNameRegex);

const parseTagNames = (selector: Selector): Set<Selector> =>
  new Set(
    Array.from(extractMatchesFromSelector(selector, tagNameRegex)).map(t =>
      t.trim()
    )
  );

// We only support [class*=] right now
function selectorFromComplex(selector: Selector): string | undefined {
  return firstCapture(selector, /\[class\*='([a-zA-Z\-\_]+)'\]/);
}

function isComplexSelector(selector: Selector): Boolean {
  return !!selectorFromComplex(selector);
}

function selectorParts(selector: Selector): Selector[] {
  return selector.split(',').map(x => x.trim());
}

export {
  getAllRulesFromCss,
  parseTagNames,
  parseClassNames,
  Rule,
  AtRuleAdapter,
  Selector
};
