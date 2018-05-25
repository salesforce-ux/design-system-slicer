# Build

`npm install`
`npm run build`

# Slicer

```js
import { slicer, util } from "@salesforce-ux/design-system/slicer";

let selectors = [".slds-date_day", ".slds-button_neutral", ".slds-is-active"];

let components = selectors.map(s => util.componentsForSelector(s));
// => [['date-picker'], ['buttons'], ['date-picker', 'popover']]

let componentsFiltered = util.filterUnusedComponents(components);
// => ['data-picker', 'buttons']

const allSelectors = componentsFiltered.reduce(
  (acc, c) => acc.concat(util.selectorsForComponent(c)),
  []
);
// [ '.slds-is-selected-multi',
//   '.slds-has-multi-row-selection',
//   '.slds-has-multi-selection',
//   '.slds-disabled-text',
//   '.slds-datepicker__month',
//   '.slds-datepicker__month_filter',
//   '.slds-datepicker__filter',
//   '.slds-is-selected',
//   '.slds-is-today',
//   '.slds-day',
//   '.slds-datepicker',',
//   '.slds-is-selected',
//   '.slds-is-selected-clicked',
//   '.slds-not-selected',
//   '.slds-button_stateful',
//   '.slds-button__icon_right',
//   '.slds-button__icon_left',
//   '.slds-button__icon_x-small',
//   '.slds-button__icon_small',
//   '.slds-button__icon_large',
//   '.slds-button__icon',
//   '.slds-button_small',
//   '.slds-button_success',
//   '.slds-button_destructive',
//   '.slds-button_inverse',
//   '.slds-button_brand',
//   '.slds-button_neutral',
//   '.slds-button',
//   '.slds-button, .slds-button_stateful' ]

// for host transformation
let rootSelectors = componentsFiltered.map(comp => util.rootSelectors(comp));
// => [['.slds-date-picker'], ['.slds-button', '.slds-button_neutral']]

let css = slicer.normalize();
css += slicer.slice(...allSelectors);
css += slicer.utilities();
```
