import fs from "fs";
import path from "path";
import https from "https";
import { fileURLToPath } from "url";
import { build } from "esbuild";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sdkUrl =
  "https://s3.amazonaws.com/public.prolibu.com/domains/suite.prolibu.com/static/sdk.js";

const cacheDir = path.resolve("dist", ".cache"); // inside dist
const sdkFile = path.resolve(cacheDir, "sdk.js");
const bundledSdkFile = path.resolve(cacheDir, "sdk.wrapped.js");

export default class DownloadSDKPlugin {
  apply(compiler) {
    compiler.hooks.beforeCompile.tapPromise("DownloadSDKPlugin", async () => {
      if (!fs.existsSync("dist")) fs.mkdirSync("dist");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

      // Always download fresh: no cache check or age logic
      console.log("⬇️ Downloading remote sdk.js (no cache)...");
      const buffer = await downloadToBuffer(sdkUrl);
      fs.writeFileSync(sdkFile, buffer);

      console.log(
        "📦 Bundling sdk.js with esbuild (injecting axios globally)..."
      );

      await build({
        entryPoints: [sdkFile],
        outfile: bundledSdkFile,
        bundle: true,
        platform: "browser",
        format: "iife",
        globalName: "ProlibuSDKBundle",
        inject: [path.resolve(__dirname, "axios-global-shim.js")],
        banner: {
          js: `
      // Define SDK global in CSP-safe way
      (function() {
        var SDK = 
    `,
        },
        footer: {
          js: `
        ;
        if (typeof self !== 'undefined') self.__PROLIBU_SDK__ = SDK;
      })();
    `,
        },
      });

      console.log("✅ sdk.wrapped.js created.");
    });

    compiler.hooks.emit.tapAsync(
      "InjectBundledSDKPlugin",
      (compilation, callback) => {
        const bundledSdkBuffer = fs.readFileSync(bundledSdkFile);
        compilation.assets["sdk.wrapped.js"] = {
          source: () => bundledSdkBuffer,
          size: () => bundledSdkBuffer.length,
        };
        callback();
      }
    );
  }
}

function downloadToBuffer(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200)
          return reject(
            new Error(`Failed to download sdk.js: HTTP ${res.statusCode}`)
          );
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      })
      .on("error", reject);
  });
}
