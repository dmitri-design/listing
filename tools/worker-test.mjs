// Offline unit test of the Worker against a tiny in-memory D1. usage: node tools/worker-test.mjs
import worker from '../worker/index.js';
import { createHash } from 'node:crypto';
const sha = (s) => createHash('sha256').update(s).digest('hex');
// --- tiny in-memory D1 ---
const T = { lists: new Map(), images: new Map(), bookings: [] };
function stmt(sql) {
  return { bind(...a) { return {
    async first() { return exec(sql, a)[0] || null; },
    async all() { return { results: exec(sql, a) }; },
    async run() { const r = exec(sql, a); return { meta: { changes: r.changes ?? r.length } }; },
  }; } };
}
function exec(sql, a) {
  if (sql.startsWith('SELECT doc, updated_at FROM lists')) { const r = T.lists.get(a[0]); return r ? [r] : []; }
  if (sql.startsWith('SELECT doc FROM lists')) { const r = T.lists.get(a[0]); return r ? [{ doc: r.doc }] : []; }
  if (sql.startsWith('SELECT updated_at FROM lists')) { const r = T.lists.get(a[0]); return r ? [{ updated_at: r.updated_at }] : []; }
  if (sql.startsWith('INSERT INTO lists')) {   // upsert; with "WHERE lists.updated_at = ?4" an existing row changes only when ?4 matches
    const r = T.lists.get(a[0]); if (r && /WHERE lists\.updated_at = \?4$/.test(sql) && r.updated_at !== a[3]) return { changes: 0 };
    T.lists.set(a[0], { doc: a[1], updated_at: a[2] }); return { changes: 1 };
  }
  if (sql.startsWith('SELECT type, bytes, updated_at FROM images')) { const r = T.images.get(a[0] + '/' + a[1]); return r ? [r] : []; }
  if (sql.startsWith('INSERT INTO images')) { T.images.set(a[0] + '/' + a[1], { type: a[2], bytes: a[3], size: a[4], updated_at: a[5] }); return { changes: 1 }; }
  if (sql.startsWith('DELETE FROM images')) { const k = a[0] + '/' + a[1]; const had = T.images.delete(k); return { changes: had ? 1 : 0 }; }
  if (sql.startsWith('SELECT item, token_hash FROM bookings')) return T.bookings.filter(b => b.list === a[0] && b.cancelled_at == null).map(b => ({ item: b.item, token_hash: b.token_hash }));
  if (sql.startsWith('SELECT item, name, created_at FROM bookings')) return T.bookings.filter(b => b.list === a[0] && b.cancelled_at == null).map(b => ({ item: b.item, name: b.name, created_at: b.created_at }));
  if (sql.startsWith('SELECT COALESCE')) { const [ip, since, list] = a; const mine = T.bookings.filter(b => b.ip_hash === ip); return [{ recent: mine.filter(b => b.created_at > since).length, active: mine.filter(b => b.cancelled_at == null && b.list === list).length }]; }
  if (sql.startsWith('INSERT INTO bookings')) { const [list, item, name, token_hash, ip_hash, created_at] = a; if (T.bookings.some(b => b.list === list && b.item === item && b.cancelled_at == null)) throw new Error('UNIQUE constraint failed'); T.bookings.push({ list, item, name, token_hash, ip_hash, created_at, cancelled_at: null }); return { changes: 1 }; }
  if (sql.startsWith("UPDATE bookings SET cancelled_at = ?1, cancelled_by = 'guest'")) { const [t, list, item, th] = a; let n = 0; for (const b of T.bookings) if (b.list === list && b.item === item && b.token_hash === th && b.cancelled_at == null) { b.cancelled_at = t; n++; } return { changes: n }; }
  if (sql.startsWith("UPDATE bookings SET cancelled_at = ?1, cancelled_by = 'owner'")) { const [t, list, item] = a; let n = 0; for (const b of T.bookings) if (b.list === list && b.item === item && b.cancelled_at == null) { b.cancelled_at = t; n++; } return { changes: n }; }
  throw new Error('unmocked SQL: ' + sql);
}
const env = { DB: { prepare: stmt }, ALLOWED_ORIGINS: 'https://dmitri-design.github.io', LISTS: JSON.stringify({ dmitri: 'https://static.example/items.json', other: 'https://static.example/other.json' }), ADMIN_TOKEN: 'secret-admin-token-xyz', IP_SALT: 's' };
globalThis.fetch = async (u) => new Response(JSON.stringify({ items: [{ id: 'osprey', status: 'wanted' }, { id: 'mic', status: 'got' }] }), { status: 200 });
const O = 'https://dmitri-design.github.io';
const call = (method, path, { body, headers = {}, origin = O } = {}) => worker.fetch(new Request('https://api.test' + path, { method, headers: { ...(origin ? { Origin: origin } : {}), ...headers }, body }), env);
const j = async (r) => { const t = await r.text(); try { return JSON.parse(t); } catch { return t; } };
let fails = 0; const ok = (c, m) => { console.log((c ? 'ok  ' : 'FAIL') + ' ' + m); if (!c) fails++; };

