const { Mondrian } = require("./lib/mondrian");
const BrushPluginExports = require("./lib/plugin/brush-plugin");

const combinedExports = {
  Mondrian,
  ...BrushPluginExports,
};

Object.defineProperty(combinedExports, "__esModule", { value: true });

module.exports = combinedExports;
