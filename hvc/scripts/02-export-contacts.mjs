#!/usr/bin/env node
/**
 * Step 2 — export every contact, in full.
 *
 * Uses Contacts v4 List Contacts with `fieldsets=FULL`, which returns up to
 * 1000 per request and includes labels, extended fields and subscription
 * status. Writes raw JSON (the authoritative copy) plus a flattened CSV for
 * anyone who wants to open it in Excel.
 *
 * Docs:
 *   List Contacts          https://dev.wix.com/docs/api-reference/crm/members-contacts/contacts/contacts/contact-v4/list-contacts
 *   Query Extended Fields  https://dev.wix.com/docs/api-reference/crm/members-contacts/contacts/extended-fields/query-extended-fields
 *
 * NOTE: the output is personal data (GDPR). It lands in exports/, which is
 * gitignored on purpose. Keep it out of version control and off shared drives.
 */

import { call, pageByOffset, save, toCsv, outDir } from './lib/wix.mjs';

const dir = process.env.HVC_OUT_DIR || outDir();
const PAGE = 1000; // documented maximum for List Contacts

console.log('Contacten exporteren...');
const contacts = await pageByOffset(
  async ({ limit, offset }) => {
    const res = await call(
      `/contacts/v4/contacts?paging.limit=${limit}&paging.offset=${offset}&fieldsets=FULL`,
    );
    return res.contacts ?? [];
  },
  { limit: PAGE, label: 'contacten' },
);

await save(`${dir}/01-contacts.json`, contacts);

// Extended fields describe the custom columns on the contact records, so the
// CSV headers stay meaningful after the site is gone.
let extendedFields = [];
try {
  const res = await call('/contacts/v4/extended-fields/query', { method: 'POST', body: { query: {} } });
  extendedFields = res.fields ?? [];
  await save(`${dir}/01-contacts-extended-fields.json`, extendedFields);
} catch (err) {
  console.error(`  extended fields overgeslagen: ${err.message.split('\n')[0]}`);
}

const fieldLabel = new Map(extendedFields.map((f) => [f.key, f.displayName || f.key]));
const customKeys = [
  ...new Set(contacts.flatMap((c) => Object.keys(c.info?.extendedFields ?? {}))),
].sort();

const columns = [
  { header: 'id', value: (c) => c.id },
  { header: 'voornaam', value: (c) => c.info?.name?.first },
  { header: 'achternaam', value: (c) => c.info?.name?.last },
  { header: 'email', value: (c) => c.primaryInfo?.email },
  { header: 'alle_emails', value: (c) => (c.info?.emails?.items ?? []).map((e) => e.email) },
  { header: 'telefoon', value: (c) => c.primaryInfo?.phone },
  { header: 'alle_telefoons', value: (c) => (c.info?.phones?.items ?? []).map((p) => p.e164Phone || p.phone) },
  {
    header: 'adres',
    value: (c) =>
      (c.info?.addresses?.items ?? [])
        .map((a) => {
          const ad = a.address ?? {};
          return [ad.streetAddress?.name, ad.streetAddress?.number, ad.postalCode, ad.city, ad.country]
            .filter(Boolean)
            .join(' ');
        })
        .filter(Boolean),
  },
  { header: 'bedrijf', value: (c) => c.info?.company },
  { header: 'functie', value: (c) => c.info?.jobTitle },
  { header: 'labels', value: (c) => c.info?.labelKeys?.items ?? c.info?.labelKeys ?? [] },
  { header: 'email_abonnement', value: (c) => c.info?.emailSubscription?.subscriptionStatus },
  { header: 'aangemaakt', value: (c) => c.createdDate },
  { header: 'gewijzigd', value: (c) => c.updatedDate },
  { header: 'laatste_activiteit', value: (c) => c.lastActivity?.activityDate },
  ...customKeys.map((key) => ({
    header: fieldLabel.get(key) || key,
    value: (c) => {
      const v = c.info?.extendedFields?.[key];
      return v && typeof v === 'object' ? JSON.stringify(v) : v;
    },
  })),
];

await save(`${dir}/01-contacts.csv`, toCsv(contacts, columns));

const withEmail = contacts.filter((c) => c.primaryInfo?.email).length;
const withPhone = contacts.filter((c) => c.primaryInfo?.phone).length;
console.log(
  `\n${contacts.length} contacten — ${withEmail} met e-mail, ${withPhone} met telefoon, ` +
    `${customKeys.length} extra velden.`,
);
