// Copyright (c) 2015-present, salesforce.com, inc. All rights reserved
// Licensed under BSD 3-Clause - see LICENSE.txt or git.io/sfdc-license

import * as fs from "fs";
import * as path from "path";

import { create as createSlicer } from "../src/run-time/slicer";
import ui from "./__fixtures__/ui.json";
import { Util } from "../src/run-time/util";
import { create as createCache } from "../src/build-time/cache";
import { Cache } from "../src/types";

// ui.json
// -----------
// components: datepicker, buttons, modal
// utilities: interactions, hyphenation, alignment

// css format
// -----------
// global resets
// datepicker
// modal
// button-group
// button
// utils (just hyphenation though)
//

const css = fs
  .readFileSync(path.resolve(__dirname, "__fixtures__/slds.css"))
  .toString();

let cache: Cache;
let util: Util;

// @ts-ignore
beforeEach(async () => {
  util = new Util(ui);
  cache = await createCache(
    css
  );
});

it("has a normalize slice", () => {
  const slicer = createSlicer(cache);
  const result = slicer.normalize();

  expect(result).toMatch("html");
  expect(result).toMatch("td");
  expect(result).not.toMatch(".slds");
});

it("has a utils slice with a complex annotation", () => {
  const slicer = createSlicer(cache);
  const result = slicer.slice(".slds-text-link");

  expect(result).toMatch(".slds-text-link");
  expect(result).not.toMatch(".slds-hyphenate");
  expect(result).not.toMatch("html");
  expect(result).not.toMatch(".slds-button");
});

it("has a utils slice", () => {
  const slicer = createSlicer(cache);
  const result = slicer.slice(".slds-truncate_container_66");

  expect(result).toMatch(".slds-truncate_container_66");
  expect(result).not.toMatch(".slds-hyphenate");
  expect(result).not.toMatch("html");
  expect(result).not.toMatch(".slds-button");
});

it("has a slice thats complex in the selector itself", () => {
  const slicer = createSlicer(cache);
  const result = slicer.slice(".slds-combobox__input");
  console.log(result);

  expect(result).toMatch('[class*="slds-input-has-icon--left"]');
  expect(result).not.toMatch(".slds-hyphenate");
  expect(result).not.toMatch("html");
  expect(result).not.toMatch(".slds-button");
});

xit("has html atrules", () => {});
xit("has nested atrules", () => {});

it("forms slice", () => {
  const slicer = createSlicer(cache);
  const selectors = util.selectorsForComponent("form-layout");
  const result = slicer.slice(...selectors);

  expect(result).toMatch(".slds-form");
  expect(result).toMatch(".slds-form_horizontal");
  expect(result).toMatch("@media (min-width: 48em)");
});

it("buttons slice", () => {
  const slicer = createSlicer(cache);
  const selectors = util.selectorsForComponent("buttons");
  const result = slicer.slice(...selectors);

  expect(result).toMatch(".slds-button");
  expect(result).toMatch("a.slds-button");
  expect(result).not.toMatch(".slds-datepicker");
  expect(result).not.toMatch(".slds-truncate_container_66");
});

it("date-picker slice", () => {
  const slicer = createSlicer(cache);
  const selectors = util.selectorsForComponent("datepickers");
  const result = slicer.slice(...selectors);

  expect(result).toMatch(".slds-datepicker");
  expect(result).not.toMatch(".slds-button");
  expect(result).not.toMatch(".slds-truncate_container_66");
});

it("gets at rules", () => {
  const slicer = createSlicer(cache);
  const selectors = util.selectorsForComponent("datepickers");
  const result = slicer.slice(...selectors);

  expect(result).toMatch(".slds-datepicker");
  expect(result).not.toMatch(".slds-button");
  expect(result).not.toMatch(".slds-truncate_container_66");
});
