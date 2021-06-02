import { join, parse } from "path";
import * as fs from "fs";

export const baselineToTester = (config: { tscRoot: string }) => {
  const resultsCache = new Map<string, string | null>();

  const compilerBaselinesDir = join(config.tscRoot, "tests", "cases", "compiler");
  const fourslashBaselinesDir = join(config.tscRoot, "tests", "cases", "fourslash");

  const casesDir = join(config.tscRoot, "tests", "cases");
  let folders: string[] = [];

  return (path: string) => {
    const parsed = parse(path);
    const name = parsed.name;
    const dir = parsed.dir;
    const nameTS = name + ".ts";
    const withoutExt = join(dir, name).replace(".errors", "");

    // Allow a quick lookup via caching
    const cached = resultsCache.get(withoutExt);
    if (cached) return cached;

    const checkDir = (folder: string) => {
      const existsInCompilerBaselines = fs.existsSync(join(folder, nameTS));
      if (existsInCompilerBaselines) {
        resultsCache.set(withoutExt, join(compilerBaselinesDir, nameTS));
        return join(compilerBaselinesDir, nameTS);
      }
    };

    // Fast lookups in the two most populous dirs
    const dirs = [compilerBaselinesDir, fourslashBaselinesDir];
    for (const sourceDir of dirs) {
      const res = checkDir(sourceDir);
      if (res) return res;
    }

    // Fastish lookup via a .symbols file
    const symbolsPath = join(config.tscRoot, dir, name + ".symbols");
    const symbolFileInBaselineExists = fs.existsSync(symbolsPath);
    if (symbolFileInBaselineExists) {
      const symbols = fs.readFileSync(symbolsPath, "utf8");
      if (symbols.startsWith("=== tests")) {
        const path = symbols.split("===")[1].trim();

        // Try the path in the link
        const fullPath = join(config.tscRoot, path);
        if (fs.existsSync(fullPath)) {
          resultsCache.set(withoutExt, fullPath);
          return fullPath;
        }

        // OK, maybe the input filename?
        const testPath = parse(path);
        const sameNamePath = join(config.tscRoot, testPath.dir, nameTS);
        if (fs.existsSync(sameNamePath)) {
          resultsCache.set(withoutExt, sameNamePath);
          return sameNamePath;
        }

        // Try strip a bunch of filename stuff and give it another shot
        const stripped = sameNamePath.split("_").splice(0, 1).join("_").split("(")[0];
        const strippedNamePath = join(stripped + ".ts");
        if (fs.existsSync(strippedNamePath)) {
          resultsCache.set(withoutExt, strippedNamePath);
          return strippedNamePath;
        }
      }
    }

    // Very slow lookup of all dirs, first get all dirs in the compiler test folder
    if (folders.length === 0) folders = getAllDirectories(casesDir);
    for (const folder of folders) {
      const res = checkDir(folder);
      if (res) return res;
    }
  };
};

// Find every folder inside the stuff
const getAllDirectories = (source: string) => {
  const files: string[] = [];

  const getFilesRecursively = (directory: string) => {
    const filesInDirectory = fs.readdirSync(directory, { withFileTypes: true });
    for (const file of filesInDirectory) {
      const absolute = join(directory, file.name);
      if (file.isDirectory()) {
        getFilesRecursively(absolute);
        files.push(absolute);
      }
    }
  };
  getFilesRecursively(source);
  return files;
};
