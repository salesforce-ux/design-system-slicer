const postcss = require("postcss");
const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const cache = require("../dist/cache.json");
const css = fs.readFileSync(
  path.resolve(
    __dirname,
    "../node_modules/@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.css"
  )
);

const visit = (css, f) =>
  postcss()
    .use(root => root.walkRules(c => f(c)))
    .process(css, { from: undefined })
    .then(result => result.css);

const allRules = css => {
  const rs = [];
  return visit(css, x => rs.push(x)).then(() => rs);
};

xit("fitness", () =>
  allRules(css).then(rules =>
    allRules(cache.map(x => x.css).join("\n")).then(rules2 =>
      expect(
        _.difference(rules.map(r => r.selector), rules2.map(r => r.selector))
      ).toEqual([])
    )
  ));
