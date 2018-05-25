const { util, slicer } = require("./dist/design-system-slicer.umd.js");

// helpers
const smoosh = xss => xss.reduce((acc, x) => acc.concat(x), []);
const uniq = xs => [...new Set(xs)];

const rejectElementsNotFoundInSingletons = xss =>
  xss.map(
    (xs, i) =>
      xs.length > 1
        ? xs.filter(x => xss.some((ys, j) => j != i && ys.some(y => y === x)))
        : xs
  );

const filterUnusedComponents = x =>
  uniq(smoosh(rejectElementsNotFoundInSingletons(x)));

let selectors = [
  ".slds-day",
  ".slds-button_neutral",
  ".slds-is-selected",
  ".slds-border_bottom"
];

let components = selectors.map(x => util.componentsForSelector(x));
// [ [ 'datepickers' ],
//   [ 'buttons' ],
//   [ 'buttons',
//     'data-tables',
//     'menus',
//     'trees',
//     'datepickers',
//     'global-header',
//     'docked-composer',
//     'visual-picker',
//     'button-icons' ] ]

const cleanComps = filterUnusedComponents(components);
// => ['datepickers', 'buttons']

const allSelectors = cleanComps.reduce(
  (acc, c) => acc.concat(util.selectorsForComponent(c)),
  []
);
console.log(allSelectors);

let css = slicer.normalize();
css += slicer.slice(...allSelectors);
//console.log(css);

let rootSelectors = cleanComps.map(x => util.rootSelectors(x));
// [ [ '.slds-datepicker' ],
//   [ '.slds-button',
//     '.slds-button_stateful',
//     '.slds-button_neutral',
//     '.slds-button_brand',
//     '.slds-button_inverse',
//     '.slds-button_destructive',
//     '.slds-button_success',
//     '.slds-button_small',
//     '.slds-not-selected',
//     '.slds-is-selected-clicked',
//     '.slds-is-selected' ] ]
