const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: "./src/start.js",
  mode: "development",
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        loader: "babel-loader",
        options:
		{
		  presets: ["@babel/env", "@babel/preset-react"],
		  plugins: [ "@babel/plugin-proposal-class-properties"]
		}
      }
    ]
  },
  resolve: {
	  alias: {
		  src : path.resolve(__dirname, 'src'),
		  pages : path.resolve(__dirname, 'src/pages'),
		  components : path.resolve(__dirname, 'src/components'),
	  },
	  extensions: ["*", ".js", ".jsx", '.json']
  },
  output: {
    path: path.resolve(__dirname, "bundle/"),
    publicPath: "/bundle/",
    filename: "bundle.js"
  },
  watch: true,
  watchOptions: {
    poll: 1000,
	ignored: ['node_modules/**', 'build/**', 'bundle/**', 'data/**', 'external/**', 'ressources/**']
  },
  target : "electron-main"
};
