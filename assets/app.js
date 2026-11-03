/* Wishlist 2026 — v2 app. Data comes from data/items.json; nothing here is content. */

/* ---------- inline illustrations for items without a photo yet ---------- */
const ART = {
  ring: `<svg viewBox="0 0 200 200"><defs><linearGradient id="gS" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f2f2f5"/><stop offset=".5" stop-color="#b9bac4"/><stop offset="1" stop-color="#e9e9ee"/></linearGradient></defs><ellipse cx="100" cy="150" rx="70" ry="14" fill="#000" opacity=".08"/><path fill-rule="evenodd" fill="#8d8e99" d="M100 60a72 48 0 1 0 0 96a72 48 0 1 0 0-96zm0 18a54 30 0 1 1 0 60a54 30 0 1 1 0-60z" transform="translate(0 14)"/><path fill-rule="evenodd" fill="url(#gS)" d="M100 60a72 48 0 1 0 0 96a72 48 0 1 0 0-96zm0 18a54 30 0 1 1 0 60a54 30 0 1 1 0-60z"/><circle cx="84" cy="132" r="3" fill="#333"/><circle cx="100" cy="135" r="3" fill="#333"/><circle cx="116" cy="132" r="3" fill="#333"/></svg>`,
  gimbal: `<svg viewBox="0 0 200 200"><ellipse cx="100" cy="186" rx="40" ry="6" fill="#000" opacity=".1"/><rect x="80" y="92" width="40" height="92" rx="9" fill="#2b2b2f"/><rect x="86" y="102" width="28" height="32" rx="4" fill="#4e9cff"/><rect x="86" y="102" width="28" height="12" rx="4" fill="#8ec1ff" opacity=".7"/><circle cx="100" cy="152" r="6" fill="#d94040"/><rect x="92" y="166" width="16" height="4" rx="2" fill="#555"/><rect x="96" y="70" width="8" height="24" fill="#3a3a3f"/><path d="M96 70 h-16 a6 6 0 0 1 -6 -6 v-18" stroke="#3a3a3f" stroke-width="8" fill="none" stroke-linecap="round"/><rect x="66" y="26" width="36" height="34" rx="10" fill="#2b2b2f"/><circle cx="84" cy="43" r="11" fill="#111"/><circle cx="84" cy="43" r="7" fill="#2f63d6"/><circle cx="81" cy="40" r="2.5" fill="#fff" opacity=".8"/></svg>`,
  clip: `<svg viewBox="0 0 200 200"><ellipse cx="100" cy="166" rx="56" ry="8" fill="#000" opacity=".08"/><g transform="translate(62 96) rotate(-18)"><path d="M0 0 q-6 -34 26 -40" stroke="#2a2a2e" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="0" cy="4" r="15" fill="#2a2a2e"/><circle cx="-4" cy="0" r="4" fill="#5a5a60"/><circle cx="28" cy="-40" r="10" fill="#2a2a2e"/><circle cx="28" cy="-40" r="4" fill="#c9a86a"/></g><g transform="translate(138 118) rotate(18) scale(-1 1)"><path d="M0 0 q-6 -34 26 -40" stroke="#2a2a2e" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="0" cy="4" r="15" fill="#2a2a2e"/><circle cx="-4" cy="0" r="4" fill="#5a5a60"/><circle cx="28" cy="-40" r="10" fill="#2a2a2e"/><circle cx="28" cy="-40" r="4" fill="#c9a86a"/></g></svg>`,
  arm: `<svg viewBox="0 0 200 200"><rect x="140" y="150" width="34" height="26" rx="4" fill="#2b2b2f"/><rect x="150" y="128" width="14" height="26" fill="#3a3a3f"/><path d="M157 130 L92 70" stroke="#2b2b2f" stroke-width="9" stroke-linecap="round"/><path d="M92 70 L48 112" stroke="#2b2b2f" stroke-width="9" stroke-linecap="round"/><path d="M150 118 l-8 -5 l-6 10 l-8 -5 l-6 10 l-8 -5 l-6 10 l-8 -5" stroke="#8a8a90" stroke-width="2.5" fill="none" stroke-linejoin="round"/><path d="M86 78 l-4 8 l-8 -2 l-4 8 l-8 -2 l-4 8" stroke="#8a8a90" stroke-width="2.5" fill="none" stroke-linejoin="round"/><circle cx="92" cy="70" r="7" fill="#1d1d20"/><rect x="36" y="112" width="24" height="44" rx="11" fill="#2b2b2f" transform="rotate(-12 48 134)"/><rect x="40" y="114" width="16" height="18" rx="7" fill="#5a5a60" opacity=".9" transform="rotate(-12 48 134)"/><circle cx="48" cy="150" r="3" fill="#c9a86a" transform="rotate(-12 48 134)"/></svg>`,
  studring: `<svg viewBox="0 0 200 200"><defs><linearGradient id="gG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbe7a6"/><stop offset=".5" stop-color="#d4a443"/><stop offset="1" stop-color="#f3d27a"/></linearGradient></defs><ellipse cx="100" cy="152" rx="66" ry="12" fill="#000" opacity=".08"/><path fill-rule="evenodd" fill="#a67c22" d="M100 62a70 46 0 1 0 0 92a70 46 0 1 0 0-92zm0 20a50 26 0 1 1 0 52a50 26 0 1 1 0-52z" transform="translate(0 16)"/><path fill-rule="evenodd" fill="url(#gG)" d="M100 62a70 46 0 1 0 0 92a70 46 0 1 0 0-92zm0 20a50 26 0 1 1 0 52a50 26 0 1 1 0-52z"/><g fill="#fff3c4" stroke="#b8862e" stroke-width="1"><circle cx="46" cy="122" r="5"/><circle cx="64" cy="138" r="5"/><circle cx="88" cy="148" r="5"/><circle cx="112" cy="148" r="5"/><circle cx="136" cy="138" r="5"/><circle cx="154" cy="122" r="5"/><circle cx="40" cy="100" r="5"/><circle cx="160" cy="100" r="5"/></g></svg>`,
  sweater: `<svg viewBox="0 0 200 200"><ellipse cx="100" cy="178" rx="70" ry="8" fill="#000" opacity=".08"/><path d="M34 60 q66 -30 132 0 l12 70 l-26 6 l-6 -30 v70 h-92 v-70 l-6 30 l-26 -6 z" fill="#c9a37a"/><path d="M34 60 q66 -30 132 0 l-8 46 q-58 -18 -116 0 z" fill="#b8905f" opacity=".35"/><path d="M72 52 q28 22 56 0 q-28 -14 -56 0z" fill="#8f6a3c"/><path d="M72 52 q28 22 56 0" stroke="#7b5a30" stroke-width="3" fill="none"/><path d="M54 176 h92" stroke="#b08a5a" stroke-width="6" stroke-dasharray="3 3"/><path d="M46 106 l-6 30 M154 106 l6 30" stroke="#b08a5a" stroke-width="2"/></svg>`,
  squarewatch: `<svg viewBox="0 0 200 200"><ellipse cx="100" cy="186" rx="40" ry="6" fill="#000" opacity=".08"/><rect x="72" y="8" width="56" height="48" rx="8" fill="#3b2a1e"/><rect x="72" y="144" width="56" height="48" rx="8" fill="#3b2a1e"/><rect x="78" y="14" width="44" height="36" rx="5" fill="none" stroke="#5b4231" stroke-width="2"/><rect x="78" y="150" width="44" height="36" rx="5" fill="none" stroke="#5b4231" stroke-width="2"/><rect x="58" y="56" width="84" height="88" rx="14" fill="#d9dadf" stroke="#9a9ba4" stroke-width="2"/><rect x="68" y="66" width="64" height="68" rx="8" fill="#f7f7f9" stroke="#b9bac2" stroke-width="1.5"/><g fill="#9a9ba4"><circle cx="66" cy="64" r="3"/><circle cx="134" cy="64" r="3"/><circle cx="66" cy="136" r="3"/><circle cx="134" cy="136" r="3"/></g><g stroke="#2a2a2e" stroke-width="2"><path d="M100 72v6M100 122v6M74 100h6M120 100h6"/></g><path d="M100 100 L100 78" stroke="#2a5bd7" stroke-width="3.5" stroke-linecap="round"/><path d="M100 100 L118 108" stroke="#2a5bd7" stroke-width="3" stroke-linecap="round"/><circle cx="100" cy="100" r="3" fill="#2a5bd7"/><rect x="140" y="94" width="8" height="12" rx="2" fill="#9a9ba4"/><circle cx="146" cy="100" r="2" fill="#2a5bd7"/></svg>`,
  gmtwatch: `<svg viewBox="0 0 200 200"><ellipse cx="100" cy="188" rx="36" ry="5" fill="#000" opacity=".08"/><g fill="#c9cad1" stroke="#9a9ba4" stroke-width="1.5"><rect x="72" y="4" width="56" height="18" rx="3"/><rect x="76" y="22" width="48" height="16" rx="3"/><rect x="76" y="162" width="48" height="16" rx="3"/><rect x="72" y="178" width="56" height="18" rx="3"/></g><circle cx="100" cy="100" r="60" fill="#d9dadf" stroke="#9a9ba4" stroke-width="2"/><path d="M100 46 a54 54 0 0 1 54 54 h-14 a40 40 0 0 0 -40 -40 z" fill="#1d3f8f"/><path d="M100 46 a54 54 0 0 0 -54 54 h14 a40 40 0 0 1 40 -40 z" fill="#1d3f8f"/><path d="M46 100 a54 54 0 0 0 108 0 h-14 a40 40 0 0 1 -80 0 z" fill="#b4262a"/><circle cx="100" cy="100" r="40" fill="#121216"/><g fill="#e9f0d8"><circle cx="100" cy="66" r="3"/><circle cx="100" cy="134" r="3"/><circle cx="66" cy="100" r="3"/><circle cx="134" cy="100" r="3"/><circle cx="124" cy="76" r="2.4"/><circle cx="76" cy="76" r="2.4"/><circle cx="124" cy="124" r="2.4"/><circle cx="76" cy="124" r="2.4"/></g><path d="M100 100 L100 72" stroke="#e9e9ee" stroke-width="3.5" stroke-linecap="round"/><path d="M100 100 L120 112" stroke="#e9e9ee" stroke-width="3" stroke-linecap="round"/><path d="M100 100 L80 80" stroke="#d93a3a" stroke-width="2.5" stroke-linecap="round"/><circle cx="100" cy="100" r="3" fill="#e9e9ee"/><rect x="158" y="95" width="8" height="10" rx="2" fill="#9a9ba4"/></svg>`,
  /* neutral stand-in for an item with no photo and no sketch of its own (e.g. just added in admin) */
  box: `<svg viewBox="0 0 200 200"><ellipse cx="100" cy="172" rx="64" ry="9" fill="#000" opacity=".08"/><rect x="50" y="96" width="100" height="72" rx="5" fill="#e4d4b4"/><rect x="50" y="98" width="100" height="9" fill="#000" opacity=".06"/><rect x="42" y="76" width="116" height="24" rx="5" fill="#efe4cc"/><rect x="92" y="76" width="16" height="92" fill="#c9a06b"/><path d="M100 76C88 52 62 50 64 66c2 9 18 12 36 10zM100 76c12-24 38-26 36-10-2 9-18 12-36 10z" fill="#c9a06b"/><circle cx="100" cy="75" r="7" fill="#b38a55"/></svg>`,
};
/* ===================================================================== */
const app = document.getElementById('app');
const $ = (sel, root) => (root || document).querySelector(sel);
const L = () => app.classList.contains('ru') ? 'ru' : 'en';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/* bilingual string → two spans; data text is escaped, `raw` only for site strings that carry markup (<i>, &nbsp;) */
const t = (v, raw) => {
  const f = raw ? (x) => x : esc;
  if (v && typeof v === 'object') return `<span class="l-en" lang="en">${f(v.en ?? '')}</span><span class="l-ru" lang="ru">${f(v.ru ?? v.en ?? '')}</span>`;
  return v == null ? '' : f(v);
};
/* the same value as plain text in one language (tab title); a plain string serves both */
const pick = (v, l) => v && typeof v === 'object' ? String(v[l] ?? v.en ?? '') : (v == null ? '' : String(v));
const art = (k) => (ART[k] || ART.box).replace('<svg ', '<svg width="100%" height="100%" ');
const safeUrl = (u) => (typeof u === 'string' && /^https?:\/\//i.test(u)) ? u : null;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const MARK = { y: '✓', g: '~', n: '✗' };
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

let DATA = null;   // { site, tiers, ui, items }
/* booking API (Cloudflare Worker). The page stays static; without an API the booking UI simply isn't shown. */
const LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
let API = '', LIST = 'dmitri';
const tokKey = (id) => `bk:${LIST}:${id}`;
/* cancel tokens: localStorage, plus memory for this page view (storage blocked, e.g. Safari "Block All Cookies") */
const MEM = new Map();
function myToken(id) { try { const v = localStorage.getItem(tokKey(id)); if (v) return v; } catch (e) {} return MEM.get(tokKey(id)) || null; }
function keepToken(id, tok) { MEM.set(tokKey(id), tok); try { localStorage.setItem(tokKey(id), tok); } catch (e) {} }
function forgetToken(id) { MEM.delete(tokKey(id)); try { localStorage.removeItem(tokKey(id)); } catch (e) {} }

/* ---------- sound (assets/sounds.js, a port of Velvet UI): the pill is the visible, remembered mute ---------- */
const snd = (role, voice) => { if (window.Sound) window.Sound.play(role, voice); };
const GATE = { on: { en: 'Sound on', ru: 'Звук вкл' }, off: { en: 'Sound off', ru: 'Звук выкл' } };   // before the list loads, or if it never does
function renderGate() {
  const g = $('#soundGate'); if (!g || !window.Sound) return;
  const on = window.Sound.enabled;
  g.setAttribute('aria-pressed', on ? 'true' : 'false');
  const ui = (DATA && DATA.ui) || {};
  g.querySelector('.gate-label').innerHTML = t(on ? ui.soundOn || GATE.on : ui.soundOff || GATE.off);
}
$('#soundGate') && $('#soundGate').addEventListener('click', () => {
  if (!window.Sound) return;
  const on = !window.Sound.enabled;
  window.Sound.setEnabled(on);
  if (on) snd('ui.confirm', 'signature');
  renderGate();
});

/* ---------- language: the Velvet "state change" switch (off = EN, on = RU) with its detent sound ---------- */
const TITLE0 = { en: 'Wishlist 2026 · Dmitri', ru: 'Вишлист 2026 · Дима' };   // the tab title before the list loads, or if it never does
function setLang(l, save) {
  app.classList.toggle('ru', l === 'ru');
  document.documentElement.lang = l;
  const sw = $('#langToggle');
  if (sw) { sw.classList.toggle('is-on', l === 'ru'); sw.setAttribute('aria-checked', l === 'ru' ? 'true' : 'false'); }
  document.querySelectorAll('.lsw-lbl').forEach(b => b.classList.toggle('on', b.dataset.lang === l));
  if (DATA) { const o = pick(DATA.site.owner, l); document.title = pick(DATA.site.title, l).replace(/<[^>]+>/g, '') + (o ? ' · ' + o : ''); }
  else document.title = pick(TITLE0, l);
  if (l === 'ru') preloadCyrillic();
  if (save) { try { localStorage.setItem('wl-lang', l); } catch (e) {} }
  renderGate();
}
function preloadCyrillic() {
  if (preloadCyrillic.done) return; preloadCyrillic.done = true;
  for (const f of ['lora-cyrillic', 'lora-italic-cyrillic']) {
    const l = document.createElement('link');
    l.rel = 'preload'; l.as = 'font'; l.type = 'font/woff2'; l.crossOrigin = 'anonymous'; l.href = `assets/fonts/${f}.woff2`;
    document.head.appendChild(l);
  }
}
let lang = 'en';
try { lang = localStorage.getItem('wl-lang') || ((navigator.language || '').toLowerCase().startsWith('ru') ? 'ru' : 'en'); } catch (e) {}
setLang(lang, false);
const switchLang = () => { const l = L() === 'ru' ? 'en' : 'ru'; setLang(l, true); snd(l === 'ru' ? 'toggle.on' : 'toggle.off', 'signature'); };
$('#langToggle') && $('#langToggle').addEventListener('click', switchLang);
document.querySelectorAll('.lsw-lbl').forEach(b => b.addEventListener('click', () => { if (b.dataset.lang !== L()) switchLang(); }));

/* ---------- title letters: one span per letter, grouped per word (.w, nowrap) so a line only breaks between words ---------- */
function renderTitle(title) {
  const h = $('#title');
  const key = JSON.stringify(title); if (key === renderTitle.key) return;   // same title: don't replay the letters
  renderTitle.key = key;
  const mk = (txt, cls) => {
    let i = 0, out = '', w = '';
    const end = () => { if (w) out += `<span class="w">${w}</span>`; w = ''; };
    for (const part of String(txt).split(/(<i>.*?<\/i>)/)) {
      if (!part) continue;
      const ital = part.startsWith('<i>');
      const chars = part.replace(/<\/?i>/g, '');
      for (const ch of chars) {
        if (ch === ' ') { end(); out += ' '; i++; continue; }
        const c = `<span class="ch" style="--i:${i++}">${esc(ch)}</span>`;
        w += ital ? `<i>${c}</i>` : c;
      }
    }
    end();
    return `<span class="${cls}">${out}</span>`;
  };
  h.innerHTML = mk(title.en, 'l-en') + mk(title.ru, 'l-ru');
}

/* ---------- site strings (everything editable lives in data/items.json) ---------- */
function renderSite(site) {
  renderTitle(site.title);
  $('.brand').innerHTML = t(site.brand);
  $('.tag').innerHTML = t(site.tagline);
  $('.legend').innerHTML = t(site.legend, true);
  $('footer .txt').innerHTML = t(site.footer);
  setLang(L(), false);
}

/* ---------- tier nav ---------- */
function renderNav(tiers) {
  const nav = $('#tiernav');
  nav.innerHTML = tiers.map(tr => `<a href="#tier-${esc(tr.id)}" style="--c:${esc(tr.c)}"><span class="dot"></span>${t(tr.name)}</a>`).join('');
  nav.addEventListener('click', (e) => {
    const a = e.target.closest('a'); if (!a) return; e.preventDefault();
    const el = document.querySelector(a.getAttribute('href'));
    if (el) el.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'start' });
  });
}

