/* The wall: draws one background config into a host element. Shared by the page (behind the cards) and the admin
   (behind the Look tab, so a pick shows at once). Kinds: none · pattern (our SVG tiles) · tile (a bundled Premium tile or
   an uploaded image repeated) · photo (an uploaded image, cover) · scene (its still; the page adds the live canvas itself). */
(function () {
  'use strict';
  const HEX = /^#[0-9a-f]{3,8}$/i;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const safe = (u) => (typeof u === 'string' && /^(https?:\/\/|img\/)/i.test(u) && !/["\\]/.test(u)) ? u : null;
  const SCENES = ['aurora', 'swirl', 'shift', 'coalesce', 'pipeline'];
  const MAX = { pattern: 1, tile: 1, photo: .7, scene: .7 };   // photos and scenes keep a little wall showing through
  let seq = 0, liveSeq = 0;
  const LOADING = {};
  const addScript = (src) => LOADING[src] || (LOADING[src] = new Promise((ok, bad) => { const sc = document.createElement('script'); sc.src = src; sc.onload = () => ok(); sc.onerror = () => { delete LOADING[src]; bad(new Error(src)); }; document.head.appendChild(sc); }));
  /* stop every moving scene (each scene script is its own closure, so any number can be loaded; one runs at a time) */
  function stop() { liveSeq++; const S = window.Scenes; if (S) Object.values(S).forEach(sc => sc && sc.stop && sc.stop()); }
  /* start scene `id` moving inside host (after render() drew its still); falls back to the still if the scripts fail */
  async function live(host, id, opts) {
    const my = ++liveSeq, base = (opts && opts.base) || '';
    if (!SCENES.includes(id)) return false;
    const still = host.style.backgroundImage;
    try { await addScript(base + 'assets/scenes/lib.js'); await addScript(`${base}assets/scenes/${id}.js`); } catch (e) { return false; }
    if (my !== liveSeq || !host.isConnected) return false;   // the wall changed while the scripts loaded
    const sc = window.Scenes && window.Scenes[id]; if (!sc) return false;
    host.innerHTML = '<div class="bg-scene"></div>'; host.style.backgroundImage = '';
    sc.start(); host.dataset.live = id; void still;
    return true;
  }

  /* host: the fixed layer. cfg: one room's config. Returns the kind drawn (or 'none'). A later call cancels any photo still loading. */
  function render(host, cfg, opts) {
    const my = ++seq, base = (opts && opts.base) || '';
    stop();
    host.className = (opts && opts.cls) || 'bg'; host.innerHTML = ''; host.removeAttribute('style');
    if (opts && opts.ink) host.style.setProperty('--ink', opts.ink);   // the admin previews a room it is not in
    if (!cfg || !cfg.kind || cfg.kind === 'none') return 'none';
    const strength = clamp((+cfg.strength || 10) / 100, .02, MAX[cfg.kind] || .7);
    const size = clamp(+cfg.size || 0, 80, 1200);
    if (cfg.kind === 'pattern' && window.Patterns && Patterns.byId(cfg.id)) {
      host.classList.add('pattern'); host.style.opacity = strength;
      host.innerHTML = Patterns.svg(cfg.id, { color: HEX.test(cfg.color || '') ? cfg.color : 'var(--ink)', scale: cfg.scale || 1 });
      return 'pattern';
    }
    if (cfg.kind === 'tile') {
      const t = window.Patterns && Patterns.tile(cfg.id); if (!t) return 'none';
      host.classList.add('tile'); host.style.opacity = strength;
      host.style.backgroundImage = `url("${base}img/patterns/${t.id}.webp")`; host.style.backgroundSize = `${+cfg.size || t.w}px auto`;
      return 'tile';
    }
    if (cfg.kind === 'photo' && safe(cfg.src)) {
      host.classList.add(cfg.repeat ? 'tile' : 'photo'); host.style.opacity = strength;
      const img = new Image();
      img.onload = () => { if (my !== seq) return; host.style.backgroundImage = `url("${cfg.src}")`; if (cfg.repeat) host.style.backgroundSize = `${size || Math.min(img.naturalWidth, 600)}px auto`; };   // can't load: plain wall
      img.src = cfg.src;
      return 'photo';
    }
    if (cfg.kind === 'scene' && SCENES.includes(cfg.id)) {
      host.classList.add('scene'); host.style.opacity = strength;
      host.style.backgroundImage = `url("${base}img/scenes/${cfg.id}.webp")`;
      return 'scene';
    }
    return 'none';
  }
  window.Wall = { render, live, stop, MAX, SCENES };
})();
