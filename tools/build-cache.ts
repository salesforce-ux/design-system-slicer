import * as fs from "fs-extra";
import * as path from "path";

import { create as createCache } from "../src/build-time/cache";

const css = fs.readFileSync(
  require.resolve(
    "@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.css"
  ),
  "utf8"
);

createCache(css)
  .then(cache => {
    fs.outputFileSync(
      path.resolve(__dirname, "..", "..", "cache.json"),
      JSON.stringify(cache, null, 2)
    );
  })
  .catch(e => {
    console.log(e);
  });