/* ---------- cards ---------- */
const CROSS = `<svg class="cross" viewBox="0 0 100 140" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M13 15 C 22 29, 30 42, 43 60 S 70 103, 88 126"/><path pathLength="1" d="M88 13 C 75 33, 63 53, 50 72 S 24 110, 11 128"/></svg>`;
const FX = `<div class="fx" aria-hidden="true"><i class="foil"></i><i class="glit"></i><i class="glare"></i><i class="gloss"></i><i class="sweep"></i></div>`;
const ribbonHTML = (id) => `<div class="ribbon" id="b-${esc(id)}">${t(DATA.ui.booked)}</div>`;

function imgHTML(it, cls, eager) {
  const photo = it.kind === 'photo';
  if (!it.image) {
    return `<div class="${cls}">${art(it.illustration)}<span class="sketch">${t(DATA.ui.sketch)}</span></div>`;
  }
  const dim = it.w && it.h ? ` width="${+it.w}" height="${+it.h}"` : '';
  return `<div class="${cls}${photo ? ' photo' : ''}"><img src="${esc(it.image)}" alt=""${dim} loading="${eager ? 'eager' : 'lazy'}" decoding="async"></div>`;
}
function thumbHTML(it) {
  const photo = it.kind === 'photo';
  if (!it.image) return `<div class="thumb">${art(it.illustration)}</div>`;
  return `<div class="thumb${photo ? ' photo' : ''}"><img src="${esc(it.image)}" alt="" loading="lazy" decoding="async"></div>`;
}
/* got it: the back drops price, availability and shops — just the stamp and a handwritten thank-you (text editable in admin → Texts) */
/* a longer note is written smaller, so the stamp and the signature stay on the card (past 13 px the note's end clips) */
const HAND_FIT = { en: 92, ru: 82 };   // characters that fit at 21 px on the smallest card (232 px), with a margin
const hand = (note, l) => Math.floor(clamp(21 * Math.sqrt(HAND_FIT[l] / Math.max(1, pick(note, l).length)), 13, 21) * 2) / 2;
function gotBackHTML(it, ui) {
  const note = ui.gotNote || { en: 'Thank you!', ru: 'Спасибо!' };
  return `<div class="face back got-back" inert>
            ${FX}
            <div class="gb-name">${t(it.name)}</div>
            <div class="gb-mid">
              <span class="stamp">${t(ui.got)} <span aria-hidden="true">✓</span></span>
              <p class="thanks" style="--hen:${hand(note, 'en')}px;--hru:${hand(note, 'ru')}px">${t(note)}</p>
              ${ui.gotSign ? `<p class="sign">${t(ui.gotSign)}</p>` : ''}
            </div>
            <div class="bfoot"><span></span><button type="button" class="hint"><span class="sr">${t(ui.back)}</span><span aria-hidden="true">↻</span></button></div>
          </div>`;
}
function cardHTML(it, tier, idx, ri, eager) {
  const ui = DATA.ui;
  const av = ['eu', 'tr', 'ru'].map(k => {
    let v = it.avail && it.avail[k]; if (!MARK[v]) v = 'n';
    return `<span class="${v}"><b>${MARK[v]}</b><small>${t(ui[k])}</small></span>`;
  }).join('');
  const where = (it.where || []).map(w => {
    const label = t(w.t), u = safeUrl(w.u);
    return `<li>${u ? `<a href="${esc(u)}" target="_blank" rel="noopener">${label}</a>` : `<span>${label}</span>`}</li>`;
  }).join('');
  const pins = [tier.pin, '#c9a06b', '#d9b88a'];
  const pin = pins[idx % pins.length];
  const dur = (3.2 + ((idx * 37) % 14) / 10).toFixed(2) + 's';
  const delay = (-((idx * 53) % 30) / 10).toFixed(2) + 's';
  const tilt = (((idx * 7) % 5) - 2) + 'deg';
  const got = it.status === 'got';
  const booked = !got && !!it.booked;
  const id = esc(it.id);
  return `
  <div class="drop" style="--i:${ri}">
    <div class="hang" style="--dur:${dur};--delay:${delay}">
      <div class="sway">
        <svg class="clip" style="--pin:${esc(pin)};--tilt:${tilt}" aria-hidden="true"><use href="#pin"/></svg>
        <div class="card${got ? ' got' : ''}${booked ? ' booked' : ''}" data-id="${id}">
          <div class="face front" style="--c:${esc(tier.c)}" role="button" tabindex="0" aria-labelledby="n-${id}${got ? ` s-${id}` : ''}${booked ? ` b-${id}` : ''}" aria-expanded="false">
            <div class="price">${t(it.price)}</div>
            ${got ? `<div class="stamp" id="s-${id}">${t(ui.got)} <span aria-hidden="true">✓</span></div>` : ''}
            ${imgHTML(it, 'imgbox', eager)}
            <h3 class="name" id="n-${id}">${t(it.name)}</h3>
            <p class="desc">${t(it.desc)}</p>
            <div class="foot"><span class="tier-lbl"><i class="tr"></i>${t(tier.short || tier.name)}</span><span class="tap">${t(ui.tap)} ↻</span></div>
            ${got ? CROSS : ''}${booked ? ribbonHTML(it.id) : ''}
          </div>
          ${got ? gotBackHTML(it, ui) : `<div class="face back" inert>
            ${FX}
            <div class="hd">${thumbHTML(it)}<div><div class="lbl">${t(ui.approx)}</div><div class="note">${t(it.note || '')}</div></div></div>
            <div class="big">${t(it.price)}</div>
            <div class="avail">${av}</div>
            <div class="where"><div class="lbl">${t(ui.where)}</div><ul>${where}</ul></div>
            <div class="bfoot"><div class="bk">${bookPart(it)}</div><button type="button" class="hint"><span class="sr">${t(ui.back)}</span><span aria-hidden="true">↻</span></button></div>
          </div>`}
        </div>
      </div>
    </div>
  </div>`;
}

