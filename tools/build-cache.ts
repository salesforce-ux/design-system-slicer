import { create as createCache, Cache, RootSelectors } from "../src/cache";
import * as fs from "fs-extra";
import * as path from "path";

import { util as slicerUtil } from "../src";

const css = fs
  .readFileSync(
    path.resolve(
      __dirname,
      "node_modules/@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.css"
    )
  )
  .toString();

const util = slicerUtil.create(require("@salesforce-ux/design-system/ui.json"));

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

createCache(rootSelectors, css).then(x =>
  fs.outputFileSync(
    path.resolve(__dirname, "..", "build", "cache.json"),
    JSON.stringify(x, null, 2)
  )
);
