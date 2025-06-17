import fs from "fs";
import path from "path";
import { readPackageJson } from "../readPackageJson.js";

export default function generateManifestPlugin({ options = {}, resources }) {
  return {
    apply: (compiler) => {
      compiler.hooks.emit.tapAsync(
        "GenerateManifestPlugin",
        (compilation, callback) => {
          const packageJson = readPackageJson(process.cwd());

          const {
            name = packageJson.name,
            description = packageJson.description,
            version = packageJson.version,
            overrides = {},
            filename = "manifest.json",
          } = options;

          if (!name || !description) {
            throw new Error(
              "The 'name' and 'description' fields are required."
            );
          }

          const baseManifest = {
            name,
            description,
            version,
            manifest_version: 3,
            icons: {
              16: "./icon16.png",
              48: "./icon48.png",
              128: "./icon128.png",
            },
            action: {
              default_popup: "viewSource.html",
              default_icon: {
                16: "./icon16.png",
                48: "./icon48.png",
                128: "./icon128.png",
              },
            },
            background: {
              service_worker: "background.js",
              type: "module",
            },
            web_accessible_resources: [
              {
                resources,
                matches: ["<all_urls>"],
              },
            ],
            permissions: [
              "storage",
              "identity",
              "scripting",
              "tabs",
              "activeTab",
            ],
            host_permissions: [
              "https://onedrive.live.com/*",
              "https://*.microsoftonline.com/*",
              "https://graph.microsoft.com/*",
            ],
            content_security_policy: {
              extension_pages: "script-src 'self'; object-src 'self'",
            },
          };

          const finalManifest = {
            ...baseManifest,
            ...overrides,
            action: {
              ...baseManifest.action,
              ...(overrides.action || {}),
            },
            content_security_policy: {
              ...baseManifest.content_security_policy,
              ...(overrides.content_security_policy || {}),
            },
          };

          const json = JSON.stringify(finalManifest, null, 2);
          const outputPath = path.join(compiler.options.output.path, filename);

          // Add manifest to webpack output
          compilation.assets[filename] = {
            source: () => json,
            size: () => json.length,
          };

          // Optionally write to disk in dev mode
          if (process.env.NODE_ENV === "development") {
            fs.mkdirSync(path.dirname(outputPath), { recursive: true });
            fs.writeFileSync(outputPath, json);
          }

          callback();
        }
      );
    },
  };
}
