// Seed content for `sideshow demo` — two example sessions that show what
// agents draw on the surface. Keep this file dependency-free like the CLI.

const JWT_DIAGRAM = `
<svg role="img" aria-labelledby="jwt-flow-title jwt-flow-desc" width="100%" viewBox="0 0 680 330">
  <title id="jwt-flow-title">JWT refresh lifecycle</title>
  <desc id="jwt-flow-desc">The client retries an expired access token after the refresh endpoint rotates its cookie.</desc>

  <line class="leader" x1="110" y1="104" x2="110" y2="294"/>
  <line class="leader" x1="340" y1="104" x2="340" y2="294"/>
  <line class="leader" x1="570" y1="104" x2="570" y2="294"/>

  <line class="arr" x1="110" y1="126" x2="334" y2="126" marker-end="url(#arrow)"/>
  <rect class="mask" x="178" y="103" width="94" height="16"/>
  <text class="lbl" x="225" y="114" text-anchor="middle">EXPIRED JWT</text>

  <line class="arr c-red" x1="340" y1="164" x2="116" y2="164" marker-end="url(#arrow)"/>
  <rect class="mask" x="179" y="141" width="92" height="16"/>
  <text class="lbl" x="225" y="152" text-anchor="middle">401 EXPIRED</text>

  <line class="arr" x1="110" y1="204" x2="564" y2="204" marker-end="url(#arrow)"/>
  <rect class="mask" x="282" y="181" width="116" height="16"/>
  <text class="lbl" x="340" y="192" text-anchor="middle">REFRESH COOKIE</text>

  <line class="arr c-green" x1="570" y1="242" x2="116" y2="242" marker-end="url(#arrow)"/>
  <rect class="mask" x="281" y="219" width="118" height="16"/>
  <text class="lbl" x="340" y="230" text-anchor="middle">NEW TOKEN PAIR</text>

  <line class="arr" x1="110" y1="280" x2="334" y2="280" marker-end="url(#arrow)"/>
  <rect class="mask" x="194" y="257" width="62" height="16"/>
  <text class="lbl" x="225" y="268" text-anchor="middle">RETRY</text>

  <rect class="box" x="35" y="58" width="150" height="46"/>
  <text class="name" x="110" y="78" text-anchor="middle">Client</text>
  <text class="sub" x="110" y="94" text-anchor="middle">memory-only token</text>
  <g class="focal">
    <rect class="box" x="265" y="58" width="150" height="46"/>
    <text class="name" x="340" y="78" text-anchor="middle">Auth API</text>
    <text class="sub" x="340" y="94" text-anchor="middle">/api (guarded)</text>
  </g>
  <g class="c-amber">
    <rect class="box" x="495" y="58" width="150" height="46"/>
    <text class="name" x="570" y="78" text-anchor="middle">Refresh</text>
    <text class="sub" x="570" y="94" text-anchor="middle">httpOnly cookie</text>
  </g>
</svg>`;

const JWT_EXPLAINER = `
<p style="font-family: var(--font-sans); color: var(--color-text-primary); line-height: 1.6; margin: 14px 6px 4px;">
  The access token lives in memory only (a JS variable) — never localStorage, so XSS
  can't exfiltrate a long-lived credential. The client never stores the refresh token
  in JS — it lives in an httpOnly cookie and only travels to
  <code style="font-family: var(--font-mono); font-size: 0.92em;">/auth/refresh</code>.
  Rotation means a stolen refresh token dies on first reuse.
</p>`;

