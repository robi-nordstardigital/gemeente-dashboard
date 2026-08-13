#!/usr/bin/env node
/**
 * Step 3 — export structured content that lives in Wix apps rather than in the
 * page layout: blog posts and categories, and form submissions.
 *
 * Every section is optional: a site without a blog or without Wix Forms simply
 * reports "niet geinstalleerd" and the run continues.
 *
 * Docs:
 *   List Posts       https://dev.wix.com/docs/api-reference/business-solutions/blog/posts-stats/list-posts
 *   List Categories  https://dev.wix.com/docs/api-reference/business-solutions/blog/category/list-categories
 *   Query Submissions By Namespace
 *                    https://dev.wix.com/docs/api-reference/crm/forms/form-submissions/query-submissions-by-namespace
 *
 * NOTE: form submissions contain personal data (GDPR) — same handling as contacts.
 */

import { call, callFirstAvailable, pageByOffset, pageByCursor, save, outDir } from './lib/wix.mjs';

const dir = process.env.HVC_OUT_DIR || outDir();

// The reference header and the curl example in the Blog docs give different
// prefixes for the same method, so try both rather than betting on one.
const POST_PATHS = ['/blog/v3/posts', '/v3/posts'];
const SUBMISSION_PATHS = [
  '/forms/v4/submissions/namespace/query',
  '/form-submission-service/v4/submissions/namespace/query',
];

async function section(name, fn) {
  console.log(`\n${name}:`);
  try {
    await fn();
  } catch (err) {
    const first = err.message.split('\n')[0];
    if (err.status === 404 || err.status === 403) console.log(`  overgeslagen (app niet geinstalleerd of geen rechten): ${first}`);
    else console.error(`  fout: ${first}`);
  }
}

await section('Blogposts', async () => {
  const posts = await pageByOffset(
    async ({ limit, offset }) => {
      const qs = `?paging.limit=${limit}&paging.offset=${offset}&fieldsets=CONTENT_TEXT&fieldsets=URL&fieldsets=RICH_CONTENT`;
      const res = await callFirstAvailable(POST_PATHS.map((p) => p + qs));
      return res.posts ?? [];
    },
    { label: 'posts' },
  );
  if (posts.length) await save(`${dir}/02-blog-posts.json`, posts);
  else console.log('  geen posts gevonden');
});

await section('Blogcategorieen', async () => {
  const res = await call('/blog/v3/categories?fieldsets=URL&paging.limit=100');
  const categories = res.categories ?? [];
  if (categories.length) await save(`${dir}/02-blog-categories.json`, categories);
  else console.log('  geen categorieen gevonden');
});

await section('Formulierinzendingen', async () => {
  // Submissions can only be queried per namespace; wix.form_app.form is the
  // namespace of the Wix Forms app itself.
  const submissions = await pageByCursor(
    async ({ limit, cursor }) => {
      const res = await callFirstAvailable(SUBMISSION_PATHS, {
        method: 'POST',
        body: {
          query: {
            filter: { namespace: 'wix.form_app.form' },
            cursorPaging: cursor ? { limit, cursor } : { limit },
          },
        },
      });
      return { items: res.submissions ?? [], next: res.metadata?.cursors?.next };
    },
    { label: 'inzendingen' },
  );
  if (submissions.length) await save(`${dir}/03-form-submissions.json`, submissions);
  else console.log('  geen inzendingen gevonden');
});

console.log(`\nKlaar. Output in ${dir}/`);
