import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import image from "@rollup/plugin-image";
import pkg from "./packages/mondrian/package.json";
const path = require("path");

const mondrianProjectPath = path.join(__dirname, "packages/mondrian");

export default [
  // browser-friendly UMD build
  {
    input: path.join(mondrianProjectPath, "lib/index.js"),
    output: {
      name: pkg.namespace,
      file: path.join(mondrianProjectPath, pkg.browser),
      format: "umd",
    },
    plugins: [
      resolve({
        jsnext: true,
        main: true,
        browser: true,
        preferBuiltins: false,
      }), // so Rollup can find `ms`
      commonjs(), // so Rollup can convert `ms` to an ES module
      image(),
    ],
  },

  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // an array for the `output` option, where we can specify
  // `file` and `format` for each target)
  //   {
  //     input: "src/main.js",
  //     external: ["ms"],
  //     output: [
  //       { file: pkg.main, format: "cjs" },
  //       { file: pkg.module, format: "es" },
  //     ],
  //   },
];
