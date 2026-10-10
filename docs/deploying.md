# Deploying to Cloudflare

## Deploy checklist

Prerequisites: Node.js ≥22.18, `npm install`, and a Cloudflare account. The Worker
bundle is roughly 2.3 MB gzip; `npm run deploy:dry-run` prints the exact size and
the Durable Object, Browser Rendering (Browser Run), and Assets bindings. Review the current
[Workers pricing and limits](https://developers.cloudflare.com/workers/platform/pricing/),
[Durable Objects pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/),
and [Browser Rendering pricing](https://developers.cloudflare.com/browser-run/pricing/)
and [limits](https://developers.cloudflare.com/browser-run/limits/) for your account.

1. Install the licensed Timeless font files:

   ```sh
   npm run fonts:install -- /path/to/Timeless-Type-Family.zip
   ```

2. Check the bundle without Cloudflare credentials:

   ```sh
   npm run deploy:dry-run
   ```

3. Authenticate with Cloudflare:

   ```sh
   npx wrangler login
   ```

4. Generate a deploy token, save it in a password manager, then paste it into
   Wrangler when prompted. The Worker returns 503 until this secret is set.

   ```sh
   openssl rand -hex 32
   npx wrangler secret put SIDESHOW_TOKEN
   ```

5. Deploy. This fails fast when Timeless fonts are missing; set
   `SIDESHOW_SYSTEM_FONTS=1` only to deliberately deploy with system-font
   fallbacks:

   ```sh
   npm run deploy
   # or, intentionally without Timeless fonts:
   SIDESHOW_SYSTEM_FONTS=1 npm run deploy
   ```

6. Open `https://sideshow.<account>.workers.dev/?key=<token>` once to log in.

### Custom domain

The zone must be on Cloudflare. In the dashboard, go to **Workers & Pages →
sideshow → Settings → Domains & Routes → Add → Custom domain**, or add a route
to `wrangler.jsonc`:

```jsonc
"routes": [{ "pattern": "sideshow.example.com", "custom_domain": true }],
"workers_dev": false
```

The `?key=` login cookie is scoped to its host. Log in once on the new domain and
update agents' `SIDESHOW_URL`.

### Updating a fork

Add the upstream remote once, then pull and deploy updates:

```sh
git remote add upstream https://github.com/modem-dev/sideshow.git
git pull upstream main && npm run deploy
```

The viewer's update notice tracks upstream npm releases. Workspace data lives in
the Durable Object and survives redeploys; never rename or delete the
`SideshowBoard` class or its migration tag.

The same app runs on Cloudflare Workers — for when agents run on a different
machine than the browser, or you want the viewer on your phone.

```sh
npx wrangler login
npx wrangler secret put SIDESHOW_TOKEN   # any long random string
npm run deploy                           # https://sideshow.<account>.workers.dev
```

A deployed instance requires the token on every request. Open the viewer once as
`/?key=<token>` to set a cookie. Agents need two environment variables; the CLI
and stdio MCP pick them up automatically:

```sh
export SIDESHOW_URL=https://sideshow.<account>.workers.dev
export SIDESHOW_TOKEN=<token>
```

To share read-only access without handing out the token, set
`SIDESHOW_PUBLIC_READ` on the deployment:

- `SIDESHOW_PUBLIC_READ=session` makes direct `/session/:id` links readable
  without a token while keeping `/` and the session list private (unlisted-link
  style).
- `SIDESHOW_PUBLIC_READ=full` makes all read routes public, including the root
  viewer and session list.

Writes still require `SIDESHOW_TOKEN`, and authenticated owners keep the full
UI. Invalid `SIDESHOW_PUBLIC_READ` values are ignored.

Bare post links (`/s/:postId`) include Open Graph/Twitter metadata for inline
previews. Crawlers only see useful previews when those read routes are publicly
reachable under the settings above; tokened/private workspaces do not put
`?key=` secrets into preview metadata. Preview images use
`/s/:postId.png?card=1`, which requires the Cloudflare Browser Rendering binding
from `wrangler.jsonc` on deployed Workers.

Remote agents can connect MCP straight to the deployment:

```sh
claude mcp add --transport http sideshow https://sideshow.<account>.workers.dev/mcp \
  --header "Authorization: Bearer $SIDESHOW_TOKEN"
```

## Post preview screenshots

A post's first renderable surface can be rendered to a PNG at `/s/:postId.png`
(the viewer's "open first surface as image" action links here; `?card=1`
produces the 1200×630 Open Graph/Twitter preview image embedded in `/s/:postId`
link unfurls). The image is captured by a real headless browser through
Cloudflare's [Browser
Rendering](https://developers.cloudflare.com/browser-rendering/) binding, declared
in `wrangler.jsonc`:

```jsonc
"browser": { "binding": "BROWSER" }
```

Because there is no headless browser on the plain Node server, `/s/:id.png` is a
Workers-only route. The local viewer still shows the screenshot action, but
disabled with a tooltip — there is nothing to render the image. Auth is unchanged:
the Worker first forwards the request to the post's read route, so a private
workspace's screenshots stay as protected as the workspace itself.

Timeless font installation and system-font fallback are covered by the checklist
above; see [docs/fonts.md](fonts.md) for details.

The whole app runs inside a single Durable Object with SQLite storage. One
instance per workspace keeps the in-memory event bus authoritative, so SSE and
long-polling behave the same as the local server.
