# Slicer

```js
import { slicer, util } from '@salesforce-ux/design-system-slicer';

let selectors = ['.slds-date_day', '.slds-button_neutral', '.slds-is-active'];

let components = selectors.map(util.componentsForSelector);
// => [['date-picker'], ['buttons'], ['date-picker', 'popover']]

let componentsFiltered = util.filterUnusedComponents(components);
// => ['data-picker', 'buttons']

let rootSelectors = componentsFiltered.map(util.rootSelectors);
// => [['.slds-date-picker'], ['.slds-button', '.slds-button_neutral']]

let css = slicer.normalize();
css += slicer.sliceForComponents('buttons', 'data-tables');
css += slicer.utilities();
```

## Raptor

```js
let rootComponent = RAPTOR.rootComponent(selectors, rootSelectors);
// => 'button' || Error
```
