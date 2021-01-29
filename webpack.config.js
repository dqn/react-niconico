const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: {
    app: path.join(__dirname, "src", "__test__", "index.tsx"),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "__test__", "index.html"),
    }),
  ],
  resolve: {
    extensions: [".js", "jsx", ".ts", ".tsx"],
  },
  devtool: "inline-source-map",
  devServer: {
    compress: true,
    historyApiFallback: true,
  },
};