const BACKOFF = `
<div id="bk" style="font-family: var(--font-sans); color: var(--color-text-primary);">
  <div style="display: flex; align-items: center; gap: 12px;">
    <span style="font-weight: 500;">Base delay</span>
    <input type="range" id="base" min="50" max="1000" step="50" value="200" style="flex: 1;">
    <span id="baseVal" style="width: 64px; text-align: right; font-weight: 500;">200 ms</span>
  </div>
  <label style="display: flex; align-items: center; gap: 8px; margin: 10px 0 14px; color: var(--color-text-secondary); cursor: pointer;">
    <input type="checkbox" id="jitter">
    Full jitter — each client waits a random time within the window
  </label>
  <div id="rows"></div>
</div>
<script>
  var baseEl = document.getElementById("base");
  var jitterEl = document.getElementById("jitter");
  var ATTEMPTS = 5;

  function fmt(ms) {
    return ms < 1000 ? Math.round(ms) + " ms" : (Math.round(ms / 100) / 10) + " s";
  }

  function render() {
    var base = Number(baseEl.value);
    document.getElementById("baseVal").textContent = fmt(base);
    var max = base * Math.pow(2, ATTEMPTS - 1);
    var html = "";
    for (var i = 0; i < ATTEMPTS; i++) {
      var delay = base * Math.pow(2, i);
      var actual = jitterEl.checked ? Math.random() * delay : delay;
      html +=
        '<div style="display: flex; align-items: center; gap: 10px; margin: 7px 0;">' +
        '<span style="width: 72px; color: var(--color-text-secondary); font-size: 13px;">attempt ' + (i + 1) + "</span>" +
        '<span style="flex: 1; height: 10px; border-radius: 5px; background: var(--color-background-secondary); position: relative; overflow: hidden;">' +
        '<span style="position: absolute; inset: 0; width: ' + (delay / max) * 100 + '%; background: var(--color-background-info);"></span>' +
        '<span style="position: absolute; inset: 0; width: ' + (actual / max) * 100 + '%; background: var(--color-text-info); border-radius: 5px;"></span>' +
        "</span>" +
        '<span style="width: 64px; text-align: right; font-size: 13px;">' + fmt(actual) + "</span>" +
        "</div>";
    }
    document.getElementById("rows").innerHTML = html;
  }

  baseEl.oninput = render;
  jitterEl.onchange = render;
  render();
</script>`;

const QUEUE_METRICS = `
<div style="font-family: var(--font-sans); color: var(--color-text-primary);">
  <div style="display: flex; gap: 10px; margin-bottom: 16px;">
    <div style="flex: 1; border: 0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-md); padding: 12px 14px;">
      <div style="font-size: 22px; font-weight: 500;">12 ms</div>
      <div style="font-size: 12px; color: var(--color-text-secondary);">p50 wait</div>
    </div>
    <div style="flex: 1; border: 0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-md); padding: 12px 14px;">
      <div style="font-size: 22px; font-weight: 500;">86 ms</div>
      <div style="font-size: 12px; color: var(--color-text-secondary);">p95 wait</div>
    </div>
    <div style="flex: 1; border: 0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-md); padding: 12px 14px;">
      <div style="font-size: 22px; font-weight: 500; color: var(--color-text-success);">−71%</div>
      <div style="font-size: 12px; color: var(--color-text-secondary);">p95 vs yesterday</div>
    </div>
    <div style="flex: 1; border: 0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-md); padding: 12px 14px;">
      <div style="font-size: 22px; font-weight: 500;">1.4k</div>
      <div style="font-size: 12px; color: var(--color-text-secondary);">jobs / min</div>
    </div>
  </div>
  <svg width="100%" viewBox="0 0 680 150" font-family="var(--font-sans)" font-size="11">
    <g id="bars"></g>
    <line x1="430" y1="8" x2="430" y2="120" stroke="var(--color-border-secondary)" stroke-dasharray="3 4"/>
    <text x="436" y="16" fill="var(--color-text-tertiary)">batched dequeue deployed</text>
    <text x="20" y="140" fill="var(--color-text-tertiary)">p95 queue wait, last 24h</text>
  </svg>
</div>
<script>
  var p95 = [
    270, 290, 310, 285, 300, 320, 295, 305, 330, 310, 290, 315,
    300, 295, 310, 88, 84, 90, 82, 86, 84, 88, 85, 86
  ];
  var W = 660 / p95.length;
  var g = document.getElementById("bars");
  var ns = "http://www.w3.org/2000/svg";
  for (var i = 0; i < p95.length; i++) {
    var h = (p95[i] / 340) * 112;
    var r = document.createElementNS(ns, "rect");
    r.setAttribute("x", 20 + i * W + 2);
    r.setAttribute("y", 120 - h);
    r.setAttribute("width", W - 4);
    r.setAttribute("height", h);
    r.setAttribute("rx", 2);
    r.setAttribute("fill", p95[i] < 150 ? "var(--color-text-success)" : "var(--color-text-info)");
    g.appendChild(r);
  }
</script>`;

