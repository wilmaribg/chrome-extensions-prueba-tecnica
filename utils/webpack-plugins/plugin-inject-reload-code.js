import fs from "fs";
import path from "path";

/**
 * Webpack plugin para inyectar código HMR en el entry point
 */
export default function injectReloadCodePlugin() {
  return {
    name: "InjectReloadCodePlugin",
    apply(compiler) {
      compiler.hooks.emit.tapAsync(
        "InjectReloadCodePlugin",
        (compilation, callback) => {
          const entryFiles = Object.keys(compilation.assets).filter((file) =>
            file.endsWith(".js")
          );

          const reloadCode = `
if ((import.meta).hot) {
  (import.meta).hot.accept(() => {
    // @ts-expect-error
    chrome.runtime.reload();
  });
}
`;

          for (const file of entryFiles) {
            const originalSource = compilation.assets[file].source();
            const updatedSource = `${originalSource}\n${reloadCode}`;

            compilation.assets[file] = {
              source: () => updatedSource,
              size: () => updatedSource.length,
            };
          }

          callback();
        }
      );
    },
  };
}
