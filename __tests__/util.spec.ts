// Copyright (c) 2015-present, salesforce.com, inc. All rights reserved
// Licensed under BSD 3-Clause - see LICENSE.txt or git.io/sfdc-license

import { Util } from "../src/util";

// @ts-ignore
import ui from "./__fixtures__/ui.json";

const slicerUtil = new Util(ui);

it("componentsForSelector", () => {
  expect(slicerUtil.componentsForSelector(".slds-button")).toEqual(["buttons"]);
  expect(slicerUtil.componentsForSelector(".slds-is-selected")).toEqual([
    "datepickers",
    "buttons"
  ]);
});

it("isUtility", () => {
  expect(slicerUtil.isUtility(".slds-button")).toEqual(false);
  expect(slicerUtil.isUtility(".slds-truncate_container_66")).toEqual(true);
});

it("components", () => {
  expect(slicerUtil.components().map(c => c.annotations.name)).toEqual([
    "datepickers",
    "modals",
    "buttons",
    "form-layout"
  ]);
});

describe("rootSelectors", () => {
  it("buttons", () => {
    expect(slicerUtil.rootSelectors("buttons")).toEqual([
      ".slds-button",
      ".slds-button_stateful",
      ".slds-button_neutral",
      ".slds-button_brand",
      ".slds-button_inverse",
      ".slds-button_destructive",
      ".slds-button_success",
      ".slds-button_small",
      ".slds-not-selected",
      ".slds-is-selected-clicked",
      ".slds-is-selected"
    ]);
  });

  it("datepickers", () => {
    expect(slicerUtil.rootSelectors("datepickers")).toEqual([
      ".slds-datepicker"
    ]);
  });
});
