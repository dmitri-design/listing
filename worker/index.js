// Wishlist API on Cloudflare Workers. The page lives on GitHub Pages; this Worker answers /api/* only.
//
// Guests (no auth):
//   GET    /api/health
//   GET    /api/lists/:list                        → the list document (site, tiers, ui, items) once seeded; 404 before that
//   GET    /api/lists/:list/bookings               → { booked: [itemId, …], k: { itemId: token-hash prefix } }   (no names, ever)
//   POST   /api/lists/:list/items/:item/book       body { name? } → 201 { token } | 409 taken | 410 gone | 429
//   DELETE /api/lists/:list/items/:item/book       Authorization: Bearer <guest token> → 204 | 404
//   GET    /api/lists/:list/images/:id             → the photo bytes (cached a day; the doc appends ?v= to bust it)
//
// Owner (Authorization: Bearer <ADMIN_TOKEN>, a Worker secret; admin.html keeps it in localStorage):
//   GET    /api/lists/:list/admin/ping             → 204 (token check)
//   POST   /api/lists/:list/admin/translate        body { to, strings: [{ id, text }] } → { out: [{ id, text }] } via Claude (secret ANTHROPIC_API_KEY; 503 without it)
//   PUT    /api/lists/:list                        body = whole document → { updated } | 409 { error: 'stale', updated }
//                                                  (body.updated must equal the stored one; the first save always goes in)
//   POST   /api/lists/:list/images/:id             body = image bytes, Content-Type image/webp|jpeg|png → { url, updated }
//   DELETE /api/lists/:list/images/:id             → 204 | 409 in_use (the live list still shows it)
//   GET    /api/lists/:list/admin/bookings         → { bookings: [{ item, name, created_at }] }
//   DELETE /api/lists/:list/admin/bookings/:item   → 204 (owner clears a booking)

const SLUG = /^[a-z0-9](?:[a-z0-9-]{0,30}[a-z0-9])?$/;
const ITEM = /^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/;
const HOUR = 3600;
const MAX_ACTIVE_PER_IP = 5;      // per list
const MAX_PER_IP_HOUR = 10;
const MAX_DOC = 1024 * 1024;      // 1 MB of JSON
const MAX_IMAGE = 600 * 1024;     // admin.html resizes to ≤ 800 px before upload
const IMAGE_TYPES = new Set(['image/webp', 'image/jpeg', 'image/png']);

export default {
  async fetch(req, env) {
    const cors = corsHeaders(req, env);
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...cors, 'Access-Control-Max-Age': '86400' } });
    try {
      const p = new URL(req.url).pathname.split('/').filter(Boolean);
      if (p[0] !== 'api') return out({ error: 'not_found' }, 404, cors);
      if (p[1] === 'health' && p.length === 2) return out({ ok: true }, 200, cors);
      if (p[1] === 'lists' && SLUG.test(p[2] || '')) {
        const list = p[2], src = listSource(env, list);
        if (!src) return out({ error: 'unknown_list' }, 404, cors);
        if (p.length === 3) {
          if (req.method === 'GET') return await getDoc(env, list, cors);
          if (req.method === 'PUT') return await putDoc(req, env, list, cors);
          return out({ error: 'method' }, 405, cors);
        }
        if (p.length === 4 && p[3] === 'bookings' && req.method === 'GET') return out(await activeBookings(env, list), 200, cors);
        if (p.length === 6 && p[3] === 'items' && ITEM.test(p[4]) && p[5] === 'book') {
          if (req.method === 'POST') return await book(req, env, list, p[4], src, cors);
          if (req.method === 'DELETE') return await unbook(req, env, list, p[4], cors);
          return out({ error: 'method' }, 405, cors);
        }
        if (p.length === 5 && p[3] === 'images' && ITEM.test(p[4])) {
          if (req.method === 'GET') return await getImage(env, list, p[4], cors);
          if (req.method === 'POST') return await putImage(req, env, list, p[4], cors);
          if (req.method === 'DELETE') return await deleteImage(req, env, list, p[4], cors);
          return out({ error: 'method' }, 405, cors);
        }
        if (p[3] === 'admin') {
          const auth = await adminOk(req, env); if (auth !== true) return auth(cors);
          if (p.length === 5 && p[4] === 'ping') return new Response(null, { status: 204, headers: { ...cors, 'Cache-Control': 'no-store' } });
          if (p.length === 5 && p[4] === 'translate' && req.method === 'POST') return await translate(req, env, cors);
          if (p.length === 5 && p[4] === 'bookings' && req.method === 'GET') return out(await ownerBookings(env, list), 200, cors);
          if (p.length === 6 && p[4] === 'bookings' && ITEM.test(p[5]) && req.method === 'DELETE') return await ownerUnbook(env, list, p[5], cors);
        }
      }
      return out({ error: 'not_found' }, 404, cors);
    } catch (err) {
      console.error(err && err.stack ? err.stack : String(err));
      return out({ error: 'server' }, 500, cors);
    }
  },
};

