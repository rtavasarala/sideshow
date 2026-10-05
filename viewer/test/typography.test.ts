import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import { FONT_STACKS } from "../../server/typography.ts";

const styles = readFileSync("viewer/src/styles.css", "utf8");

test("viewer font tokens match the shared typography stacks", () => {
  const tokens = {
    "--font-sans": FONT_STACKS.sans,
    "--font-serif": FONT_STACKS.serif,
    "--font-display": FONT_STACKS.display,
    "--font-grotesk": FONT_STACKS.grotesk,
    "--font-mono": FONT_STACKS.mono,
  };
  const normalizedStyles = styles.replace(/\s+/g, " ");

  for (const [name, value] of Object.entries(tokens)) {
    expect(normalizedStyles).toContain(`${name}: ${value};`);
  }
});
