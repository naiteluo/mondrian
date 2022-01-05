const { merge } = require("webpack-merge");
const common = require("./webpack.common");

module.exports = merge(common, {
  mode: "production",
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/](@pixi|pixi.js)[\\/]/,
          name: "vendors-pixi",
          chunks: "all",
        },
      },
    },
  },
});
