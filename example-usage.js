// Copyright (c) 2015-present, salesforce.com, inc. All rights reserved
// Licensed under BSD 3-Clause - see LICENSE.txt or git.io/sfdc-license

const { util, slicer } = require("./dist/design-system-slicer.umd.js");

// helpers
const smoosh = xss => xss.reduce((acc, x) => acc.concat(x), []);
const uniq = xs => [...new Set(xs)];

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

const cleanComps = uniq(smoosh(components.filter(c => c.length === 1)))
// => ['datepickers', 'buttons']

const allSelectors = cleanComps.reduce(
  (acc, c) => acc.concat(util.selectorsForComponent(c)),
  selectors
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
