const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { cleanData } = require("jquery");

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === "development";
  const outputPath = isDevelopment
    ? path.resolve(__dirname, "Extension/development")
    : path.resolve(__dirname, "Extension/production");

  return {
    entry: {
      "service-worker": "./src/background/service-worker.js",
      "content/content-script": "./src/content/content-script.js",
      "content/panel-component": "./src/content/panel-component.js",
      "content/capture": "./src/content/capture.js",
    },
    devtool: false,
    output: {
      path: outputPath,
      filename: "[name].js",
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.(svg|png)$/,
          type: "asset/resource",
        },
      ],
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src/"),
      },
    },
    plugins: [
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: [outputPath],
      }),
      new CopyPlugin({
        patterns: [
          {
            from: "src/manifest.json",
            to: ".",
          },
          {
            from: "src/popup/popup.html",
            to: "./popup/",
          },
          {
            from: "src/popup/popup.css",
            to: "./popup/",
          },
          {
            from: "src/content/panel-template.html",
            to: "./content/",
          },
          {
            from: "src/icons",
            to: "./icons/",
          },
        ],
      }),
    ],
  };
};