const WIRE = `<svg class="wire" viewBox="0 0 100 36" preserveAspectRatio="none" aria-hidden="true"><path d="M0 8 Q 50 32 100 8"/><path class="hi" d="M0 8 Q 50 32 100 8"/></svg><span class="nail l"></span><span class="nail r"></span>`;

function cardWidth() {
  let p = $('.cwprobe');
  if (!p) { p = document.createElement('div'); p.className = 'cwprobe'; document.body.appendChild(p); }
  return p.offsetWidth || 232;
}
function layoutKey() {
  const main = $('#tiers');
  const mobile = window.innerWidth < 720;
  if (mobile) return { mobile, perRow: Infinity, key: 'm' };
  const cw = cardWidth();
  const gap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--gap')) || 22;
  const W = Math.min(main.clientWidth || window.innerWidth, 1320) - 56;
  const perRow = Math.max(1, Math.floor((W + gap) / (cw + gap)));
  return { mobile, perRow, key: 'd' + perRow };
}
/* quiet: a late live list replacing what's on screen — open cards stay open, rows already shown don't drop in again */
function layout(force, quiet) {
  if (!DATA) return;
  const { mobile, perRow, key } = layoutKey();
  if (!force && key === layout.key) return;   // same column count → keep flipped cards, focus and row scroll
  layout.key = key;
  const main = $('#tiers');
  const visible = DATA.items.filter(i => i && i.status !== 'dropped').sort((a, b) => (a.order || 0) - (b.order || 0));
  const known = new Set(DATA.tiers.map(tr => tr.id));
  visible.filter(i => !known.has(i.tier)).forEach(i => console.warn('item with unknown tier skipped:', i.id, i.tier));
  let html = '', eagerLeft = 4;
  for (const tier of DATA.tiers) {
    const items = visible.filter(i => i.tier === tier.id);
    if (!items.length) continue;
    const rows = [];
    for (let i = 0; i < items.length; i += perRow) rows.push(items.slice(i, i + perRow));
    html += `<section class="tier" id="tier-${esc(tier.id)}">
      <div class="tier-head">
        <h2><span class="dot" style="--c:${esc(tier.c)}"></span>${t(tier.name)}</h2>
        <span class="range">${t(tier.range)}</span>
        <span class="count">${items.length} ${t(DATA.ui.things)}</span>
        <div class="blurb">${t(tier.blurb)}</div>
      </div>
      ${rows.map(r => `<div class="scroller${mobile ? '' : ' fits'}"><div class="row pre">${WIRE}${r.map((it, i) => cardHTML(it, tier, items.indexOf(it), i, eagerLeft-- > 0)).join('')}</div></div>${mobile ? `<div class="swipe">${t(DATA.ui.swipe)}</div>` : ''}`).join('')}
    </section>`;
  }
  const open = quiet ? [...main.querySelectorAll('.card.flipped')].map(c => c.dataset.id) : [];
  /* the guest's place in each scrolled row: the card they were looking at (flipped, else nearest the middle) and where it sat */
  const rowKey = (s) => s.closest('.tier').id + ':' + [...s.closest('.tier').querySelectorAll('.scroller')].indexOf(s);
  const anchors = quiet ? [...main.querySelectorAll('.scroller')].filter(s => s.scrollLeft || s.querySelector('.card.flipped')).map(s => {
    const drops = [...s.querySelectorAll('.drop')], mid = s.scrollLeft + s.clientWidth / 2, dist = (x) => Math.abs(x.offsetLeft + x.offsetWidth / 2 - mid);
    const fl = drops.filter(x => x.querySelector('.card.flipped') && dist(x) < s.clientWidth / 2), d = (fl.length ? fl : drops).reduce((a, b) => dist(b) < dist(a) ? b : a);
    return { key: rowKey(s), px: s.scrollLeft, id: d.querySelector('.card').dataset.id, off: d.offsetLeft - s.scrollLeft };
  }) : [];
  stopTilt(); cancelAnimationFrame(tiltRaf); tiltRaf = 0; tiltEv = null;
  activeCard = null;
  main.innerHTML = html;
  open.forEach(id => { const c = main.querySelector(`.card[data-id="${CSS.escape(id)}"]`); if (c) flip(c, true); });   // before any style is computed: no flip animation
  /* sag: cards in the middle of a wire hang lower and swing a little more */
  main.querySelectorAll('.row').forEach(row => {
    const rw = row.scrollWidth;
    row.querySelectorAll('.drop').forEach(d => {
      const x = d.offsetLeft + d.offsetWidth / 2;
      const tt = Math.max(0, Math.min(1, x / rw));
      d.querySelector('.hang').style.setProperty('--sag', (48 * tt * (1 - tt)).toFixed(1));
      d.style.setProperty('--amp', (0.85 + 1.2 * tt * (1 - tt)).toFixed(2));
    });
  });
  anchors.forEach(a => {   // same card at the same spot; the row's old offset if the card is gone or moved to another row
    const c = main.querySelector(`.card[data-id="${CSS.escape(a.id)}"]`), cs = c && c.closest('.scroller');
    const d = cs && rowKey(cs) === a.key ? c.closest('.drop') : null;
    const s = d ? cs : [...main.querySelectorAll('.scroller')].find(x => rowKey(x) === a.key);
    if (s) s.scrollLeft = d ? d.offsetLeft - a.off : a.px;
  });
  bindSway();
  if (quiet) { const h = window.innerHeight || 800; main.querySelectorAll('.row.pre').forEach(r => { if (r.getBoundingClientRect().top < h * 0.96) r.classList.replace('pre', 'still'); }); }
  /* drop-in when a row scrolls into view */
  requestAnimationFrame(reveal); setTimeout(reveal, 120); setTimeout(reveal, 600);
}
function reveal() {
  const h = window.innerHeight || 800;
  document.querySelectorAll('.row.pre').forEach(r => {
    const b = r.getBoundingClientRect();
    if (b.top < h * 0.96 && b.bottom > 0) { r.classList.remove('pre'); r.classList.add('in'); }
  });
}
window.addEventListener('scroll', reveal, { passive: true });
window.addEventListener('resize', reveal, { passive: true });
let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => layout(false), 180); });

