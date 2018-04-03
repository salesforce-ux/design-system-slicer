const Slicer = require("./dist/design-system-slicer.umd.js");
const { util, slicer } = Slicer;

// helpers
const pipe = (...fns) => x => fns.reduce((y, f) => f(y), x);
const smoosh = xss => xss.reduce((acc, x) => acc.concat(x), []);
const uniq = xs => [...new Set(xs)];

const filterUnusedComponents = xss =>
  xss.map(
    (xs, i) =>
      xs.length > 1
        ? // keep component if found in any other array.
          xs.filter(x => xss.some((ys, j) => j != i && ys.some(y => y === x)))
        : xs
  );

let selectors = [".slds-day", ".slds-button_neutral", ".slds-is-selected"];

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

const removeUnusedComponents = pipe(filterUnusedComponents, smoosh, uniq);

const cleanComps = removeUnusedComponents(components);
// => [['date-picker', 'buttons']

let css = slicer.sliceForComponents(...cleanComps);
console.log(css);

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
