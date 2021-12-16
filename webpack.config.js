const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./src/app.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "app.js",
  },

  module: {
    rules: [
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
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
          },
        ],
      },
      {
        test: /\.(woff2?|eot|ttf|otf|png|gif|jpg|jpeg)(\?.*)?$/,
        loader: "file-loader",
      },
    ],
  },

  resolve: {
    extensions: [
      ".js",
      ".json",
      ".jsx",
      ".ts",
      ".tsx",
      ".css",
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
    ],
  },

  devtool: "source-map",
  context: __dirname,
  target: "web",
  watch: false,
  devServer: {
    proxy: {
      "/api": "http://localhost:3000",
    },
    compress: false,
    historyApiFallback: false,
    hot: true,
    overlay: true,
  },

  plugins: [
    new HtmlWebpackPlugin({}),
    new CopyWebpackPlugin({
      patterns: [{ from: "assets", to: "assets" }],
    }),
  ],
};
