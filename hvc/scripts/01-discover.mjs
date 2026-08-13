#!/usr/bin/env node
/**
 * Step 1 — find the site and write down what the account can see.
 *
 * Account-level, so it needs only WIX_API_KEY + WIX_ACCOUNT_ID. It prints the
 * WIX_SITE_ID you need for every later step.
 *
 * Docs:
 *   Query Sites          https://dev.wix.com/docs/api-reference/account-level/sites/sites/query-sites
 *   Published Site Urls  https://dev.wix.com/docs/api-reference/business-management/site-urls/published-site-urls/list-published-site-urls
 */

import { call, pageByCursor, save, outDir } from './lib/wix.mjs';

const dir = process.env.HVC_OUT_DIR || outDir();

console.log('Sites in this account:');
const sites = await pageByCursor(
  async ({ limit, cursor }) => {
    const res = await call('/site-list/v2/sites/query', {
      method: 'POST',
      scope: 'account',
      body: { query: { cursorPaging: cursor ? { limit, cursor } : { limit } } },
    });
    return { items: res.sites ?? [], next: res.metadata?.cursors?.next };
  },
  { label: 'sites' },
);

await save(`${dir}/00-sites.json`, sites);

for (const s of sites) {
  const name = s.displayName || s.name || '(naamloos)';
  const url = s.viewUrl || s.url || '';
  console.log(`  ${s.id}  ${name.padEnd(28)} ${url}${s.published === false ? '  [niet gepubliceerd]' : ''}`);
}

if (!sites.length) {
  console.error('\nGeen sites gevonden. Controleer of de API key toegang heeft tot deze site.');
  process.exit(1);
}

// Once a site is selected, record its published URLs — this is the page
// inventory the crawler works from.
const siteId = process.env.WIX_SITE_ID;
if (!siteId) {
  console.log('\nZet WIX_SITE_ID in .env op de juiste site-id hierboven en draai daarna de rest.');
  process.exit(0);
}

console.log(`\nGepubliceerde URLs voor site ${siteId}:`);
try {
  const urls = await call('/urls-server/v2/published-site-urls');
  await save(`${dir}/00-published-urls.json`, urls);
  for (const u of urls.urls ?? []) console.log(`  ${u.url ?? JSON.stringify(u)}`);
} catch (err) {
  console.error(`  overgeslagen: ${err.message.split('\n')[0]}`);
}

console.log(`\nKlaar. Output in ${dir}/`);
