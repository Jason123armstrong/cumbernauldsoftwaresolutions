// Builds the static site: wraps each page in src/ with the shared header, footer and wiki sidebar.
// Run from the site folder:  node tools/build.mjs
// Each source file starts with a JSON header comment:  <!--{"title": "...", "description": "..."}-->
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "Cumbernauld Software Solutions";
const DOMAIN = "https://cumbernauldsoftwaresolutions.com";
const YEAR = new Date().getFullYear();

// Top-level pages: source file -> output file
const pages = [
  { src: "pages/index.html", out: "index.html", nav: "home" },
  { src: "pages/golf-score-and-more.html", out: "golf-score-and-more.html", nav: "app" },
  { src: "pages/privacy.html", out: "privacy.html", nav: "privacy" },
];

// Wiki: grouped and in reading order
export const wiki = [
  { group: "Getting started", items: [
    ["index", "Guide home"],
    ["getting-started", "Install and first steps"],
    ["home-screen", "Finding your way around"],
  ]},
  { group: "Playing a round", items: [
    ["new-round", "Start a new round"],
    ["scoring", "Score a hole"],
    ["distances", "Hole map, GPS and distances"],
    ["shot-notes", "Tee shots, putts and notes"],
    ["scorecard", "The full scorecard"],
  ]},
  { group: "Playing with others", items: [
    ["live-card", "Share a live group card"],
    ["competitions", "Run a competition"],
    ["friends", "Follow friends"],
  ]},
  { group: "Courses and players", items: [
    ["courses", "Find and add courses"],
    ["scan-scorecard", "Scan a paper scorecard"],
    ["players", "Players and handicaps"],
  ]},
  { group: "After the round", items: [
    ["history", "Round history and awards"],
    ["analysis", "Analysis and handicap index"],
  ]},
  { group: "Settings and help", items: [
    ["options", "Options and cloud backup"],
    ["your-data", "Your data and privacy"],
    ["troubleshooting", "Troubleshooting and FAQ"],
  ]},
];

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function readSource(rel) {
  const raw = readFileSync(join(root, "src", rel), "utf8");
  const m = raw.match(/^<!--(\{[\s\S]*?\})-->\s*/);
  if (!m) throw new Error(`Missing JSON header in src/${rel}`);
  return { meta: JSON.parse(m[1]), body: raw.slice(m[0].length) };
}

const logo = `<svg width="38" height="38" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="14" fill="#154d2a"/><ellipse cx="32" cy="50" rx="20" ry="5" fill="#1f6a3b"/><path d="M26 50V12" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/><path d="M27 13l17 6.5-17 6.5z" fill="#f2c94c"/><circle cx="40" cy="45" r="5" fill="#fff"/></svg>`;

function header(p, nav) {
  const cur = (k) => (nav === k ? ' aria-current="page"' : "");
  return `<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap">
    <a class="brand" href="${p}index.html">${logo}<span>Cumbernauld Software<small>Solutions Limited</small></span></a>
    <button class="menu-btn" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="site-nav">&#9776;</button>
    <nav class="nav" id="site-nav" aria-label="Main">
      <a href="${p}index.html"${cur("home")}>Home</a>
      <a href="${p}golf-score-and-more.html"${cur("app")}>Golf Score &amp; More</a>
      <a href="https://www.chessosaurus.com/">Chessosaurus</a>
      <a href="${p}wiki/index.html"${cur("wiki")}>Guide</a>
      <a href="${p}index.html#company"${cur("company")}>Company</a>
      <a class="cta" href="${p}index.html#contact">Contact us</a>
    </nav>
  </div>
</header>`;
}

function footer(p) {
  return `<footer class="site-footer">
  <div class="wrap">
    <div class="cols">
      <div>
        <a class="brand" href="${p}index.html">${logo}<span>Cumbernauld Software<small>Solutions Limited</small></span></a>
        <p style="margin-top:16px;max-width:320px">Independent software company in Cumbernauld, Scotland. We make Golf Score &amp; More and Chessosaurus for Android.</p>
      </div>
      <div><h4>Products</h4><ul>
        <li><a href="${p}golf-score-and-more.html">Golf Score &amp; More</a></li>
        <li><a href="https://www.chessosaurus.com/">Chessosaurus</a></li>
        <li><a href="${p}golf-score-and-more.html#features">Features</a></li>
        <li><a href="${p}golf-score-and-more.html#screens">Screenshots</a></li>
      </ul></div>
      <div><h4>Help</h4><ul>
        <li><a href="${p}wiki/index.html">User guide</a></li>
        <li><a href="${p}wiki/getting-started.html">Getting started</a></li>
        <li><a href="${p}wiki/troubleshooting.html">Troubleshooting</a></li>
        <li><a href="mailto:support@cumbernauldsoftwaresolutions.com">Email support</a></li>
      </ul></div>
      <div><h4>Company</h4><ul>
        <li><a href="${p}index.html#company">About us</a></li>
        <li><a href="${p}index.html#contact">Contact</a></li>
        <li><a href="${p}privacy.html">Privacy policy</a></li>
      </ul></div>
    </div>
    <div class="legal">
      <span>&copy; ${YEAR} Cumbernauld Software Solutions Ltd. All rights reserved.</span>
      <span>Cumbernauld Software Solutions Ltd is a private limited company registered in Scotland, company number SC717373. Registered office: 26 Wellesley Drive, Cumbernauld, Glasgow, G68 9PG, Scotland.</span>
    </div>
  </div>
</footer>`;
}

