import { execFile as execFileCallback } from "node:child_process";
import { copyFile, mkdir, mkdtemp, readdir, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { FONT_FACES } from "../server/typography.ts";

const execFile = promisify(execFileCallback);
const requiredFiles = [...new Set<string>(FONT_FACES.map(({ file }) => file))];

async function main() {
  const argument = process.argv[2];
  if (!argument) throw new Error("Usage: npm run fonts:install -- <directory-or-zip>");

  const source = resolve(argument);
  const sourceStat = await stat(source);
  let searchRoot = source;
  let temporaryDirectory: string | undefined;

  try {
    if (sourceStat.isFile() && extname(source).toLowerCase() === ".zip") {
      temporaryDirectory = await mkdtemp(join(tmpdir(), "sideshow-fonts-"));
      await execFile("unzip", ["-q", source, "-d", temporaryDirectory]);
      searchRoot = temporaryDirectory;
    } else if (!sourceStat.isDirectory()) {
      throw new Error(`Expected an extracted directory or .zip archive: ${source}`);
    }

    const found = new Map<string, string>();
    const visit = async (directory: string): Promise<void> => {
      for (const entry of await readdir(directory, { withFileTypes: true })) {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) await visit(path);
        else if (requiredFiles.includes(entry.name) && !found.has(entry.name)) {
          found.set(entry.name, path);
        }
      }
    };
    await visit(searchRoot);

    const fontsDirectory = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "fonts");
    await mkdir(fontsDirectory, { recursive: true });
    const copied: string[] = [];
    const missing: string[] = [];
    for (const file of requiredFiles) {
      const path = found.get(file);
      if (!path) {
        missing.push(file);
        continue;
      }
      await copyFile(path, join(fontsDirectory, basename(file)));
      copied.push(file);
    }

    for (const file of copied) console.log(`Copied ${file}`);
    if (missing.length) {
      console.error(
        `Missing required font files:\n${missing.map((file) => `  ${file}`).join("\n")}`,
      );
      process.exitCode = 1;
    } else {
      console.log(`Installed ${copied.length} font files in ${fontsDirectory}`);
    }
  } finally {
    if (temporaryDirectory) await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
