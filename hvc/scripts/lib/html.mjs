/**
 * Minimal HTML -> structured copy extraction.
 *
 * Deliberately regex-based and dependency-free: this runs once, against a Wix
 * site that server-renders its text for SEO, and the goal is to capture the
 * *copy* (headings, paragraphs, list items, link labels, alt text) — not to
 * reproduce the markup. Anything that needs real DOM fidelity should be read
 * from the saved raw HTML alongside the extracted markdown.
 */

const BLOCK_TAGS = 'h1|h2|h3|h4|h5|h6|p|li|blockquote|figcaption|dt|dd|td|th';

const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  eacute: 'é', egrave: 'è', ecirc: 'ê', euml: 'ë', agrave: 'à', acirc: 'â',
  auml: 'ä', ccedil: 'ç', iuml: 'ï', icirc: 'î', ocirc: 'ô', ouml: 'ö',
  ugrave: 'ù', ucirc: 'û', uuml: 'ü', euro: '€', hellip: '…', rsquo: '’',
  lsquo: '‘', ldquo: '“', rdquo: '”', ndash: '–', mdash: '—', middot: '·',
};

export function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m);
}

function stripTags(s) {
  return decodeEntities(s.replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

/** Remove everything that never contains visible copy. */
function stripNonContent(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|noscript|svg|template|iframe)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ');
}

function metaContent(html, attr, value) {
  const re = new RegExp(
    `<meta[^>]*${attr}=["']${value}["'][^>]*content=["']([^"']*)["']`,
    'i',
  );
  const alt = new RegExp(
    `<meta[^>]*content=["']([^"']*)["'][^>]*${attr}=["']${value}["']`,
    'i',
  );
  const m = html.match(re) || html.match(alt);
  return m ? decodeEntities(m[1]).trim() : '';
}

/**
 * Pull the page's copy out of raw HTML.
 * Returns { title, description, ogTitle, ogDescription, canonical, lang,
 *           headings, blocks, links, images }
 */
export function extractPage(html) {
  const head = html.slice(0, Math.max(0, html.search(/<\/head>/i)) || html.length);
  const body = stripNonContent(
    html.slice(html.search(/<body\b/i) === -1 ? 0 : html.search(/<body\b/i)),
  );

  const titleMatch = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const canonicalMatch = head.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
  const langMatch = html.match(/<html[^>]*\blang=["']([^"']+)["']/i);

  const headings = [];
  const blocks = [];
  const blockRe = new RegExp(`<(${BLOCK_TAGS})\\b[^>]*>([\\s\\S]*?)<\\/\\1>`, 'gi');
  for (const m of body.matchAll(blockRe)) {
    const tag = m[1].toLowerCase();
    const text = stripTags(m[2]);
    if (!text) continue;
    // Wix repeats each block for its mobile layout; keep the first occurrence.
    if (blocks.some((b) => b.text === text)) continue;
    blocks.push({ tag, text });
    if (/^h[1-6]$/.test(tag)) headings.push({ level: Number(tag[1]), text });
  }

  const links = [];
  for (const m of body.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const label = stripTags(m[2]);
    const href = decodeEntities(m[1]).trim();
    if (!href || href.startsWith('javascript:')) continue;
    if (links.some((l) => l.href === href && l.label === label)) continue;
    links.push({ href, label });
  }

  const images = [];
  for (const m of body.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0];
    const src = tag.match(/\bsrc=["']([^"']+)["']/i)?.[1];
    const alt = tag.match(/\balt=["']([^"']*)["']/i)?.[1] ?? '';
    if (!src || src.startsWith('data:')) continue;
    const url = decodeEntities(src).trim();
    if (images.some((i) => i.src === url)) continue;
    images.push({ src: url, alt: decodeEntities(alt).trim() });
  }

  return {
    title: titleMatch ? stripTags(titleMatch[1]) : '',
    description: metaContent(head, 'name', 'description'),
    ogTitle: metaContent(head, 'property', 'og:title'),
    ogDescription: metaContent(head, 'property', 'og:description'),
    canonical: canonicalMatch ? decodeEntities(canonicalMatch[1]) : '',
    lang: langMatch ? langMatch[1] : '',
    headings,
    blocks,
    links,
    images,
  };
}

/** Render an extracted page as readable markdown, for reviewing the copy. */
export function toMarkdown(url, page) {
  const out = [`# ${page.title || url}`, '', `**URL:** ${url}`];
  if (page.description) out.push(`**Meta description:** ${page.description}`);
  if (page.ogTitle) out.push(`**OG title:** ${page.ogTitle}`);
  if (page.ogDescription) out.push(`**OG description:** ${page.ogDescription}`);
  if (page.lang) out.push(`**Lang:** ${page.lang}`);
  out.push('', '---', '');

  for (const b of page.blocks) {
    if (/^h[1-6]$/.test(b.tag)) out.push(`${'#'.repeat(Math.min(6, Number(b.tag[1]) + 1))} ${b.text}`, '');
    else if (b.tag === 'li') out.push(`- ${b.text}`);
    else if (b.tag === 'blockquote') out.push(`> ${b.text}`, '');
    else out.push(b.text, '');
  }

  if (page.images.length) {
    out.push('', '## Afbeeldingen', '');
    for (const img of page.images) out.push(`- ${img.alt ? `**${img.alt}** — ` : ''}${img.src}`);
  }
  if (page.links.length) {
    out.push('', '## Links', '');
    for (const l of page.links) out.push(`- [${l.label || '(geen label)'}](${l.href})`);
  }
  return out.join('\n') + '\n';
}

/** URL path -> safe flat filename. `/` becomes `home`. */
export function slugForUrl(url) {
  let path;
  try {
    path = new URL(url).pathname;
  } catch {
    path = url;
  }
  const slug = path.replace(/^\/+|\/+$/g, '').replace(/[^a-z0-9._-]+/gi, '-').toLowerCase();
  return slug || 'home';
}
