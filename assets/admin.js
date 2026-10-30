/* Wishlist admin. Talks to the Worker (worker/index.js) with the owner token; the whole list document is
   loaded once, edited in memory, and saved back with one PUT. Nothing here is content. */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const enOf = (v) => (v && typeof v === 'object' ? v.en : v) ?? '';
  const ruOf = (v) => (v && typeof v === 'object' ? v.ru : '') ?? '';
  /* EN + optional RU input → a plain string unless RU differs; an untouched value keeps its exact shape */
  const bi = (en, ru, old) => old && typeof old === 'object' && old.en === en && (old.ru ?? '') === ru ? old : ru && ru !== en ? { en, ru } : en;
  const LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  const snd = (role, voice) => { if (window.Sound) window.Sound.play(role, voice || 'signature'); };

  let API = '', LIST = 'dmitri', TOKEN = '', DOC = null, STATIC = null, BOOKINGS = [];
  const tokKey = () => `wl-admin:${LIST}`;
  const authHeaders = (extra) => ({ Authorization: `Bearer ${TOKEN}`, ...(extra || {}) });
  const forget = () => { TOKEN = ''; try { localStorage.removeItem(tokKey()); } catch (e) {} };

  /* ---------- boot ---------- */
  async function boot() {
    try {
      const r = await fetch('data/items.json', { cache: 'no-cache' }); STATIC = await r.json();
    } catch (e) { toast('Could not read data/items.json', true); return; }
    LIST = (STATIC.site && STATIC.site.slug) || 'dmitri';
    API = String((LOCAL && new URLSearchParams(location.search).get('api')) || STATIC.site.api || '').replace(/\/+$/, '');
    if (!API) { show('noapi'); return; }
    try { TOKEN = localStorage.getItem(tokKey()) || ''; } catch (e) {}
    if (!TOKEN) { show('login'); return; }
    await enter();
  }
  function show(id) {
    for (const s of ['login', 'noapi', 'seed', 'app']) $('#' + s).hidden = s !== id;
    $('#fab').hidden = id !== 'app';
  }
  function loginErr(msg) { const e = $('#loginErr'); e.textContent = msg; e.hidden = false; }
  /* → true once the list is on screen. Only a 401 forgets the password: offline, blocked or down keeps it and offers a retry. */
  async function enter() {
    const ping = await fetch(`${API}/api/lists/${LIST}/admin/ping`, { headers: authHeaders() }).catch(() => null);
    if (ping && ping.status === 401) { forget(); show('login'); loginErr('That password is not right.'); return false; }
    if (ping && ping.status === 503) { show('noapi'); $('#noapi .lead').textContent = 'The API has no admin password set yet.'; return false; }
    const r = ping && await fetch(`${API}/api/lists/${LIST}`, { cache: 'no-store' }).catch(() => null);
    if (r && r.status === 404) { show('seed'); return false; }
    const doc = r && r.ok ? await r.json().catch(() => null) : null;   // a body cut off mid-download counts as offline
    if (!doc) {
      if (!$('#app').hidden) toast("Can't reach the API. Try again in a moment.", true);
      else { show('login'); $('#tokenIn').value = TOKEN; loginErr("Can't reach the API. Check the connection, then tap Sign in."); }
      return false;
    }
    const prev = DOC; DOC = doc;   // DOC.updated = the Worker's version; every PUT sends it back
    show('app'); renderAll(prev); loadBookings(); return true;
  }
  $('#loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    TOKEN = $('#tokenIn').value.trim(); if (!TOKEN) return;
    $('#loginBtn').disabled = true; $('#loginErr').hidden = true;
    try { localStorage.setItem(tokKey(), TOKEN); } catch (x) {}
    let ok = false;
    try { ok = await enter(); } finally { $('#loginBtn').disabled = false; }
    if (ok) { $('#tokenIn').value = ''; snd('ui.confirm'); }
  });
  $('#seedBtn').addEventListener('click', async () => {
    $('#seedBtn').disabled = true;
    const doc = JSON.parse(JSON.stringify(STATIC)); doc.site.api = API;
    const ok = await save(doc, 'Seeded');
    $('#seedBtn').disabled = false;
    if (ok) { show('app'); renderAll(); loadBookings(); } else enter();   // re-check: seeded meanwhile (409), password, connection
  });
  $('#logoutBtn').addEventListener('click', () => { forget(); DOC = null; $('#tokenIn').value = ''; $('#loginErr').hidden = true; show('login'); });
  $('#reloadBtn').addEventListener('click', () => enter());
  $('#exportBtn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(DOC, null, 2) + '\n'], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'items.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });

  /* ---------- save ---------- */
  /* The body carries DOC.updated; the Worker answers 409 when the list changed since (another device), so one PUT at a time. */
  let saving = false;
  async function save(doc, msg) {
    if (saving) { toast('Still saving…'); return false; }
    saving = true;
    const r = await fetch(`${API}/api/lists/${LIST}`, { method: 'PUT', headers: authHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify(doc), signal: giveUp(30000) }).catch(() => null);
    const j = r && r.ok ? await r.json().catch(() => null) : null;
    saving = false;
    if (j) { const was = imgKeys(DOC); doc.updated = j.updated; DOC = doc; toast(msg || 'Saved'); snd('ui.confirm'); dropImages(was); return true; }
    const why = !r ? 'No connection' : r.status === 409 ? 'Changed on another device. Tap Reload.' : r.status === 401 ? 'Password rejected' : r.status === 413 ? 'Too big' : 'Save failed (' + r.status + ')';
    toast(why, true); snd('state.error'); return false;
  }
  /* a stalled request must end (else `saving` never clears); one that landed anyway shows up as a 409 on the next save */
  const giveUp = (ms) => (AbortSignal.timeout ? AbortSignal.timeout(ms) : undefined);
  /* Photos uploaded to the Worker: once a save lands, the ones the list no longer points at go (replaced, removed, item deleted). */
  const imgBase = () => `${API}/api/lists/${LIST}/images/`;
  const imgKeys = (d) => new Set(((d && d.items) || []).map(i => typeof i.image === 'string' && i.image.startsWith(imgBase()) ? i.image.slice(imgBase().length).split(/[?#]/)[0] : '').filter(k => /^[a-z0-9-]{1,40}$/.test(k)));
  function dropImages(was) { const now = imgKeys(DOC); for (const k of was) if (!now.has(k)) fetch(imgBase() + k, { method: 'DELETE', headers: authHeaders() }).catch(() => {}); }

  /* ---------- views ---------- */
  $$('.seg [role="tab"]').forEach(b => b.addEventListener('click', () => {
    $$('.seg [role="tab"]').forEach(x => x.setAttribute('aria-selected', x === b ? 'true' : 'false'));
    $$('.view').forEach(v => { v.hidden = v.id !== 'view-' + b.dataset.view; });
    $('#fab').hidden = b.dataset.view !== 'items';
    snd('toggle.on');
  }));
  function renderAll(prev) { renderItems(); renderTexts(prev); }
  const tierOf = (id) => DOC.tiers.find(t => t.id === id) || DOC.tiers[0];
  const sorted = () => DOC.items.slice().sort((a, b) => (a.order || 0) - (b.order || 0));
  function thumb(it) {
    if (it.image) return `<div class="thumb${it.kind === 'photo' ? ' photo' : ''}"><img src="${esc(it.image)}" alt="" loading="lazy"></div>`;
    return `<div class="thumb"><svg viewBox="0 0 24 24" fill="none" stroke="#b9b2a4" stroke-width="1.5"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 16l5-5 4 4 3-3 6 6"/><circle cx="16" cy="9" r="1.6"/></svg></div>`;
  }
  function renderItems() {
    const booked = new Set(BOOKINGS.map(b => b.item));
    const html = DOC.tiers.map(tier => {
      const items = sorted().filter(i => i.tier === tier.id);
      return `<section class="tiergroup"><h2><span class="dot" style="--c:${esc(tier.c)}"></span>${esc(tier.name.en)}<small>${items.length}</small></h2>
        <ul class="list">${items.map(it => `<li><button type="button" class="row" data-id="${esc(it.id)}">${thumb(it)}
          <span class="rtext"><span class="rname${it.status === 'got' ? ' got' : ''}">${esc(it.name.en)}</span>
          <span class="rsub">${esc(enOf(it.price))}${it.status === 'got' ? ' <span class="pill got">got it</span>' : ''}${it.status === 'dropped' ? ' <span class="pill dropped">hidden</span>' : ''}${booked.has(it.id) ? ' <span class="pill booked">booked</span>' : ''}</span></span>
          <span class="chev" aria-hidden="true">›</span></button></li>`).join('') || '<li class="empty">Nothing here yet</li>'}</ul></section>`;
    }).join('');
    $('#view-items').innerHTML = html;
  }
  $('#view-items').addEventListener('click', (e) => { const b = e.target.closest('.row'); if (b) openEditor(b.dataset.id); });
  $('#addBtn').addEventListener('click', () => openEditor(null));

  /* ---------- bookings ---------- */
  async function loadBookings() {
    try {
      const r = await fetch(`${API}/api/lists/${LIST}/admin/bookings`, { headers: authHeaders(), cache: 'no-store' });
      BOOKINGS = r.ok ? ((await r.json()).bookings || []) : [];
    } catch (e) { BOOKINGS = []; }
    renderBookings(); renderItems();
  }
  let hideNames = true; try { hideNames = localStorage.getItem('wl-admin-hide') !== '0'; } catch (e) {}
  $('#hideNames').checked = hideNames;
  $('#hideNames').addEventListener('change', (e) => { hideNames = e.target.checked; try { localStorage.setItem('wl-admin-hide', hideNames ? '1' : '0'); } catch (x) {} renderBookings(); snd(hideNames ? 'toggle.on' : 'toggle.off'); });
  function renderBookings() {
    const c = $('#bkCount'); c.hidden = !BOOKINGS.length; c.textContent = BOOKINGS.length;
    const fmt = (s) => new Date(s * 1000).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
    $('#bkList').innerHTML = BOOKINGS.map(b => {
      const it = DOC.items.find(i => i.id === b.item);
      return `<li class="bkrow"><span class="rtext"><span class="rname">${esc(it ? it.name.en : b.item)}</span><span class="rsub">${hideNames ? '•••' : esc(b.name || 'no name')} · ${fmt(b.created_at)}</span></span><button type="button" class="btn ghost sm danger" data-clear="${esc(b.item)}">Clear</button></li>`;
    }).join('') || '<li class="empty">No bookings yet. Share the link.</li>';
  }
  $('#bkList').addEventListener('click', async (e) => {
    const b = e.target.closest('[data-clear]'); if (!b) return;
    if (!b.dataset.sure) { b.dataset.sure = '1'; b.textContent = 'Tap again to clear'; setTimeout(() => { delete b.dataset.sure; b.textContent = 'Clear'; }, 3500); return; }
    b.disabled = true;
    const r = await fetch(`${API}/api/lists/${LIST}/admin/bookings/${encodeURIComponent(b.dataset.clear)}`, { method: 'DELETE', headers: authHeaders() }).catch(() => null);
    if (r && (r.status === 204 || r.status === 404)) { toast('Booking cleared'); snd('ui.confirm'); } else { toast('Could not clear', true); snd('state.error'); }
    loadBookings();
  });

  /* ---------- texts ---------- */
  const TEXT_FIELDS = ['title', 'brand', 'tagline', 'footer'];
  const UI_FIELDS = ['gotNote', 'gotSign'];   // the handwritten thank-you on "got it" cards
  /* prev = the list on screen before a Reload: a field the owner has typed into since keeps the typed text */
  function renderTexts(prev) {
    const f = $('#textsForm');
    const set = (el, was, now) => { if (el && (!prev || el.value.trim() === String(was || '').trim())) el.value = now || ''; };
    for (const k of TEXT_FIELDS) for (const l of ['en', 'ru']) set(f.elements[`${k}.${l}`], prev && prev.site[k] && prev.site[k][l], DOC.site[k] && DOC.site[k][l]);
    for (const k of UI_FIELDS) for (const l of ['en', 'ru']) set(f.elements[`ui.${k}.${l}`], prev && prev.ui[k] && prev.ui[k][l], DOC.ui[k] && DOC.ui[k][l]);
  }
  $('#textsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const doc = JSON.parse(JSON.stringify(DOC)), f = e.target;
    for (const k of TEXT_FIELDS) doc.site[k] = { en: f.elements[`${k}.en`].value.trim(), ru: f.elements[`${k}.ru`].value.trim() };
    for (const k of UI_FIELDS) doc.ui[k] = { en: f.elements[`ui.${k}.en`].value.trim(), ru: f.elements[`ui.${k}.ru`].value.trim() };
    if (await save(doc, 'Texts saved')) renderTexts(doc);   // saved fields show trimmed; typing since the tap stays
  });

  /* ---------- editor ---------- */
  const ed = $('#editor'), form = $('#editForm');
  let cur = null, isNew = false, pendingImage = null;   // pendingImage: { blob, type, w, h, url, alpha, src = Worker URL once uploaded }
  function openEditor(id) {
    if (saving) { toast('Still saving…'); return; }   // an editor opened now would show the list from before that save lands
    $('.sheet-body', ed).inert = false;
    isNew = !id;
    cur = isNew ? { id: '', tier: DOC.tiers[0].id, name: { en: '', ru: '' }, desc: { en: '', ru: '' }, price: '', note: { en: '', ru: '' }, avail: { eu: 'y', tr: 'g', ru: 'g' }, where: [], status: 'wanted', kind: 'photo', image: null, illustration: null, order: 0 }
                : JSON.parse(JSON.stringify(DOC.items.find(i => i.id === id)));
    pendingImage = null;
    $('#edTitle').textContent = isNew ? 'New item' : 'Edit item';
    const v = (k, val) => { form.elements[k].value = val ?? ''; };
    v('name.en', cur.name.en); v('name.ru', cur.name.ru); v('desc.en', cur.desc.en); v('desc.ru', cur.desc.ru);
    v('price.en', enOf(cur.price)); v('price.ru', ruOf(cur.price)); v('id', cur.id);
    v('note.en', cur.note && cur.note.en); v('note.ru', cur.note && cur.note.ru);
    form.elements.id.readOnly = !isNew;
    $('#tierSeg').innerHTML = DOC.tiers.map(t => `<button type="button" data-v="${esc(t.id)}">${esc(t.short ? t.short.en : t.name.en)}</button>`).join('');
    seg('#tierSeg', cur.tier); seg('#statusSeg', cur.status || 'wanted'); seg('#kindSeg', cur.kind || 'photo');
    for (const k of ['eu', 'tr', 'ru']) seg(`[data-av="${k}"]`, (cur.avail && cur.avail[k]) || 'n');
    renderWhere(); renderPhoto();
    $('#orderFld').hidden = isNew; $('#deleteFld').hidden = isNew;
    const err = $('#edErr'); err.hidden = true;
    ed.showModal(); $('.sheet-body', ed).scrollTop = 0;
  }
  function seg(sel, val) { $$(sel + ' button').forEach(b => b.classList.toggle('on', b.dataset.v === val)); }
  const segVal = (sel) => { const b = $(sel + ' button.on'); return b ? b.dataset.v : null; };
  ed.addEventListener('click', (e) => {
    const b = e.target.closest('.segsm button'); if (!b) return;
    $$('button', b.parentElement).forEach(x => x.classList.toggle('on', x === b));
    if (b.parentElement.id === 'kindSeg') renderPhoto();
    snd('toggle.on');
  });
  function renderWhere() {
    $('#whereRows').innerHTML = (cur.where || []).map((w, i) => `<div class="wrow"><input type="text" placeholder="shop" aria-label="Shop · EN" value="${esc(enOf(w.t))}" data-wl="${i}"><input type="text" lang="ru" placeholder="· RU, if different" aria-label="Shop · RU" value="${esc(ruOf(w.t))}" data-wr="${i}"><input type="url" inputmode="url" placeholder="https://…" aria-label="Link" value="${esc(w.u || '')}" data-wu="${i}" autocapitalize="none"><button type="button" class="btn ghost sm" data-wx="${i}" aria-label="Remove link">✕</button></div>`).join('');
  }
  /* rows → [{ t, u? }]; a pasted link without a shop name keeps its row, labelled by its site */
  function readWhere() {
    return $$('#whereRows .wrow').map(r => {
      const old = (cur.where || [])[+$('[data-wl]', r).dataset.wl] || {}, tr = $('[data-wr]', r).value.trim(), u = $('[data-wu]', r).value.trim();
      let t = $('[data-wl]', r).value.trim() || tr;
      if (!t && u) { try { t = new URL(u).hostname.replace(/^www\./, ''); } catch (e) {} t = t || u; }
      if (!t) return null;
      t = bi(t, tr, old.t);
      return u ? { t, u } : { t };
    }).filter(Boolean);
  }
  $('#whereAdd').addEventListener('click', () => { cur.where = readWhere(); cur.where.push({ t: '', u: '' }); renderWhere(); const last = $$('#whereRows [data-wl]').pop(); if (last) last.focus(); });
  $('#whereRows').addEventListener('click', (e) => { const b = e.target.closest('[data-wx]'); if (!b) return; b.closest('.wrow').remove(); cur.where = readWhere(); renderWhere(); });
  function renderPhoto() {
    const box = $('#photoBox'), kind = segVal('#kindSeg') || 'photo';
    box.className = 'photo-box' + (kind === 'photo' ? ' photo' : '');
    if (pendingImage) box.innerHTML = `<img src="${pendingImage.url}" alt="">`;
    else if (cur.image) box.innerHTML = `<img src="${esc(cur.image)}" alt="">`;
    else box.innerHTML = cur.illustration ? `<span>sketch: ${esc(cur.illustration)}</span>` : '<span>No photo</span>';
  }
  $('#photoIn').addEventListener('change', async (e) => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    try {
      pendingImage = await shrink(f);
      seg('#kindSeg', pendingImage.alpha ? 'cut' : 'photo');   // only real transparency makes a cut-out
      renderPhoto(); toast(`Photo ready · ${Math.round(pendingImage.blob.size / 1024)} KB`);
    } catch (x) { toast('Could not read that photo', true); }
    e.target.value = '';
  });
  $('#photoRemove').addEventListener('click', () => { pendingImage = null; cur.image = null; renderPhoto(); });
  /* resize on the phone so every upload fits the Worker's 600 KB: longest side ≤ 800 px, WebP when the browser can encode it
     (Safari can't), else JPEG; only real transparency stays PNG. Still too big → step the size down until it fits. */
  const UP_MAX = 560 * 1024;
  async function shrink(file) {
    const url = URL.createObjectURL(file);
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; }).finally(() => URL.revokeObjectURL(url));
    const c = document.createElement('canvas'), g = c.getContext('2d');
    const draw = (max) => { const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight)); c.width = Math.max(1, Math.round(img.naturalWidth * s)); c.height = Math.max(1, Math.round(img.naturalHeight * s)); g.drawImage(img, 0, 0, c.width, c.height); };
    draw(800);
    const px = g.getImageData(0, 0, c.width, c.height).data;
    let alpha = false; for (let i = 3; i < px.length && !alpha; i += 4) alpha = px[i] < 255;
    let type = 'image/webp', q = .82, blob = await new Promise(res => c.toBlob(res, type, q));
    if (!blob || blob.type !== type) { type = alpha ? 'image/png' : 'image/jpeg'; q = .86; blob = await new Promise(res => c.toBlob(res, type, q)); }
    for (let max = Math.round(Math.max(c.width, c.height) * .8); blob && blob.size > UP_MAX && max >= 160; max = Math.round(max * .8)) {
      draw(max); blob = await new Promise(res => c.toBlob(res, type, q));
    }
    if (!blob || blob.size > UP_MAX) throw new Error('too big');
    return { blob, type: blob.type, w: c.width, h: c.height, alpha, url: URL.createObjectURL(blob) };
  }
  /* item id from a name: Cyrillic transliterated, ≤ 36 chars so a '-2' suffix still fits the Worker's 40 */
  const CYR = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya', ı: 'i' };
  const slug = (s) => [...String(s || '').toLowerCase()].map(ch => CYR[ch] ?? ch).join('').normalize('NFKD').toLowerCase().replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').slice(0, 36).replace(/^-+|-+$/g, '');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (saving) { toast('Still saving…'); return; }
    const pi = pendingImage, nu = isNew, session = cur;   // this editor session: Cancel + another item during the upload must not leak into it
    const err = $('#edErr'); err.hidden = true;
    const fail = (msg) => { err.textContent = msg; err.hidden = false; toast(msg, true); snd('state.error'); };
    const name = { en: form.elements['name.en'].value.trim(), ru: form.elements['name.ru'].value.trim() };
    if (!name.en) { fail('Give it a name (EN).'); return; }
    const doc = JSON.parse(JSON.stringify(DOC));
    let id = cur.id;
    if (nu) {   // always a valid id for the Worker: typed id, else the name, else item-<time>
      const base = slug(form.elements.id.value) || slug(name.en) || slug(name.ru) || 'item-' + Date.now().toString(36);
      id = base; for (let n = 2; doc.items.some(i => i.id === id); n++) id = `${base}-${n}`;
    }
    const it = nu ? { id } : doc.items.find(i => i.id === id);
    it.name = name; it.name.ru = it.name.ru || it.name.en;
    it.desc = { en: form.elements['desc.en'].value.trim(), ru: form.elements['desc.ru'].value.trim() || form.elements['desc.en'].value.trim() };
    const pe = form.elements['price.en'].value.trim(), pr = form.elements['price.ru'].value.trim();
    it.price = bi(pe || pr, pr, cur.price);
    const ne = form.elements['note.en'].value.trim(), nr = form.elements['note.ru'].value.trim();
    it.note = { en: ne, ru: nr || ne };
    it.tier = segVal('#tierSeg') || doc.tiers[0].id;
    it.status = segVal('#statusSeg') || 'wanted';
    it.kind = segVal('#kindSeg') || 'photo';
    it.avail = { eu: segVal('[data-av="eu"]') || 'n', tr: segVal('[data-av="tr"]') || 'n', ru: segVal('[data-av="ru"]') || 'n' };
    it.where = readWhere();
    if (pi) {
      if (!pi.src) {   // a fresh id per upload: the live photo stays as it is until the saved list points elsewhere
        const key = `${id.slice(0, 31).replace(/-+$/, '')}-${Date.now().toString(36)}`;
        saving = true;   // Move / Delete / a second Save wait for the upload too (else they'd race this save's base)
        const body = $('.sheet-body', ed); body.inert = true;   // the save uses what was there at the tap: no edits mid-upload (Cancel still works)
        $('#edSave').disabled = true; $('#edSave').textContent = 'Uploading…';
        const r = await fetch(`${API}/api/lists/${LIST}/images/${key}`, { method: 'POST', headers: authHeaders({ 'Content-Type': pi.type }), body: pi.blob, signal: giveUp(60000) }).catch(() => null);
        const j = r && r.ok ? await r.json().catch(() => null) : null;
        saving = false; body.inert = false; $('#edSave').disabled = false; $('#edSave').textContent = 'Save';
        if (!j) { if (cur === session) fail(r && r.status === 413 ? 'Photo too big even after shrinking.' : r && r.status === 401 ? 'Password rejected' : 'Photo upload failed. Check the connection.'); return; }
        pi.src = j.url;   // a retried Save reuses it
        if (cur !== session || !ed.open) {   // the editor was closed meanwhile: don't save behind the owner's back, and drop the orphan
          fetch(imgBase() + key, { method: 'DELETE', headers: authHeaders() }).catch(() => {});
          return;
        }
      }
      it.image = pi.src; it.w = pi.w; it.h = pi.h; it.illustration = null;
    } else if (!cur.image) { it.image = null; delete it.w; delete it.h; if (!it.illustration) it.illustration = null; }
    if (nu) { it.order = Math.max(0, ...doc.items.map(i => i.order || 0)) + 1; it.illustration = it.illustration || null; doc.items.push(it); }
    if (await save(doc, nu ? 'Added' : 'Saved')) { if (cur === session && ed.open) ed.close(); renderItems(); }   // save() also drops the photo it replaced
    else if (pi && (cur !== session || !ed.open)) dropUpload(pi.src);   // failed after the owner closed the editor
  });
  $('#edCancel').addEventListener('click', () => ed.close());
  ed.addEventListener('click', (e) => { if (e.target === ed) ed.close(); });
  function move(dir) {
    const doc = JSON.parse(JSON.stringify(DOC));
    const list = doc.items.filter(i => i.tier === cur.tier).sort((a, b) => (a.order || 0) - (b.order || 0));
    const i = list.findIndex(x => x.id === cur.id), j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return;
    const a = list[i], b = list[j]; const tmp = a.order; a.order = b.order; b.order = tmp;
    if (a.order === b.order) { a.order = (b.order || 0) + dir; }
    save(doc, 'Moved').then(ok => { if (ok) renderItems(); });
  }
  $('#moveUp').addEventListener('click', () => move(-1));
  $('#moveDown').addEventListener('click', () => move(1));
  $('#deleteBtn').addEventListener('click', async () => {
    const b = $('#deleteBtn');
    if (!b.dataset.sure) { b.dataset.sure = '1'; b.textContent = 'Tap again to delete for good'; setTimeout(() => { delete b.dataset.sure; b.textContent = 'Delete item'; }, 3500); return; }
    const doc = JSON.parse(JSON.stringify(DOC)), session = cur;
    doc.items = doc.items.filter(i => i.id !== cur.id);
    if (await save(doc, 'Deleted')) { if (cur === session && ed.open) ed.close(); renderItems(); }
  });

  /* ---------- toast ---------- */
  /* while the editor is open the toast lives inside it: a modal dialog sits in the top layer, above any z-index */
  let tt = 0;
  function toast(msg, bad) {
    const el = $('#toast'), host = ed.open ? ed : $('#adm'); if (el.parentNode !== host) host.appendChild(el);
    $('#toastMsg').textContent = msg; el.classList.toggle('bad', !!bad); el.hidden = false;
    clearTimeout(tt); tt = setTimeout(() => { el.hidden = true; }, 2200);
  }
  ed.addEventListener('close', () => $('#adm').appendChild($('#toast')));
  /* an upload whose list save failed and was given up on. If that save did land after all (its answer lost), the Worker
     sees the live list pointing at the photo and keeps it (409). */
  function dropUpload(src) {
    const k = src && src.startsWith(imgBase()) ? src.slice(imgBase().length).split(/[?#]/)[0] : '';
    if (k && !imgKeys(DOC).has(k)) fetch(imgBase() + k, { method: 'DELETE', headers: authHeaders() }).catch(() => {});
  }
  ed.addEventListener('close', () => { if (!saving && pendingImage) dropUpload(pendingImage.src); });

  boot();
})();