/* ---------- wire: a damped spring per row, kicked by page scroll and by swiping a row ---------- */
const SW = { rows: [], raf: 0, prev: 0, lastY: window.scrollY, lastT: 0, io: null, cio: null };
const K = 60, C = 7, VMAX = 60, AMAX = 5;     // stiffness, damping, max deg/s, max deg
function bindSway() {
  if (SW.io) SW.io.disconnect();
  if (SW.cio) SW.cio.disconnect();
  SW.rows = [...document.querySelectorAll('.row')].map(el => {
    const sc = el.parentElement;
    const r = { el, sc, sways: [...el.querySelectorAll('.sway')], a: 0, v: 0, k: '0.00', vis: false, lastX: sc.scrollLeft, lastT: 0 };
    if (!sc.classList.contains('fits')) sc.addEventListener('scroll', () => {
      const now = performance.now(), dt = Math.max(16, now - (r.lastT || now - 16)) / 1000;
      const vx = (sc.scrollLeft - r.lastX) / dt; r.lastX = sc.scrollLeft; r.lastT = now;
      if (vx) kick(r, -vx * 0.02);             // cards lag behind the hand (a restored position fires once with none)
    }, { passive: true });
    return r;
  });
  if ('IntersectionObserver' in window) {
    SW.io = new IntersectionObserver(es => es.forEach(e => { const r = SW.rows.find(x => x.el === e.target); if (r) r.vis = e.isIntersecting; }), { rootMargin: '120px 0px' });
    SW.rows.forEach(r => SW.io.observe(r.el));
    /* per card: out of view (below the fold, or scrolled away inside its row) → .off pauses its idle swing (app.css) */
    SW.cio = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('off', !e.isIntersecting)), { rootMargin: '120px 80px' });
    document.querySelectorAll('.drop').forEach(d => SW.cio.observe(d));
  } else SW.rows.forEach(r => { r.vis = true; });
}
function kick(r, dv) {
  if (reduced.matches) return;
  r.v = clamp(r.v + clamp(dv, -VMAX, VMAX), -VMAX * 1.5, VMAX * 1.5);
  r.el.classList.add('swinging');
  if (!SW.raf) { SW.prev = 0; SW.raf = requestAnimationFrame(swayStep); }
}
function swayStep(now) {
  const dt = Math.min(0.05, (now - (SW.prev || now - 16)) / 1000); SW.prev = now;
  let alive = false;
  for (const r of SW.rows) {
    r.v += (-K * r.a - C * r.v) * dt; r.a = clamp(r.a + r.v * dt, -AMAX, AMAX);
    if (Math.abs(r.a) > 0.02 || Math.abs(r.v) > 0.3) alive = true;
    else if (r.a || r.v) { r.a = 0; r.v = 0; r.el.classList.remove('swinging'); }
    const k = r.a.toFixed(2);
    if (k !== r.k) { r.k = k; for (const el of r.sways) el.style.setProperty('--kick', k); }
  }
  SW.raf = alive ? requestAnimationFrame(swayStep) : 0;
}
window.addEventListener('scroll', () => {
  const now = performance.now(), dt = Math.max(16, now - (SW.lastT || now - 16)) / 1000;
  const vy = (window.scrollY - SW.lastY) / dt; SW.lastY = window.scrollY; SW.lastT = now;
  if (Math.abs(vy) < 60) return;
  for (const r of SW.rows) if (r.vis) kick(r, vy * 0.012);
}, { passive: true });

