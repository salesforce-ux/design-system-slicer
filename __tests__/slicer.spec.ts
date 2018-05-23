// Copyright (c) 2015-present, salesforce.com, inc. All rights reserved
// Licensed under BSD 3-Clause - see LICENSE.txt or git.io/sfdc-license

import * as fs from "fs";
import * as path from "path";

import { create as createSlicer } from "../src/slicer";
import { create as createCache } from "../src/cache";
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

// @ts-ignore
beforeEach(async () => {
  cache = await createCache(
    {
      buttons: [".slds-button", "slds-button_neutral"],
      datepickers: [".slds-datepicker"],
      "form-layout": [
        ".slds-form",
        ".slds-form_inline",
        ".slds-form_compound",
        ".slds-form_stacked",
        ".slds-form_horizontal"
      ]
    },
    [
      ".slds-hyphenate",
      ".slds-truncate_container_66",
      "[class*='slds-text-link']"
    ],
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

it("has a complex utils slice", () => {
  const slicer = createSlicer(cache);
  const result = slicer.utils(".slds-text-link");

  expect(result).toMatch(".slds-text-link");
  expect(result).not.toMatch(".slds-hyphenate");
  expect(result).not.toMatch("html");
  expect(result).not.toMatch(".slds-button");
});

it("has a utils slice", () => {
  const slicer = createSlicer(cache);
  const result = slicer.utils(".slds-truncate_container_66");

  expect(result).toMatch(".slds-truncate_container_66");
  expect(result).not.toMatch(".slds-hyphenate");
  expect(result).not.toMatch("html");
  expect(result).not.toMatch(".slds-button");
});

xit("has a utils slice thats complex on the other end", () => {});
xit("has a utils atrules", () => {});

xit("both bem and otherwise", () => {});

it("forms slice", () => {
  const slicer = createSlicer(cache);
  const result = slicer.sliceForComponents("form-layout");

  expect(result).toMatch(".slds-form");
  expect(result).toMatch(".slds-form_horizontal");
  expect(result).toMatch("@media (min-width: 48em)");
});

it("buttons slice", () => {
  const slicer = createSlicer(cache);
  const result = slicer.sliceForComponents("buttons");

  expect(result).toMatch(".slds-button");
  expect(result).toMatch("a.slds-button");
  expect(result).not.toMatch(".slds-datepicker");
  expect(result).not.toMatch(".slds-truncate_container_66");
});

it("date-picker slice", () => {
  const slicer = createSlicer(cache);
  const result = slicer.sliceForComponents("datepickers");

  expect(result).toMatch(".slds-datepicker");
  expect(result).not.toMatch(".slds-button");
  expect(result).not.toMatch(".slds-truncate_container_66");
});

it("gets at rules", () => {
  const slicer = createSlicer(cache);
  const result = slicer.sliceForComponents("datepickers");

  expect(result).toMatch(".slds-datepicker");
  expect(result).not.toMatch(".slds-button");
  expect(result).not.toMatch(".slds-truncate_container_66");
});
