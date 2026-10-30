// One-shot deploy of the wishlist API to Cloudflare (run after `npx wrangler login`).
// Creates the D1 database if needed, writes its id into wrangler.jsonc, applies migrations,
// deploys the Worker, sets the IP_SALT and ADMIN_TOKEN secrets once (the admin token is saved to
// admin.token, gitignored — paste it into admin.html on your phone), seeds the list document from
// data/items.json on the first run, writes the API URL into data/items.json → site.api, and smoke-tests the live API.
// Safe to re-run (e.g. to deploy a Worker fix): the live list edited in admin.html stays as it is (only its site.api
// follows a new URL). --reseed replaces it with data/items.json; export the live copy first (admin.html → Export JSON).
// usage: node tools/deploy-api.mjs [--reseed]
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import crypto from 'node:crypto';

const run = (cmd, input) => execSync(cmd, { encoding: 'utf8', input, stdio: ['pipe', 'pipe', 'pipe'], env: { ...process.env, CI: '1' } });
const step = (m) => console.log(`\n▶ ${m}`);

step('Cloudflare login');
let who = '';
try { who = run('npx wrangler whoami 2>&1'); } catch (e) { who = String(e.stdout || e.message); }
if (/not logged in|not authenticated|expired/i.test(who)) { console.error('Not logged in. Run: npx wrangler login'); process.exit(1); }
console.log((who.match(/associated with the email .*|Account Name.*/i) || ['ok'])[0]);

