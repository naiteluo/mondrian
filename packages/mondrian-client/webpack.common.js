const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    app: "./src/app.ts",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[chunkhash].js",
    clean: true,
  },
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
  module: {
    rules: [
      // loader for shader
      {
        test: /\.(glsl|vs|fs|vert|frag)$/,
        loader: "raw-loader",
      },
      {
        test: /\.(j|t)sx?$/,
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-typescript"],
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [{ loader: "style-loader" }, { loader: "css-loader" }],
      },
      {
        test: /\.(woff2?|eot|ttf|otf|png|gif|jpg|jpeg|ico)(\?.*)?$/,
        loader: "file-loader",
      },
    ],
  },
  resolve: {
    extensions: [".js", ".json", ".ts"],
    alias: {
      // ts config path mapping do not work using babel-loader, add alias in webpack config
      "mondrian/lib": path.resolve(__dirname, "../mondrian/src"),
    },
  },
  context: __dirname,
  target: "web",
  plugins: [
    new HtmlWebpackPlugin({
      title: "Mondrian",
      template: "./assets/__index.html",
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: "assets", to: "assets" }],
    }),
  ],
};