/* ---------- flip ---------- */
let activeCard = null;
document.addEventListener('click', (e) => {
  if (e.target.closest('a')) return;
  const bb = e.target.closest('.bk-btn'); if (bb) { openSheet(bb.dataset.id); return; }
  const ub = e.target.closest('.bk-undo'); if (ub) { undo(ub); return; }
  const card = e.target.closest('.card'); if (!card) return;
  flip(card);
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  if (e.target.closest && e.target.closest('a, button')) return;   // links and real buttons act on their own
  const face = e.target.closest && e.target.closest('.face'); if (!face) return;
  e.preventDefault(); flip(face.closest('.card'));
});
function flip(card, quiet) {
  card.classList.add('anim');
  const flipped = card.classList.toggle('flipped');
  if (!quiet) snd(flipped ? 'toggle.on' : 'toggle.off', 'crisp');   /* the "crisp" voice: a short bright tick for the flip */
  const front = card.querySelector('.front'), back = card.querySelector('.back');
  front.toggleAttribute('inert', flipped); back.toggleAttribute('inert', !flipped);
  front.setAttribute('aria-expanded', flipped ? 'true' : 'false');
  if (document.activeElement && card.contains(document.activeElement)) (flipped ? back.querySelector('.hint') : front).focus({ preventScroll: true });
  if (flipped) {
    if (activeCard && activeCard !== card) { activeCard.classList.remove('active'); release(activeCard); }
    activeCard = card; card.classList.add('active');
    clearTimeout(card._r); card.classList.remove('release', 'live');
    tiltBase = null; startTilt();
  } else {
    card.classList.remove('active');
    release(card);
    if (activeCard === card) { activeCard = document.querySelector('.card.flipped'); if (activeCard) activeCard.classList.add('active'); }
    if (!activeCard) stopTilt();
  }
  const row = SW.rows.find(x => x.el.contains(card)); if (row) kick(row, flipped ? 12 : -12);   /* the flick also rocks the card on its pin */
  clearTimeout(card._t); card._t = setTimeout(() => card.classList.remove('anim'), 650);
}

/* ---------- holo: light follows the pointer (desktop) or the phone's tilt; springs back when let go ---------- */
function setPointer(card, x, y) {          // x, y: offset from the card centre, -0.5 … 0.5
  x = clamp(x, -0.5, 0.5); y = clamp(y, -0.5, 0.5);
  const s = card.style;
  s.setProperty('--px', x.toFixed(3)); s.setProperty('--py', y.toFixed(3));
  s.setProperty('--mx', (50 + x * 100).toFixed(1) + '%'); s.setProperty('--my', (50 + y * 100).toFixed(1) + '%');
  s.setProperty('--d', clamp(Math.hypot(x, y) * 2, 0, 1).toFixed(3));
  s.setProperty('--ry', (x * 16).toFixed(2) + 'deg');
  s.setProperty('--rx', (-y * 12).toFixed(2) + 'deg');
}
function engage(card) { clearTimeout(card._r); card.classList.remove('release'); card.classList.add('live'); }
function release(card) {
  card.classList.add('release');
  setPointer(card, 0, 0);
  clearTimeout(card._r); card._r = setTimeout(() => card.classList.remove('release', 'live'), 850);
}
if (finePointer.matches && !reduced.matches) {
  document.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    const card = e.target.closest && e.target.closest('.card'); if (!card) return;
    engage(card);
    const r = card.getBoundingClientRect();
    setPointer(card, (e.clientX - r.left) / r.width - 0.5, (e.clientY - r.top) / r.height - 0.5);
  }, { passive: true });
  document.addEventListener('pointerout', (e) => {
    const card = e.target.closest && e.target.closest('.card'); if (!card) return;
    if (e.relatedTarget && card.contains(e.relatedTarget)) return;
    release(card);
  });
}