step('D1 database "wishlist"');
const listDbs = () => JSON.parse(run('npx wrangler d1 list --json'));
let db = listDbs().find(d => d.name === 'wishlist');
if (!db) { console.log(run('npx wrangler d1 create wishlist --location weur 2>&1')); db = listDbs().find(d => d.name === 'wishlist'); }
if (!db || !db.uuid) throw new Error('D1 database "wishlist" not found after create');
const cfgPath = 'wrangler.jsonc';
const cfg = fs.readFileSync(cfgPath, 'utf8');
fs.writeFileSync(cfgPath, cfg.replace(/"database_id":\s*"[^"]*"/, `"database_id": "${db.uuid}"`));
console.log('database_id', db.uuid);

step('migrations (remote)');
console.log(run('npx wrangler d1 migrations apply wishlist --remote 2>&1', 'y\n'));

step('deploy Worker');
const out = run('npx wrangler deploy 2>&1');
console.log(out);
const url = (out.match(/https:\/\/[a-z0-9.-]+\.workers\.dev/) || [])[0];
if (!url) { console.error('No workers.dev URL in the deploy output. If it asks for a workers.dev subdomain, set one in the Cloudflare dashboard (Workers & Pages → your subdomain) and re-run.'); process.exit(1); }

step('IP_SALT secret (set once)');
const secrets = run('npx wrangler secret list 2>&1');
if (!secrets.includes('IP_SALT')) { console.log(run('npx wrangler secret put IP_SALT 2>&1', crypto.randomBytes(32).toString('base64url'))); }
else console.log('already set');

step('ADMIN_TOKEN secret (set once; saved to admin.token)');
let adminToken = fs.existsSync('admin.token') ? fs.readFileSync('admin.token', 'utf8').trim() : '';
if (!secrets.includes('ADMIN_TOKEN') || !adminToken) {
  adminToken = adminToken || crypto.randomBytes(24).toString('base64url');
  console.log(run('npx wrangler secret put ADMIN_TOKEN 2>&1', adminToken + '\n'));
  fs.writeFileSync('admin.token', adminToken + '\n', { mode: 0o600 });
  console.log('saved to admin.token — this is the password for admin.html');
} else console.log('already set (admin.token)');

const reseed = process.argv.includes('--reseed');
step(reseed ? 'seed the list document from data/items.json (--reseed: replaces the live list)' : 'seed the list document from data/items.json (first run only)');
const items = JSON.parse(fs.readFileSync('data/items.json', 'utf8'));
items.site.api = url;
const listUrl = `${url}/api/lists/${items.site.slug || 'dmitri'}`;
const down = (e) => ({ ok: false, status: 0, text: async () => String((e && e.cause) || e) });
const put = (doc) => fetch(listUrl, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` }, body: JSON.stringify(doc) }).catch(down);
// The live list is read first and kept unless --reseed. A PUT must carry the stored `updated` (else the Worker answers 409
// and changes nothing). The site.api fix uses the live copy's own `updated`; --reseed uses the file's when it has one
// (an export from admin.html: a phone save after the export → 409, export again), else the live one (overwrite).
// wroteItems: after a 200 the file holds exactly the live content, so it takes the returned `updated` as its own.
let wroteItems = false;
const norm = (x) => JSON.stringify({ ...x, updated: 0, site: { ...x.site, api: 0, slug: 0 } });   // the Worker stamps updated and sets slug
const sameList = (a, b) => norm(a) === norm(b);
async function seedOnce() {
  wroteItems = false;
  const cur = await fetch(listUrl).catch(down);
  if (cur.status === 404) { wroteItems = true; return ['PUT data/items.json', await put(items)]; }   // first run: nothing live yet
  const live = cur.ok ? await cur.json().catch(() => null) : null;
  if (!live || !live.site) return ['GET live list', cur.ok ? { ok: false, status: cur.status, text: async () => 'not a list document' } : cur];
  if (reseed && live.site.api === url && sameList(live, items)) {   // e.g. a retry after a PUT whose answer got lost
    wroteItems = true; return ['live list already matches data/items.json', { ok: true, status: 200, text: async () => JSON.stringify({ updated: live.updated }) }];
  }
  if (reseed) { wroteItems = true; return ['PUT data/items.json over the live list', await put({ ...items, updated: Number.isFinite(items.updated) ? items.updated : live.updated })]; }
  if (live.site.api !== url) {   // the address moved: only site.api changes; a file in step with the live list stays in step
    wroteItems = Number.isFinite(items.updated) && items.updated === live.updated;
    return [`PUT live list with site.api ${live.site.api} → ${url}`, await put({ ...live, site: { ...live.site, api: url } })];
  }
  if (sameList(live, items)) { wroteItems = true; return ['already seeded (file in step)', { ok: true, status: 200, text: async () => JSON.stringify({ updated: live.updated }) }]; }
  return ['already seeded', { ok: true, status: 200, text: async () => 'the live list stays as edited in admin.html (--reseed overwrites it from data/items.json)' }];
}
let what, seeded;
// A secret uploaded seconds ago takes a moment to reach the edge (503 admin_disabled until then), and a brand-new
// workers.dev subdomain has no TLS certificate for a few minutes (fetch throws) — retry both for up to ~5 min.
for (let i = 0; i < 100; i++) {
  [what, seeded] = await seedOnce();
  if (seeded.status !== 503 && seeded.status !== 0) break;
  await new Promise(r => setTimeout(r, 3000));
}
const said = await seeded.text();
console.log(what, '→', seeded.status, said);
if (seeded.status === 409 && reseed) console.error('The live list changed after data/items.json was exported. Export it again in admin.html, then re-run with --reseed.');
if (seeded.ok) {
  if (wroteItems) { try { items.updated = JSON.parse(said).updated; } catch (e) {} }   // the file now matches that live version
  fs.writeFileSync('data/items.json', JSON.stringify(items, null, 2) + '\n');
  console.log('data/items.json → site.api =', url);
}

step('smoke test');
const h = await fetch(`${url}/api/health`).then(r => r.json()).catch(e => ({ error: String(e) }));
const b = await fetch(`${url}/api/lists/dmitri/bookings`).then(r => r.json()).catch(e => ({ error: String(e) }));
const pre = await fetch(`${url}/api/lists/dmitri/items/wilfa/book`, { method: 'OPTIONS', headers: { Origin: 'https://dmitri-design.github.io', 'Access-Control-Request-Method': 'POST' } });
console.log({ health: h, bookings: b, preflight: pre.status, allowOrigin: pre.headers.get('access-control-allow-origin') });
const doc = await fetch(`${url}/api/lists/dmitri`).then(r => r.status).catch(e => String(e));
console.log({ listDoc: doc });
if (!seeded.ok) { console.error(`\nAPI URL: ${url}\nSeeding failed, so data/items.json was left unchanged.${seeded.status === 409 && reseed ? '' : ` Re-run: node tools/deploy-api.mjs${reseed ? ' --reseed' : ''}`}`); process.exit(1); }
console.log(`\nAPI URL: ${url}\nNext: commit + push (data/items.json now carries site.api). Admin: https://dmitri-design.github.io/listing/admin.html — password in admin.token`);
