import assert from "node:assert/strict";
import { mkdtempSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { checkFonts } from "../scripts/check-fonts.ts";
import { createApp, type AppOptions } from "../server/app.ts";
import { JsonFileStore } from "../server/storage.ts";
import { FONT_FACES } from "../server/typography.ts";

const requiredFontFiles = [...new Set<string>(FONT_FACES.map(({ file }) => file))];

function makeApp(options: Pick<AppOptions, "authToken" | "basePath" | "fontFile"> = {}) {
  const dir = mkdtempSync(join(tmpdir(), "sideshow-font-test-"));
  return createApp({
    store: new JsonFileStore(join(dir, "data.json")),
    viewerHtml: "<!doctype html><html><head></head><body>viewer</body></html>",
    guideMarkdown: "# guide",
    setupText: "# setup",
    ...options,
  });
}

test("GET /fonts serves an allowlisted face with immutable CORS headers without a token", async () => {
  const file = FONT_FACES[0].file;
  const app = makeApp({
    authToken: "secret",
    fontFile: async (requested) => (requested === file ? Uint8Array.of(0, 1, 2) : null),
  });

  const response = await app.request(`/fonts/${file}`);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "font/woff2");
  assert.equal(response.headers.get("cache-control"), "public, max-age=31536000, immutable");
  assert.equal(response.headers.get("access-control-allow-origin"), "*");
  assert.deepEqual([...new Uint8Array(await response.arrayBuffer())], [0, 1, 2]);
});

test("GET /fonts rejects unknown names and traversal attempts", async () => {
  const app = makeApp({ fontFile: async () => Uint8Array.of(1) });

  assert.equal((await app.request("/fonts/not-a-timeless-font.woff2")).status, 404);
  assert.equal((await app.request("http://localhost/fonts/%2E%2E%2Fsecret.woff2")).status, 404);
});

test("GET /fonts returns 404 when no provider or font bytes are available", async () => {
  const file = FONT_FACES[0].file;
  const noProvider = makeApp();
  const noBytes = makeApp({ fontFile: async () => null });
  const emptyBytes = makeApp({ fontFile: async () => new Uint8Array() });

  assert.equal((await noProvider.request(`/fonts/${file}`)).status, 404);
  assert.equal((await noBytes.request(`/fonts/${file}`)).status, 404);
  assert.equal((await emptyBytes.request(`/fonts/${file}`)).status, 404);
});

test("viewer and surface font URLs include the configured base path", async () => {
  const app = makeApp({ basePath: "/u/alice" });
  const viewer = await (await app.request("https://board.test/")).text();
  assert.ok(
    viewer.includes(
      'url("https://board.test/u/alice/fonts/TimelessSans-SansRegular.woff2") format("woff2")',
    ),
  );

  const created = await app.request("/api/snippets", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ html: "<h1>Surface</h1>" }),
  });
  assert.equal(created.status, 201);
  const snippet = (await created.json()) as { id: string };
  const surface = await (await app.request(`https://board.test/s/${snippet.id}?part=0`)).text();
  assert.ok(
    surface.includes(
      'url("https://board.test/u/alice/fonts/TimelessSans-SansRegular.woff2") format("woff2")',
    ),
  );
});

test("checkFonts accepts a complete font directory", async () => {
  const dir = mkdtempSync(join(tmpdir(), "sideshow-font-check-test-"));
  try {
    for (const file of requiredFontFiles) writeFileSync(join(dir, file), "font");
    assert.deepEqual(await checkFonts(dir), { missing: [], extra: [] });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("checkFonts reports exactly the missing required font", async () => {
  const dir = mkdtempSync(join(tmpdir(), "sideshow-font-check-test-"));
  const missingFile = requiredFontFiles[0];
  try {
    for (const file of requiredFontFiles) writeFileSync(join(dir, file), "font");
    unlinkSync(join(dir, missingFile));
    assert.deepEqual(await checkFonts(dir), { missing: [missingFile], extra: [] });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("checkFonts reports extras but ignores .gitkeep", async () => {
  const dir = mkdtempSync(join(tmpdir(), "sideshow-font-check-test-"));
  try {
    for (const file of requiredFontFiles) writeFileSync(join(dir, file), "font");
    writeFileSync(join(dir, ".gitkeep"), "");
    writeFileSync(join(dir, "LICENSE.txt"), "license");
    assert.deepEqual(await checkFonts(dir), { missing: [], extra: ["LICENSE.txt"] });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("checkFonts treats a nonexistent directory as entirely missing", async () => {
  const parent = mkdtempSync(join(tmpdir(), "sideshow-font-check-test-"));
  try {
    assert.deepEqual(await checkFonts(join(parent, "missing")), {
      missing: requiredFontFiles,
      extra: [],
    });
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
});