let r = await call('GET', '/api/health'); ok(r.status === 200, 'health');
r = await call('GET', '/api/lists/dmitri'); ok(r.status === 404, 'doc 404 before seed');
const doc = { updated: '2026-10-30', site: { title: 'x', api: '' }, tiers: [], ui: {}, items: [{ id: 'osprey', status: 'wanted' }, { id: 'mic', status: 'got' }] };   // like data/items.json
r = await call('PUT', '/api/lists/dmitri', { body: JSON.stringify(doc), headers: { 'Content-Type': 'application/json' } }); ok(r.status === 401, 'PUT without token → 401');
r = await call('PUT', '/api/lists/dmitri', { body: JSON.stringify(doc), headers: { 'Content-Type': 'application/json', Authorization: 'Bearer wrong-token-wrong-token' } }); ok(r.status === 401, 'PUT wrong token → 401');
r = await call('PUT', '/api/lists/dmitri', { body: JSON.stringify(doc), headers: { 'Content-Type': 'application/json', Authorization: 'Bearer secret-admin-token-xyz' } }); const put = await j(r); ok(r.status === 200 && put.updated > 0, 'PUT ok (first save goes in whatever its updated) ' + JSON.stringify(put));
r = await call('PUT', '/api/lists/dmitri', { body: JSON.stringify({ ...doc, items: [{ id: 'Bad Id' }] }), headers: { 'Content-Type': 'application/json', Authorization: 'Bearer secret-admin-token-xyz' } }); ok(r.status === 400, 'PUT bad item id → 400');
r = await call('GET', '/api/lists/dmitri'); const got = await j(r); ok(r.status === 200 && got.site.slug === 'dmitri' && got.updated === put.updated, 'GET doc after seed');
r = await call('GET', '/api/lists/dmitri', { origin: null }); ok(r.status === 200, 'GET doc without Origin (curl)');
// optimistic concurrency: a PUT must carry the stored `updated`, else 409 { error: 'stale', updated: <stored> } and nothing changes
const AJ = { 'Content-Type': 'application/json', Authorization: 'Bearer secret-admin-token-xyz' };
const title = async () => (await j(await call('GET', '/api/lists/dmitri'))).site.title;
r = await call('PUT', '/api/lists/dmitri', { body: JSON.stringify(doc), headers: AJ }); let st = await j(r); ok(r.status === 409 && st.error === 'stale' && st.updated === put.updated, 'repo copy again ("2026-10-30") → 409 stale ' + JSON.stringify(st));
r = await call('PUT', '/api/lists/dmitri', { body: JSON.stringify({ ...got, updated: put.updated - 1, site: { ...got.site, title: 'old' } }), headers: AJ }); st = await j(r); ok(r.status === 409 && st.updated === put.updated, 'older base → 409 with the stored updated');
r = await call('PUT', '/api/lists/dmitri', { body: JSON.stringify({ ...got, updated: undefined, site: { ...got.site, title: 'none' } }), headers: AJ }); ok(r.status === 409, 'no updated on an existing list → 409');
ok(await title() === 'x', 'stale PUTs changed nothing');
r = await call('PUT', '/api/lists/dmitri', { body: JSON.stringify({ ...got, site: { ...got.site, title: 'y' } }), headers: AJ }); const put2 = await j(r); ok(r.status === 200 && put2.updated > put.updated, 'matching base → 200 with a newer updated ' + JSON.stringify(put2));
r = await call('GET', '/api/lists/dmitri'); const got2 = await j(r); ok(got2.site.title === 'y' && got2.updated === put2.updated, 'stored doc carries the new updated');
r = await call('PUT', '/api/lists/dmitri', { body: JSON.stringify({ ...got, site: { ...got.site, title: 'z' } }), headers: AJ }); st = await j(r); ok(r.status === 409 && st.updated === put2.updated && await title() === 'y', 'second save from the same old copy → 409, the newer edit survives');
const clock = Date.now; Date.now = () => (put2.updated - 1) * 1000;   // the clock has not passed the stored stamp yet (two saves in one second)
r = await call('PUT', '/api/lists/dmitri', { body: JSON.stringify({ ...got2, site: { ...got2.site, title: 'x' } }), headers: AJ }); const put3 = await j(r); Date.now = clock;
ok(r.status === 200 && put3.updated === put2.updated + 1 && await title() === 'x', 'save within the same second still gets a newer updated');
r = await call('PUT', '/api/lists/other', { body: JSON.stringify({ ...doc, updated: 12345 }), headers: AJ }); ok(r.status === 200, 'first save of another list ignores its updated');
// images
const png = new Uint8Array([137, 80, 78, 71, 1, 2, 3]);
r = await call('POST', '/api/lists/dmitri/images/osprey', { body: png, headers: { 'Content-Type': 'image/png', Authorization: 'Bearer secret-admin-token-xyz' } }); const im = await j(r); ok(r.status === 200 && /\/images\/osprey\?v=\d+$/.test(im.url), 'image upload ' + im.url);
r = await call('POST', '/api/lists/dmitri/images/osprey', { body: png, headers: { 'Content-Type': 'text/plain', Authorization: 'Bearer secret-admin-token-xyz' } }); ok(r.status === 415, 'image wrong type → 415');
r = await call('GET', '/api/lists/dmitri/images/osprey'); ok(r.status === 200 && r.headers.get('content-type') === 'image/png' && (await r.arrayBuffer()).byteLength === 7, 'image served');
r = await call('GET', '/api/lists/dmitri/images/nope'); ok(r.status === 404, 'image 404');
// image bytes go to D1 as base64 TEXT (a BLOB crosses D1's binding as a number array: too much CPU); old BLOB rows still served
const same = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
const big = new Uint8Array(600 * 1024); for (let i = 0; i < big.length; i++) big[i] = (i * 131 + (i >> 9)) & 255;
r = await call('POST', '/api/lists/dmitri/images/big-1', { body: big, headers: { 'Content-Type': 'image/png', Authorization: 'Bearer secret-admin-token-xyz' } }); ok(r.status === 200, 'upload 600 KB');
const row = T.images.get('dmitri/big-1'); ok(typeof row.bytes === 'string' && row.size === big.length, `stored as base64 text (${row.bytes.length} chars)`);
r = await call('GET', '/api/lists/dmitri/images/big-1'); ok(r.status === 200 && same(new Uint8Array(await r.arrayBuffer()), big), '600 KB served byte-exact');
r = await call('POST', '/api/lists/dmitri/images/big-2', { body: new Uint8Array(600 * 1024 + 1), headers: { 'Content-Type': 'image/png', Authorization: 'Bearer secret-admin-token-xyz' } }); ok(r.status === 413 && !T.images.has('dmitri/big-2'), '600 KB + 1 → 413');
T.images.set('dmitri/legacy', { type: 'image/png', bytes: Array.from(png), size: png.length, updated_at: 1 });   // a BLOB row as D1 returns it
r = await call('GET', '/api/lists/dmitri/images/legacy'); ok(r.status === 200 && same(new Uint8Array(await r.arrayBuffer()), png), 'old BLOB row still served');
// bookings
r = await call('POST', '/api/lists/dmitri/items/osprey/book', { body: JSON.stringify({ name: 'Ann' }), headers: { 'Content-Type': 'application/json' } }); const b1 = await j(r); ok(r.status === 201 && b1.token, 'book osprey');
r = await call('POST', '/api/lists/dmitri/items/osprey/book', { body: '{}', headers: { 'Content-Type': 'application/json' } }); ok(r.status === 409, 'second booking → 409');
r = await call('POST', '/api/lists/dmitri/items/mic/book', { body: '{}', headers: { 'Content-Type': 'application/json' } }); ok(r.status === 410, 'got item → 410 (from the D1 doc)');
r = await call('GET', '/api/lists/dmitri/bookings'); const pb = await j(r); ok(JSON.stringify(pb.booked) === '["osprey"]' && pb.k.osprey === sha(b1.token).slice(0, 12) && !JSON.stringify(pb).includes('Ann'), 'public bookings: ids + token-hash prefix, no names');
r = await call('GET', '/api/lists/dmitri/admin/bookings'); ok(r.status === 401, 'admin bookings without token → 401');
r = await call('GET', '/api/lists/dmitri/admin/bookings', { headers: { Authorization: 'Bearer secret-admin-token-xyz' } }); const ab = await j(r); ok(r.status === 200 && ab.bookings[0].name === 'Ann', 'admin bookings with names');
r = await call('GET', '/api/lists/dmitri/admin/ping', { headers: { Authorization: 'Bearer secret-admin-token-xyz' } }); ok(r.status === 204, 'admin ping');
r = await call('DELETE', '/api/lists/dmitri/admin/bookings/osprey', { headers: { Authorization: 'Bearer secret-admin-token-xyz' } }); ok(r.status === 204, 'owner clears booking');
r = await call('GET', '/api/lists/dmitri/bookings'); ok(JSON.stringify(await j(r)) === '{"booked":[],"k":{}}', 'cleared');
r = await call('POST', '/api/lists/dmitri/items/osprey/book', { body: '{}', headers: { 'Content-Type': 'application/json' } }); const b2 = await j(r); ok(r.status === 201, 're-book after clear');
r = await call('DELETE', '/api/lists/dmitri/items/osprey/book', { headers: { Authorization: 'Bearer ' + b2.token } }); ok(r.status === 204, 'guest undo with token');
r = await call('OPTIONS', '/api/lists/dmitri', {}); ok(r.status === 204 && r.headers.get('access-control-allow-methods').includes('PUT'), 'preflight allows PUT');
r = await call('GET', '/api/lists/dmitri', { origin: 'https://evil.example' }); ok(r.status === 200 && !r.headers.get('access-control-allow-origin'), 'foreign origin gets no CORS header');
// a photo the live list shows is never deleted (a save that landed but whose answer was lost)
const cur = await j(await call('GET', '/api/lists/dmitri'));
r = await call('PUT', '/api/lists/dmitri', { body: JSON.stringify({ ...cur, items: cur.items.map(i => i.id === 'osprey' ? { ...i, image: im.url } : i) }), headers: AJ }); const pw = await j(r); ok(r.status === 200, 'list points osprey at the uploaded photo');
r = await call('DELETE', '/api/lists/dmitri/images/osprey', { headers: { Authorization: 'Bearer secret-admin-token-xyz' } }); ok(r.status === 409 && (await j(r)).error === 'in_use' && T.images.has('dmitri/osprey'), 'photo the list shows → 409 in_use, kept');
r = await call('PUT', '/api/lists/dmitri', { body: JSON.stringify({ ...cur, updated: pw.updated }), headers: AJ }); ok(r.status === 200, 'list no longer points at it');
r = await call('DELETE', '/api/lists/dmitri/images/osprey', { headers: { Authorization: 'Bearer secret-admin-token-xyz' } }); ok(r.status === 204 && !T.images.has('dmitri/osprey'), 'image delete');
const envNoAdmin = { ...env, ADMIN_TOKEN: undefined };
r = await worker.fetch(new Request('https://api.test/api/lists/dmitri/admin/ping', { headers: { Authorization: 'Bearer secret-admin-token-xyz' } }), envNoAdmin); ok(r.status === 503, 'admin disabled without secret → 503');
r = await call('POST', '/api/lists/dmitri/admin/translate', { headers: { Authorization: 'Bearer secret-admin-token-xyz', 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'tr', strings: [{ id: 'site.title', text: 'Wishlist' }] }) }); ok(r.status === 503 && (await r.json()).error === 'no_key', 'translate without ANTHROPIC_API_KEY → 503 no_key');
console.log(fails ? `\n${fails} FAILED` : '\nall passed');
process.exit(fails ? 1 : 0);
