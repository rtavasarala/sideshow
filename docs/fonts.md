# Timeless fonts

The viewer and rendered surfaces can use the Timeless type family when its font
files are installed locally. Without them, all surfaces fall back to the system
font stacks and continue to work.

Font binaries are not committed or included in the npm package because the
license does not permit public redistribution. Keep their original filenames
and do not modify or redistribute the supplied files.

Use the font tokens by role: `--font-sans` for UI and body text,
`--font-serif` for long reading prose, `--font-display` for headlines at least
20px and big numbers, `--font-grotesk` for wordmarks and small labels, and
`--font-mono` for code.

Install from an extracted font-family directory or its zip archive:

```sh
npm run fonts:install -- /path/to/Timeless-Type-Family
```

The installer copies the required WOFF2 faces into `public/fonts/`, which is
gitignored except for its `.gitkeep` marker.

For Cloudflare deployments, install the font files before deploying so Wrangler
includes them in its `public` assets:

```sh
npm run fonts:install -- /path/to/Timeless-Type-Family
npm run deploy
```
