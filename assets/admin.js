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
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const snd = (role, voice) => { if (window.Sound) window.Sound.play(role, voice || 'signature'); };
  /* "$1,200", "~$55", "$11 800", "$3.5k", "$42–50" → 1200, 55, 11800, 3500, 42; nothing numeric → null */
  function priceUSD(v) {
    const m = String(enOf(v) || '').replace(/ /g, ' ').match(/(\d(?:[\d,.]|\s(?=\d))*)\s*(k)?/i); if (!m) return null;
    const n = parseFloat(m[1].replace(/[\s,]/g, '')); return isFinite(n) ? n * (m[2] ? 1000 : 1) : null;
  }
  const fmtUSD = (n) => '$' + Math.round(n).toLocaleString('en-US');
  const num = (v) => { const s = String(v ?? '').replace(/[^\d.]/g, ''); return s ? parseFloat(s) : null; };
  /* a tier's USD band: explicit min/max, else read from its price line ("under $500" / "$500 – $5,000" / "$5,000 and up") */
  function tierBand(t) {
    let min = num(t.min), max = num(t.max);
    if (min == null && max == null) {
      const s = String(enOf(t.range) || '');
      const ns = (s.match(/\d[\d,.]*\s*k?/gi) || []).map(x => { const n = parseFloat(x.replace(/[^\d.]/g, '')); return /k$/i.test(x) ? n * 1000 : n; }).filter(isFinite);
      if (ns.length >= 2) { min = Math.min(ns[0], ns[1]); max = Math.max(ns[0], ns[1]); }
      else if (ns.length === 1) { if (/under|below|up to|less|до|менее/i.test(s)) max = ns[0]; else min = ns[0]; }
    }
    return (min == null && max == null) ? null : { min, max };
  }
  const inBand = (p, b) => !!b && (b.min == null || p >= b.min) && (b.max == null || p < b.max);

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
  const curView = () => { const t = $('.seg [role="tab"][aria-selected="true"]'); return t ? t.dataset.view : 'items'; };
  function show(id) {
    for (const s of ['login', 'noapi', 'seed', 'app']) $('#' + s).hidden = s !== id;
    $('#fab').hidden = id !== 'app' || curView() !== 'items';   // the Add button belongs to the Items tab only
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
  $('#logoutBtn').addEventListener('click', async () => { if (!await guardLook()) return; forget(); DOC = null; $('#tokenIn').value = ''; $('#loginErr').hidden = true; show('login'); });
  $('#reloadBtn').addEventListener('click', async () => { if (await guardLook()) enter(); });
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
  const imgKey = (u) => typeof u === 'string' && u.startsWith(imgBase()) ? u.slice(imgBase().length).split(/[?#]/)[0] : '';
  /* every Worker photo the list points at: item photos and the two walls */
  const imgKeys = (d) => new Set([...((d && d.items) || []).map(i => imgKey(i.image)), ...['light', 'dark'].map(s => imgKey(d && d.site && d.site.bg && d.site.bg[s] && d.site.bg[s].src))].filter(k => /^[a-z0-9-]{1,40}$/.test(k)));
  function dropImages(was) { const now = imgKeys(DOC); for (const k of was) if (!now.has(k)) fetch(imgBase() + k, { method: 'DELETE', headers: authHeaders() }).catch(() => {}); }

  /* ---------- views ---------- */
  $$('.seg [role="tab"]').forEach(b => b.addEventListener('click', async () => {
    const cur = $('.seg [role="tab"][aria-selected="true"]');
    if (cur && cur.dataset.view === 'look' && b.dataset.view !== 'look' && !await guardLook()) return;
    $$('.seg [role="tab"]').forEach(x => x.setAttribute('aria-selected', x === b ? 'true' : 'false'));
    $$('.view').forEach(v => { v.hidden = v.id !== 'view-' + b.dataset.view; });
    $('#fab').hidden = b.dataset.view !== 'items';
    snd('toggle.on');
  }));
  function renderAll(prev) { renderItems(); renderTexts(prev); renderLook(); }
  const tierOf = (id) => DOC.tiers.find(t => t.id === id) || DOC.tiers[0];
  const sorted = () => DOC.items.slice().sort((a, b) => (a.order || 0) - (b.order || 0));
  function thumb(it) {
    if (it.image) return `<div class="thumb${it.kind === 'photo' ? ' photo' : ''}"><img src="${esc(it.image)}" alt="" loading="lazy"></div>`;
    return `<div class="thumb"><svg viewBox="0 0 24 24" fill="none" stroke="#b9b2a4" stroke-width="1.5"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 16l5-5 4 4 3-3 6 6"/><circle cx="16" cy="9" r="1.6"/></svg></div>`;
  }
  const PENCIL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
  const GRIP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 8h14M5 12h14M5 16h14"/></svg>';
  let editingTier = null;   // the tier in reorder mode (one at a time)
  function renderItems() {
    const booked = new Set(BOOKINGS.map(b => b.item));
    const html = DOC.tiers.map(tier => {
      const items = sorted().filter(i => i.tier === tier.id), editing = editingTier === tier.id, tid = esc(tier.id);
      return `<section class="tiergroup${editing ? ' editing' : ''}" data-tier="${tid}"><h2><span class="dot" style="--c:${esc(tier.c)}"></span><span class="tname">${esc(tier.name.en)}</span>
          <button type="button" class="tedit" data-tier="${tid}" aria-label="Edit the ${esc(tier.name.en)} tier">${PENCIL}</button>
          <small>${items.length}</small><button type="button" class="link tmode" data-tier="${tid}" aria-pressed="${editing}">${editing ? 'Done' : 'Edit'}</button></h2>
        ${editing ? `<div class="tbar"><button type="button" class="btn ghost sm sortprice" data-tier="${tid}">Sort by price ↓</button><p class="help">Drag ≡ to reorder, then Done.</p></div>` : ''}
        <ul class="list" data-tier="${tid}">${items.map(it => `<li data-id="${esc(it.id)}"><button type="button" class="row" data-id="${esc(it.id)}">${thumb(it)}
          <span class="rtext"><span class="rname${it.status === 'got' ? ' got' : ''}">${esc(it.name.en)}</span>
          <span class="rsub">${esc(enOf(it.price))}${it.status === 'got' ? ' <span class="pill got">got it</span>' : ''}${it.status === 'dropped' ? ' <span class="pill dropped">hidden</span>' : ''}${booked.has(it.id) ? ' <span class="pill booked">booked</span>' : ''}</span></span>
          <span class="chev" aria-hidden="true">›</span></button><button type="button" class="grip" aria-label="Reorder ${esc(it.name.en)}: drag, or use the arrow keys">${GRIP}</button></li>`).join('') || '<li class="empty">Nothing here yet</li>'}</ul></section>`;
    }).join('');
    $('#view-items').innerHTML = html;
  }
  $('#view-items').addEventListener('click', (e) => {
    const t = e.target.closest('.tedit, .tmode, .sortprice, .row'); if (!t) return;
    if (t.classList.contains('tedit')) return openTier(t.dataset.tier);
    if (t.classList.contains('tmode')) return toggleEdit(t.dataset.tier);
    if (t.classList.contains('sortprice')) return sortByPrice(t.dataset.tier);
    if (!t.closest('.tiergroup').classList.contains('editing')) openEditor(t.dataset.id);
  });
  $('#addBtn').addEventListener('click', () => openEditor(null));

  /* ---------- reorder mode: Edit → drag the grips (or ↑ ↓ on a focused grip), Sort by price, Done saves once ---------- */
  const domOrder = (tierId) => $$(`.list[data-tier="${CSS.escape(tierId)}"] > li[data-id]`).map(li => li.dataset.id);
  function applyOrder(doc, tierId, ids) {   // this tier's items take their new order in the slots they already hold; everything renumbered 1..n
    const all = doc.items.slice().sort((a, b) => (a.order || 0) - (b.order || 0));
    const slots = all.map((it, i) => it.tier === tierId ? i : -1).filter(i => i >= 0);
    const byId = Object.fromEntries(doc.items.map(i => [i.id, i]));
    slots.forEach((slot, k) => { if (byId[ids[k]]) all[slot] = byId[ids[k]]; });
    all.forEach((it, i) => { it.order = i + 1; });
  }
  async function finishEdit() {   // Done: one save if the order changed
    if (!editingTier) return true;
    const tierId = editingTier, ids = domOrder(tierId), was = sorted().filter(i => i.tier === tierId).map(i => i.id);
    if (ids.join() === was.join()) { editingTier = null; renderItems(); snd('toggle.off'); return true; }
    const doc = JSON.parse(JSON.stringify(DOC)); applyOrder(doc, tierId, ids);
    if (!await save(doc, 'Order saved')) return false;   // stays in reorder mode so nothing is lost
    editingTier = null; renderItems(); return true;
  }
  async function toggleEdit(tierId) {
    if (saving) { toast('Still saving…'); return; }
    if (editingTier === tierId) { await finishEdit(); return; }
    if (editingTier && !await finishEdit()) return;
    editingTier = tierId; renderItems(); snd('toggle.on');
  }
  function sortByPrice(tierId) {
    const ul = $(`.list[data-tier="${CSS.escape(tierId)}"]`), lis = $$('li[data-id]', ul);
    const val = (li) => { const it = DOC.items.find(i => i.id === li.dataset.id), p = it ? priceUSD(it.price) : null; return p == null ? Infinity : p; };
    lis.map((li, i) => ({ li, p: val(li), i })).sort((a, b) => a.p - b.p || a.i - b.i).forEach(x => ul.appendChild(x.li));
    snd('toggle.on');
  }
  /* drag a grip: the row follows the finger, the others step aside as its middle crosses theirs; near the screen edge the page scrolls */
  let drag = null;
  $('#view-items').addEventListener('pointerdown', (e) => {
    const g = e.target.closest('.grip'); if (!g || !g.closest('.tiergroup').classList.contains('editing')) return;
    const li = g.closest('li'); e.preventDefault(); g.setPointerCapture(e.pointerId);
    drag = { li, ul: li.parentElement, id: e.pointerId, grab: e.clientY - li.getBoundingClientRect().top, y: e.clientY, raf: 0 };
    li.classList.add('dragging');
  });
  function dragStep() {
    if (!drag) return;
    const { li, ul, grab, y } = drag, edge = 90, vh = window.innerHeight;
    if (y < edge) window.scrollBy(0, -Math.ceil((edge - y) / 6)); else if (y > vh - edge) window.scrollBy(0, Math.ceil((y - vh + edge) / 6));
    li.style.transform = '';
    const vmid = y - grab + li.offsetHeight / 2, sibs = $$('li[data-id]', ul).filter(x => x !== li);
    let target = null;
    for (const s of sibs) { const b = s.getBoundingClientRect(); if ((s.compareDocumentPosition(li) & Node.DOCUMENT_POSITION_FOLLOWING) && vmid < b.top + b.height / 2) { target = [s, 'before']; break; } }
    if (!target) for (const s of sibs.slice().reverse()) { const b = s.getBoundingClientRect(); if ((s.compareDocumentPosition(li) & Node.DOCUMENT_POSITION_PRECEDING) && vmid > b.top + b.height / 2) { target = [s, 'after']; break; } }
    if (target) ul.insertBefore(li, target[1] === 'before' ? target[0] : target[0].nextSibling);
    li.style.transform = `translateY(${y - grab - li.getBoundingClientRect().top}px)`;
    drag.raf = (y < edge || y > vh - edge) ? requestAnimationFrame(dragStep) : 0;
  }
  document.addEventListener('pointermove', (e) => { if (!drag || e.pointerId !== drag.id) return; drag.y = e.clientY; if (!drag.raf) dragStep(); });
  const dragEnd = (e) => { if (!drag || e.pointerId !== drag.id) return; cancelAnimationFrame(drag.raf); drag.li.classList.remove('dragging'); drag.li.style.transform = ''; drag = null; };
  document.addEventListener('pointerup', dragEnd); document.addEventListener('pointercancel', dragEnd);
  $('#view-items').addEventListener('keydown', (e) => {
    const g = e.target.closest('.grip'); if (!g || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
    const li = g.closest('li'), ul = li.parentElement; e.preventDefault();
    if (e.key === 'ArrowUp' && li.previousElementSibling) ul.insertBefore(li, li.previousElementSibling);
    if (e.key === 'ArrowDown' && li.nextElementSibling) ul.insertBefore(li.nextElementSibling, li);
    g.focus({ preventScroll: true }); li.scrollIntoView({ block: 'nearest' });
  });

  /* ---------- a question in the way (unsaved changes, tier hint): iOS action sheet; resolves with the choice, null if dismissed ---------- */
  const askD = $('#ask'); let askRes = null;
  function ask({ title, text, buttons }) {
    $('#askTitle').textContent = title; const tx = $('#askText'); tx.textContent = text || ''; tx.hidden = !text;
    $('#askBtns').innerHTML = buttons.map((b, i) => `<button type="button" class="btn ${b.kind || 'ghost'}" data-i="${i}">${esc(b.label)}</button>`).join('');
    if (askRes) { const prev = askRes; askRes = null; prev(null); }   // a question still open counts as dismissed
    if (askD.open) askD.close();
    return new Promise(res => {
      askRes = res;
      $('#askBtns').onclick = (e) => { const b = e.target.closest('[data-i]'); if (!b) return; const r = askRes; askRes = null; askD.close(); if (r) r(buttons[+b.dataset.i].value); };
      askD.showModal();
    });
  }
  askD.addEventListener('click', (e) => { if (e.target === askD) askD.close(); });
  askD.addEventListener('close', () => { if (askD.open) return; /* a close event arriving after the next question opened */ const r = askRes; askRes = null; if (r) r(null); });
  /* closing a sheet that holds unsaved edits asks first: Save / Discard changes / Keep editing (Mail's pattern) */
  async function guardClose(dialog, isDirty, submit) {
    if (!dialog.open) return;
    if (!isDirty()) { dialog.close(); return; }
    const v = await ask({ title: 'Unsaved changes', text: 'Save them, or throw them away?', buttons: [
      { label: 'Save', value: 'save', kind: 'primary' }, { label: 'Discard changes', value: 'discard', kind: 'ghost danger' }, { label: 'Keep editing', value: 'keep', kind: 'ghost' }] });
    if (v === 'save') submit(); else if (v === 'discard') { snd('toggle.off'); dialog.close(); }
  }

  /* ---------- tier editor (the pencil): names, price line, one-liner, optional USD band ---------- */
  const tf = $('#tierForm'), tierEd = $('#tierEd'); let tierCur = null, tierBase = '';
  const tierSnap = () => JSON.stringify([...tf.elements].filter(el => el.name).map(el => el.value));
  function openTier(id) {
    if (saving) { toast('Still saving…'); return; }
    tierCur = DOC.tiers.find(t => t.id === id); if (!tierCur) return;
    for (const k of ['name', 'short', 'range', 'blurb']) for (const l of ['en', 'ru']) tf.elements[`${k}.${l}`].value = (tierCur[k] && tierCur[k][l]) || '';
    tf.elements.min.value = tierCur.min ?? ''; tf.elements.max.value = tierCur.max ?? '';
    $('#tierTitle').textContent = tierCur.name.en; $('#tierErr').hidden = true;
    tierBase = tierSnap(); tierEd.showModal(); $('.sheet-body', tierEd).scrollTop = 0;
  }
  tf.addEventListener('submit', async (e) => {
    e.preventDefault(); if (!tierCur) return;
    if (!tf.elements['name.en'].value.trim()) { const er = $('#tierErr'); er.textContent = 'Give the tier a name (EN).'; er.hidden = false; return; }
    const doc = JSON.parse(JSON.stringify(DOC)), t = doc.tiers.find(x => x.id === tierCur.id);
    for (const k of ['name', 'short', 'range', 'blurb']) { const en = tf.elements[`${k}.en`].value.trim(), ru = tf.elements[`${k}.ru`].value.trim(); if (en || ru || t[k]) t[k] = { en, ru: ru || en }; }
    const mn = num(tf.elements.min.value), mx = num(tf.elements.max.value);
    if (mn != null) t.min = mn; else delete t.min; if (mx != null) t.max = mx; else delete t.max;
    if (await save(doc, 'Tier saved')) { tierEd.close(); renderItems(); }
  });
  const tierClose = () => guardClose(tierEd, () => tierSnap() !== tierBase, () => tf.requestSubmit());
  $('#tierCancel').addEventListener('click', tierClose);
  tierEd.addEventListener('cancel', (e) => { e.preventDefault(); tierClose(); });
  let tierDown = false;
  tierEd.addEventListener('pointerdown', (e) => { tierDown = e.target === tierEd; });
  tierEd.addEventListener('click', (e) => { if (e.target === tierEd && tierDown) tierClose(); });

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
  /* the small words: every ui.* string gets a plain-language label here; an unknown key shows as itself */
  const WORD_LABELS = { approx: 'Back: "approx. price"', where: 'Back: "Where to look"', back: 'Flip-back button (hidden label)', tap: 'Front: "tap to flip"', things: 'Tier count unit', swipe: '"swipe →" under a row', sketch: 'Sketch placeholder', eu: 'Europe', tr: 'Turkey', ru: 'Russia', got: '"got it" stamp', booked: '"booked" ribbon', loading: 'Loading line', offline: 'Offline message', tilt: 'Tilt hint on the back', tiltAsk: 'Tilt permission toast', tiltOn: 'Tilt toast button', bookBtn: 'Booking button', bookTitle: 'Booking sheet title', bookName: 'Name field label', bookHelp: 'Name field help', bookConfirm: '"Book it" button', cancel: 'Cancel', bookedByYou: '"Booked by you"', unbook: 'Undo button', unbookSure: 'Undo: confirm label', unbooking: 'Undo in progress', taken: 'Error: just taken', gone: 'Error: crossed off', slowDown: 'Error: too many bookings', bookFail: 'Error: no connection', retry: '"Try again"', soundOn: 'Sound pill: on', soundOff: 'Sound pill: off', booking: '"Booking…"', bookedDone: 'Booked: confirmation', bookedTaken: 'Booked by someone else' };
  function renderTexts(prev) {
    const f = $('#textsForm');
    const set = (el, was, now) => { if (el && (!prev || el.value.trim() === String(was || '').trim())) el.value = now || ''; };
    for (const k of TEXT_FIELDS) for (const l of ['en', 'ru']) set(f.elements[`${k}.${l}`], prev && prev.site[k] && prev.site[k][l], DOC.site[k] && DOC.site[k][l]);
    for (const k of UI_FIELDS) for (const l of ['en', 'ru']) set(f.elements[`ui.${k}.${l}`], prev && prev.ui[k] && prev.ui[k][l], DOC.ui[k] && DOC.ui[k][l]);
    const keys = Object.keys(DOC.ui).filter(k => !UI_FIELDS.includes(k) && DOC.ui[k] && typeof DOC.ui[k] === 'object'), list = $('#wordsList');
    $('#wordsCount').textContent = keys.length;
    const fresh = !prev || !list.children.length;
    if (fresh) list.innerHTML = keys.map(k => { const lb = esc(WORD_LABELS[k] || k); return `<div class="wordrow"><span>${lb}</span><input name="ui.${esc(k)}.en" type="text" aria-label="${lb} · EN"><input name="ui.${esc(k)}.ru" type="text" lang="ru" aria-label="${lb} · RU"></div>`; }).join('');
    for (const k of keys) for (const l of ['en', 'ru']) { const el = f.elements[`ui.${k}.${l}`]; if (fresh && el) el.value = DOC.ui[k][l] || ''; else set(el, prev && prev.ui[k] && prev.ui[k][l], DOC.ui[k][l]); }
  }
  $('#textsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const doc = JSON.parse(JSON.stringify(DOC)), f = e.target;
    for (const k of TEXT_FIELDS) doc.site[k] = { en: f.elements[`${k}.en`].value.trim(), ru: f.elements[`${k}.ru`].value.trim() };
    for (const k of UI_FIELDS) doc.ui[k] = { en: f.elements[`ui.${k}.en`].value.trim(), ru: f.elements[`ui.${k}.ru`].value.trim() };
    for (const el of f.querySelectorAll('#wordsList input')) {   // small words: ui.<key>.<lang>; EN never goes empty, empty RU falls back to EN
      const m = el.name.match(/^ui\.(.+)\.(en|ru)$/); if (!m || !doc.ui[m[1]] || typeof doc.ui[m[1]] !== 'object') continue;
      const v = el.value.trim(); if (m[2] === 'en' && !v) continue;
      doc.ui[m[1]][m[2]] = v || doc.ui[m[1]].en;
    }
    if (await save(doc, 'Texts saved')) renderTexts(doc);   // saved fields show trimmed; typing since the tap stays
  });

  /* ---------- look: the wall behind the cards, one per room (theme) ---------- */
  const SCENES = [{ id: 'aurora', name: 'Aurora' }, { id: 'swirl', name: 'Swirl' }, { id: 'shift', name: 'Shift' }, { id: 'coalesce', name: 'Coalesce' }, { id: 'pipeline', name: 'Pipeline' }];
  const SWATCHES = [{ id: 'ink', c: '' }, { id: 'gold', c: '#8a6d3b' }, { id: 'green', c: '#8fb08a' }, { id: 'coral', c: '#d99d85' }, { id: 'blue', c: '#7f9bb8' }];
  const ROOM = { light: { wall: '#f4efe4', ink: '#221d17' }, dark: { wall: '#15120e', ink: '#f1e9da' } };
  const HEX = /^#[0-9a-f]{3,8}$/i, MAXS = { pattern: 60, tile: 100, photo: 70, scene: 70 };   // photos and scenes never go full strength: the hero text sits on them
  const lookDefaults = () => ({ kind: 'none', id: '', color: '', strength: 14, scale: 1, src: '', size: 0, repeat: false, phone: false });
  let LOOK = null, lookDirty = false, bgEl = null;
  const lookFrom = (doc) => { const bg = (doc.site && doc.site.bg) || {}; return { light: Object.assign(lookDefaults(), bg.light || {}), dark: Object.assign(lookDefaults(), bg.dark || {}) }; };
  const isDark = () => document.documentElement.classList.contains('dark');
  /* the admin's own wall: while picking, the room being edited; otherwise the saved wall of the theme the admin is in */
  function showWall(cfg, side) {
    if (!window.Wall) return;
    if (side && window.Theme && (side === 'dark') !== isDark()) Theme.set(side === 'dark', false);
    const s = side || (isDark() ? 'dark' : 'light');
    if (!bgEl) { bgEl = document.createElement('div'); bgEl.id = 'bg'; bgEl.className = 'bg'; bgEl.setAttribute('aria-hidden', 'true'); document.body.insertBefore(bgEl, document.body.firstChild); }
    const c = cfg || (DOC && DOC.site && DOC.site.bg && DOC.site.bg[s]) || null;
    const kind = Wall.render(bgEl, c, { ink: ROOM[s].ink });
    if (kind === 'scene') { window.SceneScale = matchMedia('(hover: hover) and (pointer: fine)').matches ? 1 : .5; Wall.live(bgEl, c.id); }   // the owner sees it move right here
  }
  window.addEventListener('themechange', () => {   // after the (animated) theme switch: keep the live pick while editing, else the saved wall
    if (!DOC) return; const side = isDark() ? 'dark' : 'light';
    showWall(lookDirty && LOOK && curView() === 'look' ? LOOK[side] : null);
  });
  function renderLook() {
    if (!lookDirty || !LOOK) LOOK = lookFrom(DOC);   // unsaved picks survive a Reload and other tabs' saves
    renderSide('light'); renderSide('dark'); markLook(); showWall();
  }
  function markLook() { $('#lookActions').hidden = !lookDirty; }
  function touchLook(side) { lookDirty = true; renderSide(side); markLook(); showWall(LOOK[side], side); }
  const tint = (cfg, room) => HEX.test(cfg.color || '') ? cfg.color : room.ink;
  function renderSide(side) {
    const cfg = LOOK[side], room = ROOM[side], Pt = window.Patterns, color = tint(cfg, room), op = Math.min(1, cfg.strength / 100 * 3);
    const on = (kind, id) => cfg.kind === kind && (cfg.id || '') === (id || '');
    const tile = (kind, id, label, inner) => `<button type="button" class="tile${on(kind, id) ? ' on' : ''}" data-side="${side}" data-kind="${kind}" data-id="${esc(id || '')}" style="--wall:${room.wall};--rink:${room.ink}" aria-pressed="${on(kind, id)}"><span class="tile-art">${inner}</span><span class="tile-lbl">${esc(label)}</span></button>`;
    const head = (t) => `<h4 class="tilesh">${t}</h4>`;
    const pat = (p) => tile('pattern', p.id, p.name.en, `<span class="tile-pat" style="opacity:${p.fixed ? Math.min(1, op * 1.6) : op}">${Pt.svg(p.id, { color: p.fixed ? 'currentColor' : color, scale: .8 })}</span>`);
    const prem = (t) => tile('tile', t.id, t.name, `<span class="tile-rep" style="background-image:url(img/patterns/${t.id}.webp);background-size:${Math.max(40, Math.round(t.w / 2))}px auto"></span>`);
    const pats = Pt ? Pt.list : [], tiles = Pt ? Pt.tiles : [];
    const camera = '<span class="ph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 16l5-5 4 4 3-3 6 6"/><circle cx="16" cy="9" r="1.6"/></svg></span>';
    const html = [tile('none', '', 'Plain wall', ''), head('Patterns'), ...pats.filter(p => !p.holiday).map(pat), head('Holiday'), ...pats.filter(p => p.holiday).map(pat),
        `<details class="tiles-more"${cfg.kind === 'tile' ? ' open' : ''}><summary>Premium <b>${tiles.length}</b></summary><div class="tiles">${tiles.map(prem).join('')}</div></details>`]
      .concat(side === 'dark' ? [head('Animated backgrounds'), ...SCENES.map(s => tile('scene', s.id, s.name, `<img src="img/scenes/${s.id}.webp" alt="" loading="lazy">`))] : [])
      .concat([head('Your photo'), tile('photo', '', cfg.src ? 'Your photo' : 'Add a photo…', cfg.src ? `<img src="${esc(cfg.src)}" alt="">` : camera)]);
    $(`#tiles-${side}`).innerHTML = html.join('');
    $(`#lookopts-${side}`).hidden = cfg.kind === 'none';
    const range = $(`#str-${side}`); range.max = MAXS[cfg.kind] || 60; if (cfg.strength > +range.max) cfg.strength = +range.max; range.value = cfg.strength; $(`#out-${side}`).value = cfg.strength;
    const p = Pt && cfg.kind === 'pattern' ? Pt.byId(cfg.id) : null;
    $(`#swrow-${side}`).hidden = !(p && !p.fixed);
    $(`#replace-${side}`).hidden = cfg.kind !== 'photo';
    const fit = $(`#fit-${side}`); fit.hidden = cfg.kind !== 'photo'; $$('button', fit).forEach(b => b.classList.toggle('on', (b.dataset.fit === 'repeat') === !!cfg.repeat));
    const tiled = cfg.kind === 'tile' || (cfg.kind === 'photo' && cfg.repeat);
    $(`#sizerow-${side}`).hidden = !tiled;
    if (tiled) { const t = cfg.kind === 'tile' && Pt ? Pt.tile(cfg.id) : null, v = cfg.size || (t ? t.w : 300); $(`#size-${side}`).value = v; $(`#sizeout-${side}`).value = v + ' px'; }
    const ph = $(`#phonerow-${side}`); if (ph) { ph.hidden = cfg.kind !== 'scene'; $(`#phone-${side}`).checked = !!cfg.phone; }
    preview(side);
    const custom = /^#[0-9a-f]{6}$/i.test(cfg.color || '') && !SWATCHES.some(s => s.c.toLowerCase() === cfg.color.toLowerCase());
    $(`#sw-${side}`).innerHTML = SWATCHES.map(s => { const sel = (cfg.color || '').toLowerCase() === s.c.toLowerCase(); return `<button type="button" class="sw${sel ? ' on' : ''}" data-side="${side}" data-c="${s.c}" style="--c:${s.c || room.ink}" aria-label="${s.id}" aria-pressed="${sel}"></button>`; }).join('')
      + `<label class="sw custom${custom ? ' on' : ''}" style="--c:${custom ? cfg.color : room.ink}" title="Any colour"><input type="color" data-side="${side}" value="${custom ? cfg.color : room.ink}" aria-label="Custom colour"></label>`;
  }
  /* the strip under the slider shows the wall at the real page strength, with a little paper card on it */
  function preview(side) {
    const cfg = LOOK[side], room = ROOM[side], el = $(`#prev-${side}`);
    el.style.background = room.wall; el.innerHTML = '<div class="prev-art"></div>';
    if (window.Wall) Wall.render(el.firstChild, cfg, { cls: 'prev-art', ink: room.ink });
  }
  $('#view-look').addEventListener('click', (e) => {
    const t = e.target.closest('.tile'), sw = e.target.closest('.sw:not(.custom)'), rp = e.target.closest('[data-replace]'), fit = e.target.closest('[data-fit]');
    if (rp) { $(`#bgIn-${rp.dataset.replace}`).click(); return; }
    if (fit) { const side = fit.dataset.side; LOOK[side].repeat = fit.dataset.fit === 'repeat'; touchLook(side); snd('toggle.on'); return; }
    if (sw) { LOOK[sw.dataset.side].color = sw.dataset.c; touchLook(sw.dataset.side); snd('toggle.on'); return; }
    if (!t) return;
    const side = t.dataset.side, cfg = LOOK[side], kind = t.dataset.kind, id = t.dataset.id;
    if (kind === 'photo' && !cfg.src) { $(`#bgIn-${side}`).click(); return; }   // no photo yet: pick one
    if (kind === cfg.kind && id === (cfg.id || '')) return;
    if (kind === 'pattern' && cfg.kind !== 'pattern') cfg.strength = lookDefaults().strength;   // each kind has its own sensible strength
    if (kind === 'tile' && cfg.kind !== 'tile') { cfg.strength = 50; cfg.size = 0; }
    if (kind === 'scene') cfg.strength = MAXS.scene;
    if (kind === 'photo' && cfg.kind !== 'photo') cfg.strength = Math.max(Math.min(cfg.strength, MAXS.photo), 35);
    cfg.kind = kind; cfg.id = id; touchLook(side); snd('toggle.on');
  });
  $('#view-look').addEventListener('input', (e) => {
    const side = e.target.dataset.side; if (!side || !LOOK || !LOOK[side]) return;
    const cfg = LOOK[side];
    if (e.target.dataset.k === 'strength') {
      cfg.strength = +e.target.value; $(`#out-${side}`).value = e.target.value; lookDirty = true; markLook();
      const op = Math.min(1, cfg.strength / 100 * 3); $$(`#tiles-${side} .tile-pat`).forEach(el => { el.style.opacity = op; }); preview(side); showWall(cfg, side);
    }
    if (e.target.dataset.k === 'size') { cfg.size = +e.target.value; $(`#sizeout-${side}`).value = e.target.value + ' px'; lookDirty = true; markLook(); preview(side); showWall(cfg, side); }
    if (e.target.type === 'color') { if (HEX.test(e.target.value)) cfg.color = e.target.value; lookDirty = true; preview(side); showWall(cfg, side); }
  });
  $('#view-look').addEventListener('change', (e) => {
    if (e.target.type === 'color') touchLook(e.target.dataset.side);
    if (e.target.id === 'phone-dark') { LOOK.dark.phone = e.target.checked; lookDirty = true; markLook(); snd(e.target.checked ? 'toggle.on' : 'toggle.off'); }
  });
  for (const side of ['light', 'dark']) $(`#bgIn-${side}`).addEventListener('change', async (e) => {
    const f = e.target.files && e.target.files[0]; e.target.value = ''; if (!f) return;
    if (saving) { toast('Still saving…'); return; }
    let pi; try { pi = await shrink(f, 1600); } catch (x) { toast('Could not read that photo', true); snd('state.error'); return; }
    saving = true; toast('Uploading…');
    const key = `bg-${side}-${Date.now().toString(36)}`;
    const r = await fetch(`${API}/api/lists/${LIST}/images/${key}`, { method: 'POST', headers: authHeaders({ 'Content-Type': pi.type }), body: pi.blob, signal: giveUp(60000) }).catch(() => null);
    const j = r && r.ok ? await r.json().catch(() => null) : null;
    saving = false;
    if (!j) { toast(r && r.status === 413 ? 'Photo too big even after shrinking.' : 'Photo upload failed. Check the connection.', true); snd('state.error'); return; }
    const cfg = LOOK[side], old = cfg.src;
    cfg.src = j.url; cfg.kind = 'photo'; cfg.id = ''; cfg.strength = Math.max(Math.min(cfg.strength, MAXS.photo), 35);
    if (old && old !== j.url) dropUpload(old);   // a photo picked earlier and never saved
    touchLook(side); toast(`Photo ready · ${Math.round(pi.blob.size / 1024)} KB`); snd('toggle.on');
  });
  async function saveLook() {
    const doc = JSON.parse(JSON.stringify(DOC));
    const clean = (c) => {
      const o = { kind: c.kind || 'none' };
      if (o.kind === 'pattern' || o.kind === 'scene' || o.kind === 'tile') o.id = c.id;
      if (o.kind === 'photo') { o.src = c.src; if (c.repeat) o.repeat = true; }
      if ((o.kind === 'tile' || (o.kind === 'photo' && c.repeat)) && +c.size) o.size = +c.size;
      if (o.kind === 'scene' && c.phone) o.phone = true;
      if (o.kind !== 'none') o.strength = Math.min(+c.strength || 10, MAXS[o.kind] || 60);
      if (o.kind === 'pattern') { if (HEX.test(c.color || '')) o.color = c.color; if (c.scale && c.scale !== 1) o.scale = c.scale; }
      return o;
    };
    doc.site.bg = { light: clean(LOOK.light), dark: clean(LOOK.dark) };
    if (!await save(doc, 'Look saved')) return false;   // save() also drops the wall photo this one replaced
    for (const s of ['light', 'dark']) if (LOOK[s].src && LOOK[s].kind !== 'photo') dropUpload(LOOK[s].src);   // uploaded, then not used
    lookDirty = false; LOOK = null; if (window.Theme) Theme.restore(); renderLook(); return true;
  }
  $('#lookSave').addEventListener('click', saveLook);
  /* leaving the Look tab, Reload or Sign out with unsaved picks asks first; Discard also throws away photos uploaded for them */
  async function guardLook() {
    if (!lookDirty) { if (window.Theme) Theme.restore(); return true; }
    const v = await ask({ title: 'Unsaved look', text: 'Save it, or throw it away?', buttons: [{ label: 'Save look', value: 'save', kind: 'primary' }, { label: 'Discard', value: 'discard', kind: 'ghost danger' }, { label: 'Keep editing', value: 'keep', kind: 'ghost' }] });
    if (v === 'save') return await saveLook();
    if (v === 'discard') { for (const s of ['light', 'dark']) if (LOOK[s].src) dropUpload(LOOK[s].src); lookDirty = false; LOOK = null; if (window.Theme) Theme.restore(); renderLook(); snd('toggle.off'); return true; }
    return false;
  }

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
    $('#deleteFld').hidden = isNew;
    const err = $('#edErr'); err.hidden = true;
    ed.showModal(); $('.sheet-body', ed).scrollTop = 0;
    edBase = edSnap();
  }
  /* everything the editor shows, as one string; compared on every attempt to close */
  let edBase = '';
  const edSnap = () => JSON.stringify({
    f: [...form.elements].filter(el => el.name).map(el => el.value),
    s: ['#tierSeg', '#statusSeg', '#kindSeg', '[data-av="eu"]', '[data-av="tr"]', '[data-av="ru"]'].map(segVal),
    w: $$('#whereRows input').map(i => i.value),
    img: pendingImage ? pendingImage.url : (cur && cur.image) || '',
  });
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
    else box.innerHTML = `<div class="ph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 16l5-5 4 4 3-3 6 6"/><circle cx="16" cy="9" r="1.6"/></svg><b>${cur.illustration ? 'Sketch for now · tap to add a photo' : 'Tap to add a photo'}</b><span>${finePointer ? 'or drop / paste one here' : 'camera or library'}</span></div>`;
  }
  /* the box is the control: tap (or Enter), drop a file on it, or paste an image while the editor is open */
  const box = $('#photoBox');
  box.addEventListener('click', () => $('#photoIn').click());
  box.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('#photoIn').click(); } });
  ['dragenter', 'dragover'].forEach(ev => box.addEventListener(ev, (e) => { e.preventDefault(); box.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(ev => box.addEventListener(ev, (e) => { e.preventDefault(); box.classList.remove('over'); }));
  box.addEventListener('drop', (e) => { const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]; if (f) takeFile(f); });
  document.addEventListener('paste', (e) => {
    if (!ed.open || $('.sheet-body', ed).inert) return;
    const f = [...((e.clipboardData && e.clipboardData.files) || [])].find(x => x.type.startsWith('image/')); if (f) { e.preventDefault(); takeFile(f); }
  });
  $('#photoIn').addEventListener('change', (e) => { const f = e.target.files && e.target.files[0]; if (f) takeFile(f); e.target.value = ''; });
  async function takeFile(f) {
    if (!f.type.startsWith('image/')) { toast('That is not an image', true); snd('state.error'); return; }
    try {
      pendingImage = await shrink(f);
      seg('#kindSeg', pendingImage.alpha ? 'cut' : 'photo');   // only real transparency makes a cut-out
      renderPhoto(); toast(`Photo ready · ${Math.round(pendingImage.blob.size / 1024)} KB`); snd('toggle.on');
    } catch (x) { toast('Could not read that photo', true); snd('state.error'); }
  }
  $('#photoRemove').addEventListener('click', () => { pendingImage = null; cur.image = null; renderPhoto(); });
  /* resize on the phone so every upload fits the Worker's 600 KB: longest side ≤ 800 px, WebP when the browser can encode it
     (Safari can't), else JPEG; only real transparency stays PNG. Still too big → step the size down until it fits. */
  const UP_MAX = 560 * 1024;
  async function shrink(file, maxSide) {
    const url = URL.createObjectURL(file);
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; }).finally(() => URL.revokeObjectURL(url));
    const c = document.createElement('canvas'), g = c.getContext('2d');
    const draw = (max) => { const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight)); c.width = Math.max(1, Math.round(img.naturalWidth * s)); c.height = Math.max(1, Math.round(img.naturalHeight * s)); g.drawImage(img, 0, 0, c.width, c.height); };
    draw(maxSide || 800);
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
    /* the price belongs to another tier? offer it once, one tap (the bands come from the tier editor or the tiers' price lines) */
    const tierId = segVal('#tierSeg') || DOC.tiers[0].id, p = priceUSD(form.elements['price.en'].value), band = tierBand(tierOf(tierId));
    const priceTouched = isNew || form.elements['price.en'].value.trim() !== String(enOf(cur.price) || '').trim();   // only a price typed in this session triggers the hint
    if (priceTouched && p != null && band && !inBand(p, band) && cur._bandAsked !== p) {
      const better = DOC.tiers.find(t => t.id !== tierId && inBand(p, tierBand(t)));
      if (better) {
        cur._bandAsked = p;
        const here = tierOf(tierId), lbl = (t) => (t.short && t.short.en) || t.name.en;
        const v = await ask({ title: `${fmtUSD(p)} is ${band.min != null && p < band.min ? 'below' : 'above'} ${here.name.en}`, text: `Move it to ${better.name.en}?`,
          buttons: [{ label: `Move to ${lbl(better)}`, value: 'move', kind: 'primary' }, { label: `Keep in ${lbl(here)}`, value: 'keep', kind: 'ghost' }] });
        if (v == null) return;   // dismissed: back to the editor, nothing saved
        if (v === 'move') seg('#tierSeg', better.id);
      }
    }
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
  /* Cancel, a tap on the backdrop and Esc all go through the unsaved-changes guard; a drag that merely ends on the backdrop does nothing */
  const edClose = () => guardClose(ed, () => edSnap() !== edBase, () => form.requestSubmit());
  $('#edCancel').addEventListener('click', edClose);
  let edDown = false;
  ed.addEventListener('pointerdown', (e) => { edDown = e.target === ed; });
  ed.addEventListener('click', (e) => { if (e.target === ed && edDown) edClose(); });
  ed.addEventListener('cancel', (e) => { e.preventDefault(); edClose(); });
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