/* phones: gyroscope. Android: no prompt. iPhone: Safari asks for motion access — only after the guest taps
   "Turn on" in a one-time pill, never on a card tap. Cosmetic only; the foil drifts on its own without it. */
let tiltOn = false, tiltAllowed = false, tiltBase = null, tiltEv = null, tiltRaf = 0, tiltHinted = false, tiltOffered = false;
function startTilt() {
  if (tiltOn || reduced.matches || finePointer.matches || typeof DeviceOrientationEvent === 'undefined') return;
  if (typeof DeviceOrientationEvent.requestPermission !== 'function' || tiltAllowed) return listenTilt();
  offerTilt();
}
function offerTilt() {
  let asked = null; try { asked = sessionStorage.getItem('wl-gyro'); } catch (e) {}
  if (asked || tiltOffered || !DATA || !DATA.ui.tiltAsk) return;
  tiltOffered = true;
  const el = document.createElement('div');
  el.className = 'toast'; el.setAttribute('role', 'status');
  el.innerHTML = `<span>${t(DATA.ui.tiltAsk)}</span><button type="button">${t(DATA.ui.tiltOn)}</button>`;
  app.appendChild(el);
  let closed = false;
  const close = () => { if (closed) return; closed = true; el.classList.add('out'); setTimeout(() => el.remove(), 300); };
  el.querySelector('button').addEventListener('click', () => {
    DeviceOrientationEvent.requestPermission().then(r => {      // called right in the tap, as Safari requires
      try { sessionStorage.setItem('wl-gyro', r); } catch (e) {}
      if (r === 'granted') { tiltAllowed = true; if (activeCard) listenTilt(); }
    }).catch(() => {}).finally(close);
  });
  setTimeout(close, 9000);
}
function listenTilt() { if (tiltOn) return; tiltOn = true; window.addEventListener('deviceorientation', onTilt, { passive: true }); }
function stopTilt() { if (!tiltOn) return; tiltOn = false; tiltBase = null; window.removeEventListener('deviceorientation', onTilt); }
function onTilt(e) {
  if (e.gamma == null || e.beta == null) return;
  tiltEv = e; if (!tiltRaf) tiltRaf = requestAnimationFrame(applyTilt);
}
function applyTilt() {
  tiltRaf = 0;
  const card = activeCard, e = tiltEv;
  if (!card || !card.classList.contains('flipped') || !e) { tiltBase = null; return; }
  const ang = (screen.orientation && typeof screen.orientation.angle === 'number') ? screen.orientation.angle : (window.orientation || 0);
  let x = e.gamma, y = e.beta;
  if (ang === 90) { x = e.beta; y = -e.gamma; }
  else if (ang === -90 || ang === 270) { x = -e.beta; y = e.gamma; }
  else if (ang === 180) { x = -e.gamma; y = -e.beta; }
  if (!tiltBase) { tiltBase = { x, y }; hintTilt(card); return; }   // relative to how the phone was held at the flip
  engage(card);
  setPointer(card, (x - tiltBase.x) / 32, (y - tiltBase.y) / 36);  // ±16° / ±18° of tilt = full travel
}
function hintTilt(card) {
  if (tiltHinted || !DATA || !DATA.ui.tilt) return; tiltHinted = true;
  const back = card.querySelector('.back');
  back.insertAdjacentHTML('beforeend', `<span class="tilt-hint">${t(DATA.ui.tilt)}</span>`);
  setTimeout(() => { const h = back.querySelector('.tilt-hint'); if (h) h.remove(); }, 3000);
}

/* ---------- booking: "I'll get this" → bottom sheet → one active booking per item (server-enforced) ---------- */
function bookPart(it) {
  if (!API || !DATA || it.status === 'got') return '';
  const ui = DATA.ui, id = esc(it.id);
  if (it.booked && myToken(it.id)) return `<button type="button" class="bk-undo" data-id="${id}"><span>${t(ui.bookedByYou)}</span><small>${t(ui.unbook)}</small></button>`;
  if (it.booked) return `<span class="bk-state">${t(ui.bookedTaken || ui.booked)}</span>`;
  return `<button type="button" class="bk-btn" data-id="${id}">${t(ui.bookBtn)}</button>`;
}
function setBooked(it, booked) {
  it.booked = !!booked;
  if (!booked) forgetToken(it.id);
  const card = document.querySelector(`.card[data-id="${CSS.escape(it.id)}"]`); if (!card) return;
  const got = it.status === 'got', show = !got && it.booked;
  card.classList.toggle('booked', show);
  const rib = card.querySelector('.front .ribbon');
  if (show && !rib) card.querySelector('.front').insertAdjacentHTML('beforeend', ribbonHTML(it.id));
  if (!show && rib) rib.remove();
  card.querySelector('.front').setAttribute('aria-labelledby', `n-${it.id}${got ? ` s-${it.id}` : ''}${show ? ` b-${it.id}` : ''}`);
  const bk = card.querySelector('.bk'); if (bk) bk.innerHTML = bookPart(it);
}
let bookingsAt = 0, bkSeq = 0;
const touched = new Map();   // item id → bkSeq when this phone last booked or undid it
/* first 12 hex chars of sha256(token): the Worker lists the same prefix per active booking, so a key left over from an
   older booking (cleared by the owner, since rebooked by someone else) is recognised as not ours */
async function tokHash(tok) {
  try { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(tok)); return [...new Uint8Array(b, 0, 6)].map(x => x.toString(16).padStart(2, '0')).join(''); }
  catch (e) { return null; }
}
async function refreshBookings() {
  if (!API || !DATA) return;
  bookingsAt = Date.now();
  const seq = ++bkSeq;
  try {
    const r = await fetch(`${API}/api/lists/${encodeURIComponent(LIST)}/bookings`, { cache: 'no-store' });
    if (!r.ok) return;
    const j = (await r.json()) || {}, set = new Set(j.booked || []), k = j.k || {};
    const stale = new Set();
    await Promise.all(DATA.items.map(async it => { const tok = k[it.id] && myToken(it.id); if (tok) { const h = await tokHash(tok); if (h && h !== k[it.id]) stale.add(it.id); } }));
    DATA.items.forEach(it => {
      if ((touched.get(it.id) || 0) > seq) return;   // booked/undone here after this request left: the answer is older than what we know
      if (stale.has(it.id)) { forgetToken(it.id); setBooked(it, true); return; }   // booked, but by someone else now
      if (!!it.booked !== set.has(it.id) || (!set.has(it.id) && myToken(it.id))) setBooked(it, set.has(it.id));
    });
  } catch (e) { /* offline: keep what we have */ }
}
document.addEventListener('visibilitychange', () => { if (!document.hidden && Date.now() - bookingsAt > 15000) refreshBookings(); });

