#!/usr/bin/env node
/**
 * Step 4 — capture the actual website copy.
 *
 * The Wix REST API exposes structured app data (contacts, blog, forms) but not
 * the text laid out on editor pages. That copy only exists in the published
 * HTML, so this walks the live site: sitemap first, then links found on each
 * page, staying on the same host.
 *
 * For each page it writes:
 *   pages/<slug>.md    readable copy — headings, paragraphs, lists, alt text
 *   raw/<slug>.html    the untouched HTML, so nothing is lost to extraction
 * plus a pages.json index and a media.json manifest of every referenced asset.
 *
 * Needs no API key — it reads the public site.
 *
 * Usage: node 04-crawl-site.mjs [https://www.hvancauteren.be] [--max 200]
 */

import { extractPage, toMarkdown, slugForUrl } from './lib/html.mjs';
import { save, outDir } from './lib/wix.mjs';

const args = process.argv.slice(2);
const START = (args.find((a) => a.startsWith('http')) || process.env.HVC_SITE_URL || 'https://www.hvancauteren.be')
  .replace(/\/+$/, '');
const MAX = Number(args[args.indexOf('--max') + 1]) || Number(process.env.HVC_MAX_PAGES) || 300;
const DELAY_MS = Number(process.env.HVC_CRAWL_DELAY_MS ?? 400); // be polite to the origin

const dir = process.env.HVC_OUT_DIR || outDir();
const origin = new URL(START).origin;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'HVC-content-backup/1.0 (eigen site archivering)' },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.text();
}

/**
 * Canonical form of a URL, so `/pad`, `/pad/` and `/pad#anker` are recognised
 * as one page. Without this the homepage gets fetched twice — once as the
 * start URL and once as the sitemap's trailing-slash variant.
 */
function normalize(href, base) {
  let u;
  try {
    u = new URL(href, base);
  } catch {
    return null;
  }
  u.hash = '';
  u.pathname = u.pathname.length > 1 ? u.pathname.replace(/\/+$/, '') : '/';
  return u.toString();
}

/** Wix publishes a sitemap index that points at per-type sitemaps. */
async function urlsFromSitemap() {
  const found = new Set();
  const queue = [`${origin}/sitemap.xml`];
  const seen = new Set();

  while (queue.length) {
    const sm = queue.shift();
    if (seen.has(sm)) continue;
    seen.add(sm);
    let xml;
    try {
      xml = await get(sm);
    } catch {
      continue;
    }
    const locs = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1]);
    for (const loc of locs) {
      if (/\.xml(\?|$)/i.test(loc)) queue.push(loc);
      else if (loc.startsWith(origin)) {
        const n = normalize(loc, origin);
        if (n) found.add(n);
      }
    }
  }
  return [...found];
}

function isCrawlable(href, from) {
  const normalized = normalize(href, from);
  if (!normalized) return null;
  const u = new URL(normalized);
  if (u.origin !== origin) return null;
  if (!/^https?:$/.test(u.protocol)) return null;
  // Skip binaries and Wix's internal endpoints.
  if (/\.(pdf|jpe?g|png|gif|webp|svg|ico|zip|docx?|xlsx?|mp4|mp3|woff2?|css|js)(\?|$)/i.test(u.pathname)) return null;
  if (/^\/_(api|partials|serverless)/.test(u.pathname)) return null;
  return normalized;
}

console.log(`Crawlen van ${START} (max ${MAX} pagina's)\n`);

const fromSitemap = await urlsFromSitemap();
console.log(fromSitemap.length ? `Sitemap: ${fromSitemap.length} URLs` : 'Geen sitemap gevonden — via links crawlen');

const start = normalize(START, origin);
const queue = fromSitemap.length ? [...fromSitemap] : [start];
if (!queue.includes(start)) queue.unshift(start);

const visited = new Set();
const pages = [];
const media = new Map();
const failures = [];

while (queue.length && pages.length < MAX) {
  const url = queue.shift();
  if (visited.has(url)) continue;
  visited.add(url);

  let html;
  try {
    html = await get(url);
  } catch (err) {
    failures.push({ url, error: String(err.message) });
    console.log(`  ! ${url} — ${err.message}`);
    continue;
  }

  const page = extractPage(html);
  const slug = slugForUrl(url);
  const words = page.blocks.reduce((n, b) => n + b.text.split(/\s+/).length, 0);

  await save(`${dir}/site/raw/${slug}.html`, html);
  await save(`${dir}/site/pages/${slug}.md`, toMarkdown(url, page));

  pages.push({
    url,
    slug,
    title: page.title,
    description: page.description,
    lang: page.lang,
    headings: page.headings,
    blocks: page.blocks.length,
    words,
    images: page.images.length,
  });

  // Resolve to absolute so the manifest stays usable for downloading the
  // assets once the original site is gone.
  for (const img of page.images) {
    let abs;
    try {
      abs = new URL(img.src, url).toString();
    } catch {
      abs = img.src;
    }
    if (!media.has(abs)) media.set(abs, { src: abs, alt: img.alt, usedOn: [] });
    media.get(abs).usedOn.push(url);
  }

  // Only follow links when there was no sitemap to work from.
  if (!fromSitemap.length) {
    for (const l of page.links) {
      const next = isCrawlable(l.href, url);
      if (next && !visited.has(next) && !queue.includes(next)) queue.push(next);
    }
  }

  console.log(`  ${String(pages.length).padStart(3)}. ${url} — ${words} woorden, ${page.images.length} afbeeldingen`);
  if (DELAY_MS) await sleep(DELAY_MS);
}

await save(`${dir}/site/pages.json`, pages);
await save(`${dir}/site/media.json`, [...media.values()]);
if (failures.length) await save(`${dir}/site/failures.json`, failures);

const totalWords = pages.reduce((n, p) => n + p.words, 0);
console.log(
  `\n${pages.length} pagina's, ${totalWords} woorden, ${media.size} unieke afbeeldingen` +
    (failures.length ? `, ${failures.length} mislukt` : '') +
    (queue.length ? `\nLet op: ${queue.length} URLs niet bezocht (--max ${MAX} bereikt)` : ''),
);
console.log(`Output in ${dir}/site/`);