const script = `<script>
(function () {
  var b = document.querySelector('.menu-btn'), n = document.getElementById('site-nav');
  if (b && n) b.addEventListener('click', function () {
    var open = n.classList.toggle('open'); b.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  var d = document.querySelector('.wiki-nav details');
  if (d && window.matchMedia('(max-width: 900px)').matches) d.removeAttribute('open');
  var s = document.getElementById('wiki-search');
  if (s) s.addEventListener('input', function () {
    var q = s.value.trim().toLowerCase(), any = false;
    if (q && d) d.setAttribute('open', '');
    document.querySelectorAll('.wiki-nav li').forEach(function (li) {
      var hit = !q || (li.textContent + ' ' + (li.dataset.keys || '')).toLowerCase().indexOf(q) !== -1;
      li.style.display = hit ? '' : 'none'; if (hit) any = true;
    });
    document.querySelectorAll('.wiki-nav h4').forEach(function (h) {
      var ul = h.nextElementSibling, vis = ul && Array.prototype.some.call(ul.children, function (li) { return li.style.display !== 'none'; });
      h.style.display = vis ? '' : 'none';
    });
    var nr = document.querySelector('.no-results'); if (nr) nr.style.display = any ? 'none' : 'block';
  });
})();
</script>`;

function layout({ title, description, body, p, nav, canonical }) {
  const fullTitle = title === SITE ? SITE : `${title} · ${SITE}`;
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${DOMAIN}/${canonical}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${DOMAIN}/${canonical}">
<meta property="og:image" content="${DOMAIN}/img/og.png">
<meta name="theme-color" content="#0b2e18">
<link rel="icon" href="${p}favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${p}style.css">
</head>
<body>
${header(p, nav)}
<main id="main">
${body}
</main>
${footer(p)}
${script}
</body>
</html>
`;
}

function wikiNav(active) {
  const groups = wiki.map((g) => `<h4>${esc(g.group)}</h4><ul>${g.items.map(([slug, label]) => {
    const { meta } = readSource(`wiki/${slug}.html`);
    return `<li data-keys="${esc(meta.keywords || "")}"><a href="${slug}.html"${slug === active ? ' aria-current="page"' : ""}>${esc(label)}</a></li>`;
  }).join("")}</ul>`).join("");
  return `<aside class="wiki-nav" aria-label="Guide contents">
  <input class="wiki-search" id="wiki-search" type="search" placeholder="Search the guide" aria-label="Search the guide">
  <details open><summary>Guide contents</summary>${groups}<p class="no-results">No matching pages.</p></details>
</aside>`;
}

function buildPages() {
  for (const pg of pages) {
    const { meta, body } = readSource(pg.src);
    const canonical = pg.out === "index.html" ? "" : pg.out;
    writeFileSync(join(root, pg.out), layout({ ...meta, body, p: "", nav: pg.nav, canonical }));
    console.log("built", pg.out);
  }
}

function buildWiki() {
  mkdirSync(join(root, "wiki"), { recursive: true });
  const flat = wiki.flatMap((g) => g.items);
  flat.forEach(([slug, label], i) => {
    if (!existsSync(join(root, "src", "wiki", `${slug}.html`))) throw new Error(`Missing src/wiki/${slug}.html`);
    const { meta, body } = readSource(`wiki/${slug}.html`);
    const prev = flat[i - 1], next = flat[i + 1];
    const pager = `<nav class="pager" aria-label="Previous and next">
      ${prev ? `<a href="${prev[0]}.html"><small>Previous</small>&larr; ${esc(prev[1])}</a>` : "<span></span>"}
      ${next ? `<a href="${next[0]}.html" style="text-align:right"><small>Next</small>${esc(next[1])} &rarr;</a>` : "<span></span>"}
    </nav>`;
    const html = `<section class="page-hero"><div class="wrap">
  <div class="crumbs"><a href="index.html">User guide</a>${slug === "index" ? "" : ` / ${esc(label)}`}</div>
  <h1>${esc(meta.heading || meta.title)}</h1>
  ${meta.lead ? `<p class="lead">${meta.lead}</p>` : ""}
</div></section>
<div class="wrap wiki">
${wikiNav(slug)}
<article class="article"><div class="prose">
${body}
${pager}
</div></article>
</div>`;
    writeFileSync(join(root, "wiki", `${slug}.html`), layout({ ...meta, body: html, p: "../", nav: "wiki", canonical: `wiki/${slug}.html` }));
    console.log("built", `wiki/${slug}.html`);
  });
}

function buildSitemap() {
  const urls = ["", "golf-score-and-more.html", "privacy.html", ...wiki.flatMap((g) => g.items.map(([s]) => `wiki/${s}.html`))];
  writeFileSync(join(root, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${DOMAIN}/${u}</loc></url>`).join("\n")}
</urlset>
`);
  writeFileSync(join(root, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /src/\nDisallow: /tools/\nSitemap: ${DOMAIN}/sitemap.xml\n`);
  console.log("built sitemap.xml, robots.txt");
}

buildPages();
buildWiki();
buildSitemap();