const CHARTS_DEMO = `
<figure class="chart">
  <span class="eyebrow">CI pipeline · main branch</span>
  <h3>Tests make up 41% of pipeline time</h3>
  <p class="dek">Median duration by stage across the last 20 green builds; each column starts at zero.</p>
  <svg width="100%" viewBox="0 0 680 230" role="img" aria-labelledby="pipeline-title pipeline-desc">
    <title id="pipeline-title">Median CI duration by stage</title>
    <desc id="pipeline-desc">Plan takes 3 minutes, build 15, tests 24, package 7, and release 9. Tests are the focal stage.</desc>
    <g class="gridline">
      <line x1="72" y1="180" x2="646" y2="180"/>
      <line x1="72" y1="152" x2="646" y2="152"/>
      <line x1="72" y1="124" x2="646" y2="124"/>
      <line x1="72" y1="96" x2="646" y2="96"/>
      <line x1="72" y1="68" x2="646" y2="68"/>
      <line x1="72" y1="40" x2="646" y2="40"/>
    </g>
    <g class="axis">
      <line x1="72" y1="32" x2="72" y2="180"/>
      <line x1="72" y1="180" x2="646" y2="180"/>
    </g>
    <g class="tick" text-anchor="end">
      <text x="62" y="184">0</text>
      <text x="62" y="156">5</text>
      <text x="62" y="128">10</text>
      <text x="62" y="100">15</text>
      <text x="62" y="72">20</text>
      <text x="62" y="44">25</text>
    </g>
    <rect class="col" x="97" y="163.2" width="52" height="16.8" rx="2"/>
    <rect class="col" x="207" y="96" width="52" height="84" rx="2"/>
    <rect class="col focal" x="317" y="45.6" width="52" height="134.4" rx="2"/>
    <rect class="col" x="427" y="140.8" width="52" height="39.2" rx="2"/>
    <rect class="col" x="537" y="129.6" width="52" height="50.4" rx="2"/>
    <g text-anchor="middle">
      <text class="value" x="123" y="157">3</text>
      <text class="value" x="233" y="89">15</text>
      <text class="value focal" x="343" y="39">24</text>
      <text class="value" x="453" y="134">7</text>
      <text class="value" x="563" y="123">9</text>
    </g>
    <g class="cat" text-anchor="middle">
      <text x="123" y="202">Plan</text>
      <text x="233" y="202">Build</text>
      <text x="343" y="202">Test</text>
      <text x="453" y="202">Package</text>
      <text x="563" y="202">Release</text>
    </g>
  </svg>
  <figcaption class="source">Source: main-branch CI jobs, last 20 green builds; median minutes per stage.</figcaption>
</figure>

<figure class="chart" style="margin-top: 24px;">
  <span class="eyebrow">Post-deploy p95 latency · ms</span>
  <h3 class="headline">Worker p95 latency fell 28%</h3>
  <p class="dek">Five days after batched dequeue shipped, the focal series fell from 92 to 66 ms.</p>
  <svg width="100%" viewBox="0 0 680 176" role="img" aria-labelledby="latency-title latency-desc">
    <title id="latency-title">Post-deploy p95 latency by service</title>
    <desc id="latency-desc">Worker p95 latency falls from 92 to 66 milliseconds while API and queue latency also trend down.</desc>
    <g class="gridline">
      <line x1="62" y1="135" x2="626" y2="135"/>
      <line x1="62" y1="110" x2="626" y2="110"/>
      <line x1="62" y1="85" x2="626" y2="85"/>
      <line x1="62" y1="60" x2="626" y2="60"/>
      <line x1="62" y1="35" x2="626" y2="35"/>
    </g>
    <g class="axis">
      <line x1="62" y1="30" x2="62" y2="135"/>
      <line x1="62" y1="135" x2="626" y2="135"/>
    </g>
    <g class="tick" text-anchor="end">
      <text x="52" y="139">0</text>
      <text x="52" y="114">25</text>
      <text x="52" y="89">50</text>
      <text x="52" y="64">75</text>
      <text x="52" y="39">100</text>
    </g>
    <polyline class="trend s1" points="80,107 200,109 320,110 440,112 560,114"/>
    <polyline class="trend s2" points="80,67 200,75 320,79 440,83 560,87"/>
    <polyline class="trend focal" points="80,43 200,49 320,57 440,63 560,69"/>
    <g>
      <circle class="pt s1" cx="80" cy="107" r="3"/>
      <circle class="pt s1" cx="200" cy="109" r="3"/>
      <circle class="pt s1" cx="320" cy="110" r="3"/>
      <circle class="pt s1" cx="440" cy="112" r="3"/>
      <circle class="pt s1" cx="560" cy="114" r="3"/>
      <circle class="pt s2" cx="80" cy="67" r="3"/>
      <circle class="pt s2" cx="200" cy="75" r="3"/>
      <circle class="pt s2" cx="320" cy="79" r="3"/>
      <circle class="pt s2" cx="440" cy="83" r="3"/>
      <circle class="pt s2" cx="560" cy="87" r="3"/>
      <circle class="pt focal" cx="80" cy="43" r="3"/>
      <circle class="pt focal" cx="200" cy="49" r="3"/>
      <circle class="pt focal" cx="320" cy="57" r="3"/>
      <circle class="pt focal" cx="440" cy="63" r="3"/>
      <circle class="pt focal" cx="560" cy="69" r="3"/>
    </g>
    <g class="cat" text-anchor="middle">
      <text x="80" y="156">Mon</text>
      <text x="200" y="156">Tue</text>
      <text x="320" y="156">Wed</text>
      <text x="440" y="156">Thu</text>
      <text x="560" y="156">Fri</text>
    </g>
  </svg>
  <div class="legend">
    <span class="key"><i class="s1 line"></i>API</span>
    <span class="key"><i class="s2 line"></i>Queue</span>
    <span class="key"><i class="focal line"></i>Worker</span>
  </div>
  <figcaption class="source">Source: service telemetry, Monday–Friday; p95 milliseconds.</figcaption>
</figure>`;

// Seeded in order; the viewer sorts sessions by last activity, so the last
// session here ends up on top.
export const DEMO_SESSIONS = [
  {
    agent: "pi",
    title: "Queue profiling",
    snippets: [
      {
        title: "Queue latency after batched dequeue",
        html: QUEUE_METRICS,
      },
      {
        title: "Build time by pipeline stage",
        html: CHARTS_DEMO,
        kits: ["charts"],
      },
    ],
  },
  {
    agent: "claude-code",
    title: "Auth refactor",
    snippets: [
      {
        title: "JWT refresh flow",
        html: JWT_DIAGRAM,
        followups: [
          { comment: { author: "user", text: "Where does the access token live client-side?" } },
          { update: { html: JWT_DIAGRAM + JWT_EXPLAINER } },
          {
            comment: {
              author: "claude-code",
              text: "In memory only — never localStorage. Updated the diagram to show it.",
            },
          },
        ],
      },
      {
        title: "Exponential backoff, intuitively",
        html: BACKOFF,
      },
    ],
  },
];
