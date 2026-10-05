export const FONT_FACES = [
  { family: "Timeless Sans", file: "TimelessSans-SansRegular.woff2", weight: 400, style: "normal" },
  {
    family: "Timeless Sans",
    file: "TimelessSans-SansRegularItalic.woff2",
    weight: 400,
    style: "italic",
  },
  { family: "Timeless Sans", file: "TimelessSans-SansMedium.woff2", weight: 500, style: "normal" },
  {
    family: "Timeless Sans",
    file: "TimelessSans-SansSemibold.woff2",
    weight: 600,
    style: "normal",
  },
  { family: "Timeless Sans", file: "TimelessSans-SansBold.woff2", weight: 700, style: "normal" },
  {
    family: "Timeless Sans Grotesk",
    file: "TimelessSans-GroteskMedium.woff2",
    weight: 500,
    style: "normal",
  },
  {
    family: "Timeless Sans Grotesk",
    file: "TimelessSans-GroteskSemibold.woff2",
    weight: 600,
    style: "normal",
  },
  {
    family: "Timeless Serif Text",
    file: "TimelessSerif-TextRegular.woff2",
    weight: 400,
    style: "normal",
  },
  {
    family: "Timeless Serif Text",
    file: "TimelessSerif-TextMedium.woff2",
    weight: 500,
    style: "normal",
  },
  {
    family: "Timeless Serif Text",
    file: "TimelessSerif-TextSemibold.woff2",
    weight: 600,
    style: "normal",
  },
  {
    family: "Timeless Serif Text",
    file: "TimelessSerif-RegularItalic.woff2",
    weight: 400,
    style: "italic",
  },
  {
    family: "Timeless Serif",
    file: "TimelessSerif-Regular.woff2",
    weight: 400,
    style: "normal",
  },
  {
    family: "Timeless Serif",
    file: "TimelessSerif-Medium.woff2",
    weight: 500,
    style: "normal",
  },
  {
    family: "Timeless Serif",
    file: "TimelessSerif-Semibold.woff2",
    weight: 600,
    style: "normal",
  },
  {
    family: "Timeless Serif",
    file: "TimelessSerif-RegularItalic.woff2",
    weight: 400,
    style: "italic",
  },
] as const;

const SANS_FALLBACKS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const SERIF_FALLBACKS = '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif';

export const FONT_STACKS = {
  sans: `"Timeless Sans", ${SANS_FALLBACKS}`,
  serif: `"Timeless Serif Text", ${SERIF_FALLBACKS}`,
  display: `"Timeless Serif", ${SERIF_FALLBACKS}`,
  grotesk: `"Timeless Sans Grotesk", ${SANS_FALLBACKS}`,
  mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
} as const;

export const FONT_FILES = new Set<string>(FONT_FACES.map(({ file }) => file));

export function fontFaceCss(baseUrl: string): string {
  const base = baseUrl.replace(/\/+$/, "");
  return FONT_FACES.map(
    ({ family, file, weight, style }) => `
@font-face {
  font-family: "${family}";
  font-style: ${style};
  font-weight: ${weight};
  src: url("${base}/fonts/${file}") format("woff2");
  font-display: swap;
}`,
  ).join("\n");
}

export function fontTokenCss(): string {
  return `:root{--font-sans:${FONT_STACKS.sans};--font-serif:${FONT_STACKS.serif};--font-display:${FONT_STACKS.display};--font-grotesk:${FONT_STACKS.grotesk};--font-mono:${FONT_STACKS.mono}}`;
}
