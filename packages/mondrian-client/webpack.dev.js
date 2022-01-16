const { merge } = require("webpack-merge");
const common = require("./webpack.common");

module.exports = merge(common, {
  mode: "development",
  devtool: "source-map",
  devServer: {
    proxy: {
      "/api": "http://localhost:3000",
    },
    compress: true,
    hot: true,
  },
});
