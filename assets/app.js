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
const art = (k) => (ART[k] || ART.ring).replace('<svg ', '<svg width="100%" height="100%" ');
const safeUrl = (u) => (typeof u === 'string' && /^https?:\/\//i.test(u)) ? u : null;
const MARK = { y: '✓', g: '~', n: '✗' };
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

let DATA = null;   // { site, tiers, ui, items }

/* ---------- language ---------- */
function setLang(l, save) {
  app.classList.toggle('ru', l === 'ru');
  document.documentElement.lang = l;
  document.querySelectorAll('.lang button').forEach(b => {
    const on = b.dataset.lang === l;
    b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
  if (DATA) document.title = DATA.site.title[l].replace(/<[^>]+>/g, '') + ' · ' + DATA.site.owner;
  if (save) { try { localStorage.setItem('wl-lang', l); } catch (e) {} }
}
let lang = 'en';
try { lang = localStorage.getItem('wl-lang') || ((navigator.language || '').toLowerCase().startsWith('ru') ? 'ru' : 'en'); } catch (e) {}
setLang(lang, false);
document.querySelectorAll('.lang button').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang, true)));

/* ---------- title letters ---------- */
function renderTitle(title) {
  const h = $('#title');
  const mk = (txt, cls) => {
    let i = 0, out = '';
    for (const part of String(txt).split(/(<i>.*?<\/i>)/)) {
      if (!part) continue;
      const ital = part.startsWith('<i>');
      const chars = part.replace(/<\/?i>/g, '');
      for (const ch of chars) {
        const c = ch === ' ' ? '&nbsp;' : esc(ch);
        out += ital ? `<i><span class="ch" style="--i:${i++}">${c}</span></i>` : `<span class="ch" style="--i:${i++}">${c}</span>`;
      }
    }
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
function imgHTML(it, cls, eager) {
  const photo = it.kind === 'photo';
  if (!it.image) {
    return `<div class="${cls}">${art(it.illustration || 'ring')}<span class="sketch">${t(DATA.ui.sketch)}</span></div>`;
  }
  const dim = it.w && it.h ? ` width="${+it.w}" height="${+it.h}"` : '';
  return `<div class="${cls}${photo ? ' photo' : ''}"><img src="${esc(it.image)}" alt=""${dim} loading="${eager ? 'eager' : 'lazy'}" decoding="async"></div>`;
}
function thumbHTML(it) {
  const photo = it.kind === 'photo';
  if (!it.image) return `<div class="thumb">${art(it.illustration || 'ring')}</div>`;
  return `<div class="thumb${photo ? ' photo' : ''}"><img src="${esc(it.image)}" alt="" loading="lazy" decoding="async"></div>`;
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
  const id = esc(it.id);
  return `
  <div class="drop" style="--i:${ri}">
    <div class="hang" style="--dur:${dur};--delay:${delay}">
      <svg class="clip" style="--pin:${esc(pin)};--tilt:${tilt}" aria-hidden="true"><use href="#pin"/></svg>
      <div class="card${got ? ' got' : ''}" data-id="${id}">
        <div class="face front" style="--c:${esc(tier.c)}" role="button" tabindex="0" aria-labelledby="n-${id}" aria-expanded="false">
          <div class="price">${t(it.price)}</div>
          ${got ? `<div class="got-badge">${t(ui.got)} ✓</div>` : ''}
          ${imgHTML(it, 'imgbox', eager)}
          <h3 class="name" id="n-${id}">${t(it.name)}</h3>
          <p class="desc">${t(it.desc)}</p>
          <div class="foot"><span class="tier-lbl"><i class="tr"></i>${t(tier.short || tier.name)}</span><span class="tap">${t(ui.tap)} ↻</span></div>
        </div>
        <div class="face back" inert>
          <div class="hd">${thumbHTML(it)}<div><div class="lbl">${t(ui.approx)}</div><div class="note">${t(it.note || '')}</div></div></div>
          <div class="big">${t(it.price)}</div>
          <div class="avail">${av}</div>
          <div class="where"><div class="lbl">${t(ui.where)}</div><ul>${where}</ul></div>
          <button type="button" class="hint">${t(ui.back)} ↻</button>
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
function layout(force) {
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
  main.innerHTML = html;
  /* sag: cards in the middle of a wire hang lower */
  main.querySelectorAll('.row').forEach(row => {
    const rw = row.scrollWidth;
    row.querySelectorAll('.drop').forEach(d => {
      const x = d.offsetLeft + d.offsetWidth / 2;
      const tt = Math.max(0, Math.min(1, x / rw));
      d.querySelector('.hang').style.setProperty('--sag', (48 * tt * (1 - tt)).toFixed(1));
    });
  });
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

/* ---------- flip + tilt ---------- */
document.addEventListener('click', (e) => {
  if (e.target.closest('a')) return;
  const card = e.target.closest('.card'); if (!card) return;
  flip(card);
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  if (e.target.closest && e.target.closest('a, button')) return;   // links and real buttons act on their own
  const face = e.target.closest && e.target.closest('.face'); if (!face) return;
  e.preventDefault(); flip(face.closest('.card'));
});
function flip(card) {
  card.classList.add('anim');
  const flipped = card.classList.toggle('flipped');
  const front = card.querySelector('.front'), back = card.querySelector('.back');
  front.toggleAttribute('inert', flipped); back.toggleAttribute('inert', !flipped);
  front.setAttribute('aria-expanded', flipped ? 'true' : 'false');
  if (document.activeElement && card.contains(document.activeElement)) (flipped ? back.querySelector('.hint') : front).focus({ preventScroll: true });
  clearTimeout(card._t); card._t = setTimeout(() => card.classList.remove('anim'), 850);
}
if (window.matchMedia('(hover: hover)').matches) {
  document.addEventListener('pointermove', (e) => {
    const card = e.target.closest && e.target.closest('.card'); if (!card) return;
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    const flipped = card.classList.contains('flipped');
    card.style.setProperty('--ry', ((px - .5) * (flipped ? -14 : 14)).toFixed(2) + 'deg');
    card.style.setProperty('--rx', ((.5 - py) * 10).toFixed(2) + 'deg');
    card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
    card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
  });
  document.addEventListener('pointerout', (e) => {
    const card = e.target.closest && e.target.closest('.card'); if (!card) return;
    if (e.relatedTarget && card.contains(e.relatedTarget)) return;
    card.style.setProperty('--ry', '0deg'); card.style.setProperty('--rx', '0deg');
  });
}

/* ---------- data ---------- */
async function load() {
  const main = $('#tiers');
  try {
    const r = await fetch('data/items.json', { cache: 'no-cache' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const d = await r.json();
    if (!d || !d.site || !Array.isArray(d.tiers) || !Array.isArray(d.items)) throw new Error('bad data shape');
    DATA = d;
    renderSite(DATA.site);
    renderNav(DATA.tiers);
    layout(true);
  } catch (err) {
    main.innerHTML = `<p class="msg"><span class="l-en">Couldn't load the list. Open the link again when you're online.</span><span class="l-ru">Не получилось загрузить список. Открой ссылку ещё раз, когда появится сеть.</span></p>`;
    console.error(err);
  }
}
load();
