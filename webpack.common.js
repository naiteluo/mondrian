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
  module: {
    rules: [
      // loader for shader
      {
        test: /\.(glsl|vs|fs|vert|frag)$/,
        loader: "raw-loader",
      },
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
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