let sheet = null, sheetItem = null;
function ensureSheet() {
  if (sheet) return sheet;
  const ui = DATA.ui;
  sheet = document.createElement('dialog');
  sheet.className = 'sheet';
  sheet.setAttribute('aria-labelledby', 'sheet-title');
  sheet.innerHTML = `<form class="sheet-in" method="dialog" novalidate>
    <div class="sheet-grab"><div class="grabber" aria-hidden="true"></div>
    <div class="sheet-top"><button type="button" class="sheet-cancel">${t(ui.cancel)}</button><h2 id="sheet-title">${t(ui.bookTitle)}</h2><span aria-hidden="true"></span></div></div>
    <p class="sheet-item"></p>
    <label class="sheet-label"><span>${t(ui.bookName)}</span><input name="name" type="text" maxlength="40" autocomplete="name" autocapitalize="words" enterkeyhint="done"></label>
    <p class="sheet-help">${t(ui.bookHelp)}</p>
    <p class="sheet-err" role="alert" hidden></p>
    <div class="confirm-stage">
      <button type="submit" class="complete-confirm sheet-go"><span class="complete-spinner" aria-hidden="true"></span><span class="cc-label">${t(ui.bookConfirm)}</span></button>
      <div class="confirmation-success" aria-hidden="true"><svg class="confirmation-check" viewBox="0 0 96 96"><path d="M28 50.5 42.5 65 69 34"/></svg><span>${t(ui.bookedDone || ui.booked)}</span></div>
    </div>
    <p class="sr" role="status" id="bk-status"></p>
  </form>`;
  app.appendChild(sheet);
  sheet.querySelector('.sheet-cancel').addEventListener('click', closeSheet);
  sheet.addEventListener('click', (e) => { if (e.target === sheet) closeSheet(); });   // tap on the dimmed backdrop
  /* while a booking is in flight the sheet stays: its answer must land on this item (Esc, Android back) */
  sheet.addEventListener('cancel', (e) => { if (booking) e.preventDefault(); });
  sheet.addEventListener('close', () => {   // a forced close (second Esc/back) reopens it, without raising the phone keyboard
    if (!booking) return;
    sheet.showModal();
    if (!finePointer.matches && document.activeElement) document.activeElement.blur();
  });
  sheet.querySelector('form').addEventListener('submit', doBook);
  /* swipe the sheet down to dismiss (grabber + header) */
  const grab = sheet.querySelector('.sheet-grab');
  let y0 = null, dy = 0;
  grab.addEventListener('pointerdown', (e) => { if (booking || e.target.closest('button')) return; y0 = e.clientY; dy = 0; grab.setPointerCapture(e.pointerId); sheet.style.transition = 'none'; });
  grab.addEventListener('pointermove', (e) => { if (y0 == null) return; dy = Math.max(0, e.clientY - y0); sheet.style.transform = `translateY(${dy}px)`; });
  const end = () => { if (y0 == null) return; y0 = null; sheet.style.transition = ''; sheet.style.transform = ''; if (dy > 80) closeSheet(); };
  grab.addEventListener('pointerup', end); grab.addEventListener('pointercancel', end);
  return sheet;
}
function openSheet(id) {
  const it = DATA && DATA.items.find(i => i.id === id); if (!it || !API || booking) return;   // one booking at a time
  ensureSheet(); sheetItem = id;
  sheet.querySelector('.sheet-item').innerHTML = t(it.name);
  const err = sheet.querySelector('.sheet-err'); err.hidden = true; err.innerHTML = '';
  const stage = sheet.querySelector('.confirm-stage'); stage.className = 'confirm-stage';
  const st0 = sheet.querySelector('#bk-status'); if (st0) st0.textContent = '';
  const go = sheet.querySelector('.sheet-go'); go.disabled = false; go.querySelector('.cc-label').innerHTML = t(DATA.ui.bookConfirm);
  sheet.querySelector('.sheet-cancel').disabled = false;
  const input = sheet.querySelector('input'); let last = ''; try { last = localStorage.getItem('wl-name') || ''; } catch (e) {}
  input.value = last;
  sheet.showModal();
  if (finePointer.matches) input.focus();   // phones: no keyboard until the guest taps the field
}
function closeSheet() { if (booking) return; if (sheet && sheet.open) sheet.close(); sheetItem = null; }
/* The Velvet "Confirmation" element: Book → Booking (spinner, request in flight) → Booked (green circle, drawn check,
   signature ui.confirm sound). Failure: shake + state.error, message in the sheet, button back to Book. */
