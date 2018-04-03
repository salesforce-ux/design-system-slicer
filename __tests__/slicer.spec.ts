// Copyright (c) 2015-present, salesforce.com, inc. All rights reserved
// Licensed under BSD 3-Clause - see LICENSE.txt or git.io/sfdc-license

import * as fs from "fs";
import * as path from "path";

import { create as createSlicer } from "../src/slicer";
import { create as createCache, Cache } from "../src/cache";

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
      datepickers: [".slds-datepicker"]
    },
    [".slds-hyphenate", ".slds-truncate_container_66"],
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

it("has an utils slice", () => {
  const slicer = createSlicer(cache);
  const result = slicer.utils(".slds-truncate_container_66");

  expect(result).toMatch(".slds-truncate_container_66");
  expect(result).not.toMatch(".slds-hyphenate");
  expect(result).not.toMatch("html");
  expect(result).not.toMatch(".slds-button");
});

it("buttons slice", () => {
  const slicer = createSlicer(cache);
  const result = slicer.sliceForComponents("buttons");

  expect(result).toMatch(".slds-button");
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
