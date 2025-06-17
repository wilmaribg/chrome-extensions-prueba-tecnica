import fs from "fs";
import path from "path";

export const readPackageJson = (packagePath = process.cwd()) => {
  try {
    const fullPath = path.resolve(packagePath, "package.json");
    if (!fs.existsSync(fullPath)) {
      throw new Error("package.json not found in the current directory.");
    }
    const data = fs.readFileSync(fullPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error leyendo package.json en ${packagePath}:`, error);
    throw error;
  }
};