let booking = false;
async function doBook(e) {
  e.preventDefault();
  if (booking) return;
  let it = DATA.items.find(i => i.id === sheetItem); if (!it) return closeSheet();
  const ui = DATA.ui, stage = sheet.querySelector('.confirm-stage'), go = sheet.querySelector('.sheet-go'), lbl = go.querySelector('.cc-label'), err = sheet.querySelector('.sheet-err');
  const cx = sheet.querySelector('.sheet-cancel');
  const name = sheet.querySelector('input').value.trim().slice(0, 40);
  try { localStorage.setItem('wl-name', name); } catch (x) {}
  booking = true; go.disabled = true; cx.disabled = true; err.hidden = true;
  stage.classList.remove('shaking'); stage.classList.add('is-loading'); lbl.innerHTML = t(ui.booking || ui.bookConfirm);
  const t0 = performance.now();
  let r = null;
  try {
    r = await fetch(`${API}/api/lists/${encodeURIComponent(LIST)}/items/${encodeURIComponent(it.id)}/book`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(name ? { name } : {}), signal: giveUp(30000) });
  } catch (x) { r = null; }   // offline, dropped, or no answer in 30 s
  await new Promise(res => setTimeout(res, Math.max(0, 520 - (performance.now() - t0))));   // the spinner is a beat, not a flash
  stage.classList.remove('is-loading');
  it = DATA.items.find(i => i.id === it.id) || it;   // a late live list may have replaced DATA meanwhile
  if (r && r.status === 201) {
    let token = null; try { token = (await r.json()).token; } catch (x) {}
    it = DATA.items.find(i => i.id === it.id) || it;   // again: the late list can land while the body arrives
    touched.set(it.id, ++bkSeq);
    if (token) keepToken(it.id, token);
    lbl.innerHTML = t(ui.bookedDone || ui.booked);
    const st = sheet.querySelector('#bk-status'); if (st) st.textContent = (ui.bookedDone || ui.booked)[L()] || '';
    stage.classList.add('is-resolved');
    snd('ui.confirm', 'signature');
    if (navigator.vibrate) navigator.vibrate(12);
    setBooked(it, true);
    setTimeout(() => { booking = false; closeSheet(); }, reduced.matches ? 600 : 1500);
    return;
  }
  const code = r ? r.status : 0;
  err.innerHTML = t(code === 409 ? ui.taken : code === 410 ? ui.gone : code === 429 ? ui.slowDown : ui.bookFail);
  err.hidden = false;
  lbl.innerHTML = t(ui.bookConfirm); go.disabled = false; cx.disabled = false; booking = false;
  stage.classList.add('shaking'); setTimeout(() => stage.classList.remove('shaking'), 450);
  snd('state.error', 'signature');
  if (code === 409) setBooked(it, true);
  else if (!r) refreshBookings();   // the POST may have gone through anyway: show what the server has
}
/* AbortSignal.timeout where it exists (Safari 16+), a timer elsewhere */
function giveUp(ms) {
  if (AbortSignal.timeout) return AbortSignal.timeout(ms);
  const c = new AbortController(); setTimeout(() => c.abort(), ms); return c.signal;
}
async function undo(btn) {
  const id = btn.dataset.id, it = DATA.items.find(i => i.id === id); if (!it || btn.disabled) return;
  const ui = DATA.ui, sub = btn.querySelector('small') || btn;
  if (!btn.classList.contains('confirm')) {          // two taps: undo can hand the gift to someone else
    btn.classList.add('confirm'); sub.innerHTML = t(ui.unbookSure);
    clearTimeout(btn._t); btn._t = setTimeout(() => { btn.classList.remove('confirm'); sub.innerHTML = t(ui.unbook); }, 3500);
    return;
  }
  clearTimeout(btn._t); btn.disabled = true; sub.innerHTML = t(ui.unbooking || ui.unbookSure);
  let r = null;
  try {
    r = await fetch(`${API}/api/lists/${encodeURIComponent(LIST)}/items/${encodeURIComponent(id)}/book`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${myToken(id) || ''}` } });
  } catch (x) { r = null; }
  const now = DATA.items.find(i => i.id === id) || it;   // a late live list may have replaced DATA meanwhile
  if (r && r.status === 204) {                         // undone: the gift is free again
    touched.set(id, ++bkSeq);
    setBooked(now, false); snd('toggle.off', 'signature');
    return;
  }
  if (r && r.status === 404) {                         // this phone's key matches no booking (cleared by the owner, maybe rebooked by someone else)
    touched.set(id, ++bkSeq); forgetToken(id);
    await refreshBookings();                           // show what the server says: someone else's booking stays booked
    const cur = DATA.items.find(i => i.id === id) || it;
    setBooked(cur, !!cur.booked); snd(cur.booked ? 'state.error' : 'toggle.off', 'signature');
    return;
  }
  if (r && r.status === 401) {                         // this phone's key no longer matches: still booked, just not ours to undo
    forgetToken(id); setBooked(now, true); snd('state.error', 'signature');
    return;
  }
  btn.disabled = false; btn.classList.remove('confirm'); sub.innerHTML = t(ui.retry); snd('state.error', 'signature');
}

/* ---------- data: the repo JSON paints first; when an API is configured, the live list (edited from admin.html) replaces it ---------- */
const okShape = (d) => d && d.site && Array.isArray(d.tiers) && d.ui && Array.isArray(d.items);
/* what a document shows, minus its version stamp and API address (the repo copy and the live one differ there) */
const docKey = (d) => JSON.stringify({ ...d, updated: 0, site: { ...d.site, api: 0 } });
function apply(d, quiet) {
  const keepApi = DATA && DATA.site && DATA.site.api;
  DATA = d;
  if (keepApi && !DATA.site.api) DATA.site.api = keepApi;
  LIST = (DATA.site && DATA.site.slug) || 'dmitri';
  API = String((LOCAL && new URLSearchParams(location.search).get('api')) || DATA.site.api || '').replace(/\/+$/, '');
  renderSite(DATA.site);
  renderBg();
  renderNav(DATA.tiers);
  layout(true, quiet);
}
function fetchLive(api, slug) {
  return fetch(`${api}/api/lists/${encodeURIComponent(slug)}`, { cache: 'no-store' })
    .then(r => r.ok ? r.json() : null).then(d => okShape(d) ? d : null).catch(() => null);
}
/* ---------- the wall: pattern, photo or ambient scene behind everything, one per theme (set in admin → Look) ---------- */
let sceneLoaded = null, bgSeq = 0;   // one live scene per page load; a second one shows as its still
const LOADING = {};
const addScript = (src) => LOADING[src] || (LOADING[src] = new Promise((ok, bad) => { const sc = document.createElement('script'); sc.src = src; sc.onload = () => ok(); sc.onerror = () => { delete LOADING[src]; bad(new Error(src)); }; document.head.appendChild(sc); }));
function stopScenes() { const S = window.Scenes; if (S) Object.values(S).forEach(s => s && s.stop && s.stop()); }
async function loadScene(id, host, seq) {
  host.innerHTML = '<div class="bg-scene"></div>';
  const still = () => { host.style.backgroundImage = `url("img/scenes/${id}.webp")`; };
  if (sceneLoaded && sceneLoaded !== id) return still();
  try { await addScript('assets/scenes/lib.js'); await addScript(`assets/scenes/${id}.js`); } catch (e) { if (seq === bgSeq) still(); return; }
  if (seq !== bgSeq) return;   // the wall changed while the script was loading
  const s = window.Scenes && window.Scenes[id];
  if (s) { sceneLoaded = id; s.start(); } else still();
}
function renderBg() {
  const seq = ++bgSeq;
  const dark = document.documentElement.classList.contains('dark');
  const all = DATA && DATA.site && DATA.site.bg, cfg = all && all[dark ? 'dark' : 'light'];
  let el = document.getElementById('bg');
  if (!el) { el = document.createElement('div'); el.id = 'bg'; el.className = 'bg'; el.setAttribute('aria-hidden', 'true'); document.body.insertBefore(el, document.body.firstChild); }
  stopScenes();
  const kind = window.Wall ? Wall.render(el, cfg) : 'none';   // patterns, tiles, photos and a scene's still
  if (kind !== 'scene') return;
  const phone = !finePointer.matches;
  const live = !reduced.matches && !(navigator.connection && navigator.connection.saveData) && (!phone || !!cfg.phone);   // phones only when the owner switched it on
  if (!live) return;
  window.SceneScale = phone ? .5 : 1;   // half-resolution canvas on phones, stretched by CSS
  el.style.backgroundImage = ''; loadScene(cfg.id, el, seq);
}
window.addEventListener('themechange', () => { if (DATA) renderBg(); });

async function load() {
  const main = $('#tiers');
  let d = null;
  try {
    const r = await fetch('data/items.json', { cache: 'no-cache' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    d = await r.json();
    if (!okShape(d)) throw new Error('bad data shape');
  } catch (err) {
    main.innerHTML = `<p class="msg"><span class="l-en">Couldn't load the list. Open the link again when you're online.</span><span class="l-ru">Не получилось загрузить список. Открой ссылку ещё раз, когда появится сеть.</span></p>`;
    console.error(err);
    return;
  }
  const api = String((LOCAL && new URLSearchParams(location.search).get('api')) || d.site.api || '').replace(/\/+$/, '');
  if (!api) { apply(d); return; }
  /* the live list (edited from admin.html) wins; give it 2.5 s, then paint the repo copy and swap if it arrives late */
  const live = fetchLive(api, (d.site && d.site.slug) || 'dmitri');
  const first = await Promise.race([live, new Promise(res => setTimeout(() => res(null), 2500))]);
  if (first) { if (!first.site.api) first.site.api = d.site.api; apply(first); refreshBookings(); return; }
  const painted = docKey(d);   // before bookings mark items as booked
  apply(d); refreshBookings();
  live.then(late => {
    if (!late || docKey(late) === painted) return;   // same list: leave the page (flipped cards, ribbons) alone
    if (!late.site.api) late.site.api = d.site.api;
    late.items.forEach(x => { const o = DATA.items.find(y => y && x && y.id === x.id); if (o && 'booked' in o) x.booked = o.booked; });   // ribbons stay up
    apply(late, true); refreshBookings();
  });
}
load();
