/**
 * Shared helpers for the Wix REST API.
 *
 * Auth model (per https://dev.wix.com/docs/api-reference/articles/authentication/api-keys/make-api-calls-with-an-api-key):
 *   Authorization: <API_KEY>            (no "Bearer" prefix)
 *   wix-account-id: <ACCOUNT_ID>        for account-level endpoints
 *   wix-site-id:    <SITE_ID>           for site-level endpoints
 * Exactly one of the two ID headers per call — never both.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

// WIX_API_BASE exists so the scripts can be pointed at a local mock in tests.
export const API = process.env.WIX_API_BASE || 'https://www.wixapis.com';

export function env() {
  const apiKey = process.env.WIX_API_KEY;
  const accountId = process.env.WIX_ACCOUNT_ID;
  const siteId = process.env.WIX_SITE_ID;
  if (!apiKey) {
    throw new Error(
      'WIX_API_KEY is not set. Copy .env.example to .env, fill it in, and run with `node --env-file=.env ...`',
    );
  }
  return { apiKey, accountId, siteId };
}

/**
 * One API call. `scope` picks which ID header travels with the request.
 * Returns parsed JSON, or throws with the response body attached so failures
 * are diagnosable (Wix puts the real reason in the body, not the status text).
 */
export async function call(path, { method = 'GET', body, scope = 'site', signal } = {}) {
  const { apiKey, accountId, siteId } = env();
  const headers = { Authorization: apiKey, Accept: 'application/json' };

  if (scope === 'account') {
    if (!accountId) throw new Error(`Account-level call to ${path} needs WIX_ACCOUNT_ID.`);
    headers['wix-account-id'] = accountId;
  } else {
    if (!siteId) throw new Error(`Site-level call to ${path} needs WIX_SITE_ID. Run 01-discover.mjs first.`);
    headers['wix-site-id'] = siteId;
  }
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const url = path.startsWith('http') ? path : `${API}${path}`;
  const res = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  const text = await res.text();
  if (!res.ok) {
    const err = new Error(`${method} ${url} -> ${res.status} ${res.statusText}\n${text.slice(0, 1200)}`);
    err.status = res.status;
    throw err;
  }
  return text ? JSON.parse(text) : {};
}

/**
 * Some Wix endpoints are documented under two different paths (the reference
 * header and the curl example disagree). Try each in order; the first that
 * isn't a 404 wins. Both candidates must come from the official docs.
 */
export async function callFirstAvailable(paths, opts) {
  let lastErr;
  for (const path of paths) {
    try {
      return await call(path, opts);
    } catch (err) {
      lastErr = err;
      if (err.status !== 404) throw err;
    }
  }
  throw lastErr;
}

/** Offset paging (`paging.limit` / `paging.offset`) — Contacts v4, Blog v3. */
export async function pageByOffset(fetchPage, { limit = 100, label = 'items' } = {}) {
  const all = [];
  for (let offset = 0; ; offset += limit) {
    const batch = await fetchPage({ limit, offset });
    if (!batch?.length) break;
    all.push(...batch);
    process.stderr.write(`  ${label}: ${all.length}\r`);
    if (batch.length < limit) break;
  }
  process.stderr.write(`  ${label}: ${all.length}\n`);
  return all;
}

/** Cursor paging (`cursorPaging.cursor`) — Sites v2, Form Submissions v4. */
export async function pageByCursor(fetchPage, { limit = 100, label = 'items' } = {}) {
  const all = [];
  let cursor;
  do {
    const { items, next } = await fetchPage({ limit, cursor });
    if (!items?.length) break;
    all.push(...items);
    process.stderr.write(`  ${label}: ${all.length}\r`);
    cursor = next;
  } while (cursor);
  process.stderr.write(`  ${label}: ${all.length}\n`);
  return all;
}

export async function save(path, data) {
  await mkdir(dirname(path), { recursive: true });
  const body = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  await writeFile(path, body, 'utf8');
  console.log(`  -> ${path}`);
  return path;
}

/** RFC 4180 CSV. Excel opens UTF-8 correctly only with a BOM. */
export function toCsv(rows, columns) {
  const esc = (v) => {
    if (v === null || v === undefined) return '';
    const s = Array.isArray(v) ? v.join('; ') : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [columns.map((c) => esc(c.header)).join(',')];
  for (const row of rows) lines.push(columns.map((c) => esc(c.value(row))).join(','));
  return '﻿' + lines.join('\r\n') + '\r\n';
}

/** Export root: exports/<ISO date>/ so repeat runs never overwrite each other. */
export function outDir(base = 'exports') {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `${base}/${stamp}`;
}
