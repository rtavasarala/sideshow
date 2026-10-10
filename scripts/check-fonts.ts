import type { Dirent } from "node:fs";
import { readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { FONT_FACES } from "../server/typography.ts";

const requiredFiles = [...new Set<string>(FONT_FACES.map(({ file }) => file))];
const requiredFileSet = new Set(requiredFiles);

export async function checkFonts(dir: string): Promise<{ missing: string[]; extra: string[] }> {
  let entries: Dirent[];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") {
      return { missing: [...requiredFiles], extra: [] };
    }
    throw error;
  }

  const present = new Set(entries.filter((entry) => entry.isFile()).map(({ name }) => name));
  return {
    missing: requiredFiles.filter((file) => !present.has(file)),
    extra: entries
      .filter(
        (entry) => entry.isFile() && entry.name !== ".gitkeep" && !requiredFileSet.has(entry.name),
      )
      .map(({ name }) => name)
      .sort(),
  };
}

async function main() {
  const fontsDirectory = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "fonts");
  const { missing, extra } = await checkFonts(fontsDirectory);

  if (extra.length) {
    console.warn(
      `Warning: extra files will be uploaded as Worker assets but are never served by the /fonts route allowlist:\n${extra.map((file) => `  ${file}`).join("\n")}`,
    );
  }

  if (missing.length) {
    if (process.env.SIDESHOW_SYSTEM_FONTS === "1") {
      console.warn(
        `Warning: Timeless fonts are missing; this deploy will fall back to system fonts:\n${missing.map((file) => `  ${file}`).join("\n")}`,
      );
      return;
    }

    console.error(
      `Missing required Timeless font files:\n${missing.map((file) => `  ${file}`).join("\n")}`,
    );
    console.error("Install them with: npm run fonts:install -- <Timeless zip or directory>");
    console.error("Or deploy with system fonts on purpose: SIDESHOW_SYSTEM_FONTS=1 npm run deploy");
    process.exitCode = 1;
    return;
  }

  console.log(`Timeless fonts: ${requiredFiles.length}/${requiredFiles.length} present`);
}

const scriptPath = process.argv[1];
if (scriptPath && import.meta.url === pathToFileURL(scriptPath).href) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
