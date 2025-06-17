// webpack-plugin-puppeteer-extension.js
import fs from "fs";
import os from "os";
import path from "path";

export default function puppeteerExtensionPlugin(options = {}, puppeteer, chokidar) {
  const defaultOptions = {
    watchFiles: [],
    extensionPath: path.resolve(process.cwd(), "dist"),
    chromeExecutablePath: null, // optional custom Chrome path
  };

  const opts = {
    ...defaultOptions,
    ...options,
  };

  let browser;
  let page;

  return {
    apply: (compiler) => {
      compiler.hooks.afterEmit.tapAsync(
        "PuppeteerExtensionPlugin",
        async (compilation, callback) => {
          if (browser) return callback();

          // Carpeta base temporal del sistema
          const baseTempDir = os.tmpdir();
          // Path completo con el nombre dado
          const tempDirPath = path.resolve(baseTempDir, "prolibu-chrome");

          // Crear carpeta si no existe
          if (!fs.existsSync(tempDirPath)) {
            fs.mkdirSync(tempDirPath, { recursive: true });
          }

          // Guardar la ruta para que otros plugins puedan accederla
          compiler.tempDirPath = tempDirPath;

          try {
            const launchOptions = {
              headless: false,
              args: [
                `--disable-extensions-except=${opts.extensionPath}`,
                `--load-extension=${opts.extensionPath}`,
                `--user-data-dir=${tempDirPath}`,
                "--no-sandbox",
                "--disable-setuid-sandbox",
              ],
              pipe: true,
            };

            console.log(
              "[PuppeteerExtensionPlugin] Launching Chrome with extension..."
            );
            browser = await puppeteer.launch(launchOptions);
            const pages = await browser.pages();
            page = pages[0];

            if (opts.watchFiles && opts.watchFiles.length > 0) {
              const watcher = chokidar.watch(opts.watchFiles);
              watcher.on("change", async (file) => {
                console.log(
                  `[PuppeteerExtensionPlugin] File changed: ${file}, reloading extension...`
                );
                try {
                  await page.reload({ waitUntil: "networkidle0" });
                } catch (err) {
                  console.warn(
                    "[PuppeteerExtensionPlugin] Error reloading page:",
                    err.message
                  );
                }
              });
            }
          } catch (err) {
            console.error(
              "[PuppeteerExtensionPlugin] Failed to launch Chrome:",
              err.message
            );
          }

          callback();
        }
      );

      compiler.hooks.done.tap("PuppeteerExtensionPlugin", () => {
        console.log("[PuppeteerExtensionPlugin] Build complete.");
      });

      compiler.hooks.shutdown.tapPromise(
        "PuppeteerExtensionPlugin",
        async () => {
          if (browser) {
            console.log("[PuppeteerExtensionPlugin] Closing Chrome...");
            await browser.close();
          }
        }
      );
    },
  };
}