/* ---------- the list document ---------- */
async function getDoc(env, list, cors) {
  const row = await env.DB.prepare('SELECT doc, updated_at FROM lists WHERE slug = ?1').bind(list).first();
  if (!row) return out({ error: 'not_seeded' }, 404, cors);
  return new Response(row.doc, { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-cache', ETag: `"${row.updated_at}"`, ...cors } });
}
async function putDoc(req, env, list, cors) {
  const auth = await adminOk(req, env); if (auth !== true) return auth(cors);
  const raw = await req.text();
  if (raw.length > MAX_DOC) return out({ error: 'too_large' }, 413, cors);
  let doc; try { doc = JSON.parse(raw); } catch { return out({ error: 'bad_json' }, 400, cors); }
  if (!doc || typeof doc !== 'object' || !doc.site || !Array.isArray(doc.tiers) || !doc.ui || !Array.isArray(doc.items)) return out({ error: 'bad_shape' }, 400, cors);
  const st = doc.site;   // the page trusts these: a second language code (never 'en'), ISO markets, a currency code, a rate
  if (st.lang2 != null && !(/^[a-z]{2,3}$/.test(st.lang2) && st.lang2 !== 'en')) return out({ error: 'bad_lang2' }, 400, cors);
  if (st.markets != null && !(Array.isArray(st.markets) && st.markets.length <= 6 && st.markets.every(c => /^[A-Z]{2}$/.test(c)))) return out({ error: 'bad_markets' }, 400, cors);
  if (st.currency != null && !/^[A-Z]{3}$/.test(st.currency)) return out({ error: 'bad_currency' }, 400, cors);
  if (st.rate != null && !(Number.isFinite(st.rate) && st.rate > 0)) return out({ error: 'bad_rate' }, 400, cors);
  if (st.about != null && !aboutOk(st.about)) return out({ error: 'bad_about' }, 400, cors);
  const ids = new Set();
  for (const it of doc.items) {
    if (!it || typeof it.id !== 'string' || !ITEM.test(it.id) || ids.has(it.id)) return out({ error: 'bad_item_id', id: it && it.id }, 400, cors);
    ids.add(it.id);
  }
  // Optimistic concurrency: a save must name the version it was edited from (doc.updated), else 409 and nothing changes.
  // The repo copy's "2026-10-30" (or no `updated`) never matches, so it only goes in while there is no row yet.
  const base = Number.isFinite(doc.updated) ? doc.updated : null;
  const now = Math.max(Math.floor(Date.now() / 1000), (base ?? 0) + 1);   // strictly newer: two saves in one second differ
  doc.updated = now;                                     // admin.html sends it back as the base of its next save
  doc.site = { ...doc.site, slug: list };
  const r = await env.DB.prepare('INSERT INTO lists (slug, doc, updated_at) VALUES (?1, ?2, ?3) ON CONFLICT(slug) DO UPDATE SET doc = excluded.doc, updated_at = excluded.updated_at WHERE lists.updated_at = ?4')
    .bind(list, JSON.stringify(doc), now, base).run();
  if (!(r.meta && r.meta.changes > 0)) {
    const cur = await env.DB.prepare('SELECT updated_at FROM lists WHERE slug = ?1').bind(list).first();
    return out({ error: 'stale', updated: cur ? cur.updated_at : null }, 409, cors);
  }
  return out({ updated: now }, 200, cors);
}

/* "About the owner" (site.about): { title, text, photo, links } — texts a string or { en, <lang>: … } ≤ 4000 chars each,
   photo null or a URL string ≤ 300, up to four links { t, u } with an http(s) URL ≤ 500 */
const text = (v, max) => v == null || (typeof v === 'string' && v.length <= max) || (!!v && typeof v === 'object' && !Array.isArray(v) && Object.values(v).every(x => typeof x === 'string' && x.length <= max));
function aboutOk(a) {
  if (!a || typeof a !== 'object' || Array.isArray(a)) return false;
  if (!text(a.title, 4000) || !text(a.text, 4000)) return false;
  if (!(a.photo == null || (typeof a.photo === 'string' && a.photo.length <= 300))) return false;
  if (a.links != null && !(Array.isArray(a.links) && a.links.length <= 4 && a.links.every(l => l && typeof l === 'object' && text(l.t, 4000) && typeof l.u === 'string' && l.u.length <= 500 && /^https?:\/\//i.test(l.u)))) return false;
  return true;
}

/* ---------- images ---------- */
/* Bytes are stored as base64 TEXT. D1's binding ships a BLOB as a JSON array of numbers, which costs ~25 ms of CPU per
   600 KB upload and ~11 ms per read (the free plan allows 10); base64 costs about 2 ms. Rows saved earlier are BLOBs. */
async function getImage(env, list, id, cors) {
  const row = await env.DB.prepare('SELECT type, bytes, updated_at FROM images WHERE list = ?1 AND id = ?2').bind(list, id).first();
  if (!row) return out({ error: 'not_found' }, 404, cors);
  const bytes = typeof row.bytes === 'string' ? fromB64(row.bytes) : new Uint8Array(row.bytes);   // old BLOB rows arrive as number[]
  return new Response(bytes, { status: 200, headers: { 'Content-Type': row.type, 'Cache-Control': 'public, max-age=86400', ETag: `"${row.updated_at}"`, ...cors } });
}
async function putImage(req, env, list, id, cors) {
  const auth = await adminOk(req, env); if (auth !== true) return auth(cors);
  const type = (req.headers.get('Content-Type') || '').split(';')[0].trim().toLowerCase();
  if (!IMAGE_TYPES.has(type)) return out({ error: 'content_type' }, 415, cors);
  const buf = await req.arrayBuffer();
  if (buf.byteLength === 0) return out({ error: 'empty' }, 400, cors);
  if (buf.byteLength > MAX_IMAGE) return out({ error: 'too_large', max: MAX_IMAGE }, 413, cors);
  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare('INSERT INTO images (list, id, type, bytes, size, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6) ON CONFLICT(list, id) DO UPDATE SET type = excluded.type, bytes = excluded.bytes, size = excluded.size, updated_at = excluded.updated_at')
    .bind(list, id, type, toB64(new Uint8Array(buf)), buf.byteLength, now).run();
  const url = new URL(req.url); url.search = `?v=${now}`;
  return out({ url: url.toString(), updated: now, size: buf.byteLength }, 200, cors);
}
/* A photo the live list still shows is never deleted (409): e.g. a save that landed but whose answer the phone never got,
   after which the phone believes the upload is unused. */
async function deleteImage(req, env, list, id, cors) {
  const auth = await adminOk(req, env); if (auth !== true) return auth(cors);
  const row = await env.DB.prepare('SELECT doc FROM lists WHERE slug = ?1').bind(list).first();
  const doc = row ? JSON.parse(row.doc) : null, items = doc ? doc.items : null;
  const key = (u) => (String(u).match(/\/images\/([a-z0-9-]+)(?:[?#]|$)/) || [])[1];
  const walls = ['light', 'dark'].map(s => doc && doc.site && doc.site.bg && doc.site.bg[s] && doc.site.bg[s].src);   // the wall photos count as in use too
  walls.push(doc && doc.site && doc.site.about && doc.site.about.photo);   // and the owner's photo
  if ((Array.isArray(items) && items.some(it => it && typeof it.image === 'string' && key(it.image) === id)) || walls.some(u => typeof u === 'string' && key(u) === id)) return out({ error: 'in_use' }, 409, cors);
  await env.DB.prepare('DELETE FROM images WHERE list = ?1 AND id = ?2').bind(list, id).run();
  return new Response(null, { status: 204, headers: { ...cors, 'Cache-Control': 'no-store' } });
}

/* ---------- bookings ---------- */
/* k: the first 12 hex chars of each booking's token hash, so the booker's phone can tell its own booking from a newer one
   by someone else (owner cleared it, item rebooked). Says nothing about the token itself. */
async function activeBookings(env, list) {
  const { results } = await env.DB.prepare('SELECT item, token_hash FROM bookings WHERE list = ?1 AND cancelled_at IS NULL').bind(list).all();
  return { booked: results.map(r => r.item), k: Object.fromEntries(results.map(r => [r.item, String(r.token_hash).slice(0, 12)])) };
}
async function ownerBookings(env, list) {
  const { results } = await env.DB.prepare('SELECT item, name, created_at FROM bookings WHERE list = ?1 AND cancelled_at IS NULL ORDER BY created_at DESC').bind(list).all();
  return { bookings: results };
}
async function ownerUnbook(env, list, item, cors) {
  const r = await env.DB.prepare("UPDATE bookings SET cancelled_at = ?1, cancelled_by = 'owner' WHERE list = ?2 AND item = ?3 AND cancelled_at IS NULL")
    .bind(Math.floor(Date.now() / 1000), list, item).run();
  if (r.meta && r.meta.changes === 1) return new Response(null, { status: 204, headers: { ...cors, 'Cache-Control': 'no-store' } });
  return out({ error: 'not_found' }, 404, cors);
}

async function book(req, env, list, item, src, cors) {
  if (!originOk(req, env)) return out({ error: 'forbidden' }, 403, cors);
  if (!(req.headers.get('Content-Type') || '').toLowerCase().startsWith('application/json')) return out({ error: 'content_type' }, 415, cors);
  const raw = await req.text();
  if (raw.length > 2000) return out({ error: 'too_large' }, 413, cors);
  let body; try { body = raw ? JSON.parse(raw) : {}; } catch { return out({ error: 'bad_json' }, 400, cors); }
  const name = cleanName(body && body.name);

  const ip = req.headers.get('CF-Connecting-IP') || '0.0.0.0';
  if (env.BOOK_LIMIT) {
    const { success } = await env.BOOK_LIMIT.limit({ key: ip });
    if (!success) return out({ error: 'slow_down' }, 429, cors);
  }

  // The item must exist on the live list and still be wanted.
  const data = await loadList(env, list, src);
  if (!data) return out({ error: 'list_unavailable' }, 503, cors);
  const it = Array.isArray(data.items) ? data.items.find(i => i && i.id === item) : null;
  if (!it) return out({ error: 'unknown_item' }, 404, cors);
  if (it.status === 'got' || it.status === 'dropped') return out({ error: 'gone' }, 410, cors);

  const now = Math.floor(Date.now() / 1000);
  const ipHash = await sha256(ip + '|' + (env.IP_SALT || 'wishlist'));
  const lim = await env.DB.prepare(
    'SELECT COALESCE(SUM(created_at > ?2), 0) AS recent, COALESCE(SUM(cancelled_at IS NULL AND list = ?3), 0) AS active FROM bookings WHERE ip_hash = ?1'
  ).bind(ipHash, now - HOUR, list).first();
  if (lim && (lim.recent >= MAX_PER_IP_HOUR || lim.active >= MAX_ACTIVE_PER_IP)) return out({ error: 'slow_down' }, 429, cors);

  const token = randomToken();
  try {
    await env.DB.prepare('INSERT INTO bookings (list, item, name, token_hash, ip_hash, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)')
      .bind(list, item, name, await sha256(token), ipHash, now).run();
  } catch (e) {
    if (/UNIQUE/i.test(String(e && e.message))) return out({ error: 'taken' }, 409, cors);
    throw e;
  }
  return out({ token }, 201, cors);
}

async function unbook(req, env, list, item, cors) {
  if (!originOk(req, env)) return out({ error: 'forbidden' }, 403, cors);
  const m = (req.headers.get('Authorization') || '').match(/^Bearer ([A-Za-z0-9_-]{20,100})$/);
  if (!m) return out({ error: 'unauthorized' }, 401, cors);
  const r = await env.DB.prepare(
    "UPDATE bookings SET cancelled_at = ?1, cancelled_by = 'guest' WHERE list = ?2 AND item = ?3 AND token_hash = ?4 AND cancelled_at IS NULL"
  ).bind(Math.floor(Date.now() / 1000), list, item, await sha256(m[1])).run();
  if (r.meta && r.meta.changes === 1) return new Response(null, { status: 204, headers: { ...cors, 'Cache-Control': 'no-store' } });
  return out({ error: 'not_found' }, 404, cors);
}

/* The owner asks for the list in another language: every text still missing goes to Claude in one call. Owner-only, needs the
   ANTHROPIC_API_KEY secret; at most 300 texts / 60 KB per call. Brand names, prices, emojis and <i> tags stay as they are. */
const XL_MODEL = 'claude-sonnet-5-5';
async function translate(req, env, cors) {
  if (!env.ANTHROPIC_API_KEY) return out({ error: 'no_key' }, 503, cors);
  if (!(req.headers.get('Content-Type') || '').toLowerCase().startsWith('application/json')) return out({ error: 'content_type' }, 415, cors);
  const raw = await req.text(); if (raw.length > 60000) return out({ error: 'too_large' }, 413, cors);
  let body; try { body = JSON.parse(raw); } catch { return out({ error: 'bad_json' }, 400, cors); }
  const to = String(body && body.to || '').toLowerCase();
  if (!/^[a-z]{2,3}$/.test(to) || to === 'en') return out({ error: 'bad_lang' }, 400, cors);
  const strings = (Array.isArray(body.strings) ? body.strings : []).filter(s => s && typeof s.id === 'string' && /^[\w.-]{1,80}$/.test(s.id) && typeof s.text === 'string' && s.text.trim()).slice(0, 300).map(s => ({ id: s.id, text: s.text.slice(0, 2000) }));
  if (!strings.length) return out({ out: [] }, 200, cors);
  const prompt = `You translate the texts of a personal gift wishlist web page that someone shares with friends. Target language code: "${to}". ` +
    `Tone: informal, warm, natural for a native speaker, concise (the texts sit on small cards). Keep brand and product names, model numbers, prices, ` +
    `currency symbols, emojis, the character ✓ and any HTML tags such as <i>…</i> exactly as they are. Translate only the words. ` +
    `Reply with ONLY a JSON array of objects {"id": …, "text": …}, same ids, same order, nothing else.\n\n` + JSON.stringify(strings);
  let r;
  try {
    r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: XL_MODEL, max_tokens: 8000, messages: [{ role: 'user', content: prompt }] }) });
  } catch (e) { return out({ error: 'upstream' }, 502, cors); }
  if (!r.ok) { console.error('translate upstream', r.status, (await r.text().catch(() => '')).slice(0, 300)); return out({ error: 'upstream', status: r.status }, 502, cors); }
  const j = await r.json().catch(() => null);
  const text = ((j && j.content) || []).map(c => c && c.text || '').join('');
  const m = text.match(/\[[\s\S]*\]/); let arr;
  try { arr = JSON.parse(m ? m[0] : '[]'); } catch { return out({ error: 'bad_output' }, 502, cors); }
  const ids = new Set(strings.map(s => s.id));
  return out({ out: (Array.isArray(arr) ? arr : []).filter(x => x && ids.has(x.id) && typeof x.text === 'string').map(x => ({ id: x.id, text: x.text.slice(0, 2000) })) }, 200, cors);
}

/* ---------- helpers ---------- */
/* Owner auth: returns true, or a function (cors) → error Response. Constant-time compare on SHA-256 digests. */
async function adminOk(req, env) {
  if (!env.ADMIN_TOKEN) return (cors) => out({ error: 'admin_disabled' }, 503, cors);
  if (!originOk(req, env)) return (cors) => out({ error: 'forbidden' }, 403, cors);
  const m = (req.headers.get('Authorization') || '').match(/^Bearer (\S{16,200})$/);
  if (!m) return (cors) => out({ error: 'unauthorized' }, 401, cors);
  const a = await sha256(m[1]), b = await sha256(String(env.ADMIN_TOKEN));
  let diff = 0; for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0 ? true : (cors) => out({ error: 'unauthorized' }, 401, cors);
}
function allowedOrigins(env) { return String(env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean); }
function originOk(req, env) { const o = req.headers.get('Origin'); return !o || allowedOrigins(env).includes(o); }
function corsHeaders(req, env) {
  const o = req.headers.get('Origin'), h = { Vary: 'Origin' };
  if (o && allowedOrigins(env).includes(o)) {
    h['Access-Control-Allow-Origin'] = o;
    h['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    h['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
  }
  return h;
}
function listSource(env, list) {
  try { const map = typeof env.LISTS === 'string' ? JSON.parse(env.LISTS) : (env.LISTS || {}); return typeof map[list] === 'string' ? map[list] : null; }
  catch { return null; }
}
/* The live document from D1 if the owner has saved one, else the repo JSON on GitHub Pages (edge-cached 30 s). */
async function loadList(env, list, src) {
  try {
    const row = await env.DB.prepare('SELECT doc FROM lists WHERE slug = ?1').bind(list).first();
    if (row) return JSON.parse(row.doc);
  } catch { /* fall through to the static copy */ }
  try {
    const r = await fetch(src, { cf: { cacheTtl: 30, cacheEverything: true } });
    return r.ok ? await r.json() : null;
  } catch { return null; }
}
function cleanName(v) {
  if (typeof v !== 'string') return null;
  const s = v.replace(/[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/gu, '').replace(/\s+/g, ' ').trim();
  const cut = Array.from(s).slice(0, 40).join('');
  return cut || null;
}
async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}
function randomToken() {
  const b = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
/* workerd has Uint8Array.prototype.toBase64 / Uint8Array.fromBase64; the loops are for Node (tools/worker-test.mjs). */
function toB64(u8) {
  if (u8.toBase64) return u8.toBase64();
  let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
  return btoa(s);
}
function fromB64(s) {
  if (Uint8Array.fromBase64) return Uint8Array.fromBase64(s);
  const b = atob(s), u8 = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u8[i] = b.charCodeAt(i);
  return u8;
}
function out(body, status, cors) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...cors } });
}
