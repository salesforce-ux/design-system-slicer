import slicer, {
  util as slicerUtil
} from '@salesforce-ux/design-system-slicer';

let selectors = ['.slds-date_day', '.slds-button_neutral', '.slds-is-active'];

let components = selectors.map(slicerUtil.componentsForSelector);
// => [['date-picker'], ['buttons'], ['date-picker', 'popover']]

let rootSelectors = componentsFiltered.map(slicerUtil.rootSelectors);
// => [['.slds-date-picker'], ['.slds-button', '.slds-button_neutral']]

let css = slicer.sliceForComponents('buttons', 'data-tables');
console.log(css)
