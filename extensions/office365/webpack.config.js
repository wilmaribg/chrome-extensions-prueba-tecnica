// webpack.config.mjs
import path from "path";
import puppeteer from "puppeteer";
import chokidar from "chokidar";
import { fileURLToPath } from "url";
import CopyPlugin from "copy-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

import generateManifestPlugin from "../../utils/webpack-plugins/plugin-generate-manifest.js";
import puppeteerExtensionPlugin from "../../utils/webpack-plugins/plugin-puppeteer-extension.js";
import injectReloadCodePlugin from "../../utils/webpack-plugins/plugin-inject-reload-code.js";
//import downloadSDKPlugin from "../../utils/webpack-plugins/plugin-download-sdk.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: "development",
  entry: {
    main: path.resolve(__dirname, 'src/styles/main.scss'),
    viewSource: path.resolve(__dirname, "src/viewSource.ts"),
    popup: path.resolve(__dirname, "src/popup.ts"),
    background: path.resolve(__dirname, "src/background.js"),
    auth: path.resolve(__dirname, "src/auth.ts"),
    signIn: path.resolve(__dirname, "src/signIn.ts"),
    signInMicrosoft: path.resolve(__dirname, "src/signInMicrosoft.ts"),

  },
  devtool: "cheap-module-source-map", // no source maps in output (avoids inline eval)
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    clean: true,
    module: true,
    chunkFormat: "array-push", // compatible with <script> tag
    library: {
      type: "var", // output to a global variable (e.g., window.popup)
      name: "[name]",
    },
  },
  experiments: {
    outputModule: true, // 👈 Enables module output
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"],
    alias: {
      // Puedes definir tus alias aquí
    },
    modules: [
      "node_modules",
      path.resolve(__dirname, "./node_modules"), // or whatever your workspace root is
    ],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        include: [
          path.resolve(__dirname, "../../packages/shared-utils/src"), // shared package
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
      },
      {
        test: /\.s[ac]ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.(jpe?g|gif|png|svg)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              outputPath: "assets",
              name: `[contenthash].[ext]`,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"],
    alias: {
      "@src": path.resolve(__dirname, "src"),
      "@assets": path.resolve(__dirname, "assets"),
      "@shared-utils": path.resolve(
        __dirname,
        "../../packages/shared-utils/src"
      ),
      "@utils": path.resolve(__dirname, "../../utils"),
      "@sdk": path.resolve(__dirname, "./.cache/sdk.wrapped.js"),
    },
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "main.css",
    }),
    new HtmlWebpackPlugin({
      filename: "popup.html",
      chunks: ["popup"],
      template: path.resolve(__dirname, "src/popup.html"),
      scriptLoading: "module",
    }),
    new HtmlWebpackPlugin({
      filename: "auth.html",
      chunks: ["auth"],
      template: path.resolve(__dirname, "src/auth.html"),
      scriptLoading: "module",
    }),
    new HtmlWebpackPlugin({
      filename: "viewSource.html",
      chunks: ["viewSource", "main"],
      template: path.resolve(__dirname, "src/viewSource.html"),
      scriptLoading: "module",
    }),

    new HtmlWebpackPlugin({
      filename: "signIn.html",
      chunks: ["signIn",],
      template: path.resolve(__dirname, "src/signIn.html"),
      scriptLoading: "module",
    }),
    new HtmlWebpackPlugin({
      filename: "signInMicrosoft.html",
      chunks: ["signInMicrosoft",],
      template: path.resolve(__dirname, "src/signInMicrosoft.html"),
      scriptLoading: "module",
    }),
    new CopyPlugin({
      patterns: [
        { from: "assets/icon.svg", to: "" },
        { from: "assets/icon16.png", to: "" },
        { from: "assets/icon48.png", to: "" },
        { from: "assets/icon128.png", to: "" },
        { from: "assets/icontab.png", to: "" },
      ],
    }),
    new generateManifestPlugin({
      resources: [
        "[name].js",
        "favicon.ico",
        "icon16.png",
        "icon48.png",
        "icon128.png",
        "icontab.png",
        "auth.html",
        "popup.html",
        "viewSource.html",
        "signIn.html"
      ],
    }),
    new injectReloadCodePlugin(),
    new puppeteerExtensionPlugin(null, puppeteer, chokidar),
    //new downloadSDKPlugin(),
  ],
  optimization: {
    minimize: false, // true in production (but make sure minimizer doesn't use eval)
  },
  performance: {
    hints: false,
  },
  devServer: {
    host: "localhost", // 👈 Add this line
    port: 8081, // 👈 Make sure you match the port if needed
    devMiddleware: {
      writeToDisk: true, // 👈 esto habilita archivos físicos
    },
  },
  watch: true,
  watchOptions: {
    ignored: ["**/.cache/**", "**/node_modules/**"],
  },
};
