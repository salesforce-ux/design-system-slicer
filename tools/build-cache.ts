import * as fs from "fs-extra";
import * as path from "path";

import { create as createCache } from "../src/cache";
import { Cache, RootSelectors } from "../src/types";
import { create as createUtil } from "../src/util";

const css = fs.readFileSync(
  require.resolve(
    "@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.css"
  ),
  "utf8"
);

const util = createUtil(require("@salesforce-ux/design-system/ui.json"));

const rootSelectors = util
  .components()
  .map(c => c.annotations.name)
  .reduce<RootSelectors>(
    (acc: RootSelectors, componentName: string) =>
      Object.assign(acc, {
        [componentName]: util.rootSelectors(componentName)
      }),
    {}
  );

const utilities = util.utilities().map(u => u.annotations.selector);

createCache(rootSelectors, utilities, css)
  .then(cache => {
    fs.outputFileSync(
      path.resolve(__dirname, "..", "..", "cache.json"),
      JSON.stringify(cache, null, 2)
    );
  })
  .catch(e => {
    console.log(e);
  });
