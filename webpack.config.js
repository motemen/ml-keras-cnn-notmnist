const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = env => ({
  entry: "./src/index.ts",
  output: {
    filename: "bundle.js",
    path: __dirname + "/dist",
    publicPath: ""
  },
  devtool: "source-map",
  resolve: {
    extensions: [".ts", ".js", ".json"]
  },
  module: {
    rules: [{ test: /\.ts$/, loader: "ts-loader" }]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "public/index.html"
    }),
    new CopyWebpackPlugin([
      {
        from: "public/model",
        to: "model"
      }
    ])
  ]
});
