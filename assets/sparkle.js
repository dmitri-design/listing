/* Sparkles under the title, dark theme only. Built upon Aceternity UI "Sparkles" (ui.aceternity.com/components/sparkles,
   SparklesPreview + SparklesCore, Aceternity License): its tsparticles settings re-implemented on one canvas, no React, no
   tsparticles. Density 1200 per 400×400 px, radius .4–1 px, opacity .1–1 bouncing (speed 4), drift .1–1 px a frame, out-of-bounds
   particles re-enter on the far side. The original fades the edges with a black overlay + mask-image, which only works on pure
   black; here each dot's alpha carries that radial fade instead. Paused off-screen, in a hidden tab and on the light theme; a still
   frame under reduced motion or Save-Data. */
(function () {
  'use strict';
  const wrap = document.querySelector('.sparkle'), cv = wrap && wrap.querySelector('canvas'), ctx = cv && cv.getContext('2d');
  if (!ctx || new URLSearchParams(location.search).get('preview') === '1') return;   // admin's card preview has no hero
  const root = document.documentElement, reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const still = () => reduced.matches || !!(navigator.connection && navigator.connection.saveData);
  const DENSITY = 1200 / 160000, CAP = 800;   // number.value 1200 per density area 400×400 CSS px; the box tops out at 640×160 = 768
  const TAU = Math.PI * 2, LEVELS = 20, S = 7;   // alpha levels (one fill per level); floats per particle: x y r vx vy o ov
  let W = 0, H = 0, dpr = 1, N = 0, P = new Float32Array(0), lv = new Uint8Array(0), ax = 0, ay = 0;
  let raf = 0, last = 0, seen = true;
  const rnd = (a, b) => a + Math.random() * (b - a);
  function seed(i) {   // a random spot, a random heading, speed .1–1 halved (tsparticles' base mover), opacity anywhere in .1–1
    const k = i * S, a = Math.random() * TAU, v = rnd(.1, 1) / 2;
    P[k] = Math.random() * W; P[k + 1] = Math.random() * H; P[k + 2] = rnd(.4, 1);
    P[k + 3] = Math.cos(a) * v; P[k + 4] = Math.sin(a) * v;
    P[k + 5] = rnd(.1, 1); P[k + 6] = .04 * Math.random() * (Math.random() < .5 ? -1 : 1);   // opacity speed 4 / 100 × random()
  }
  function size() {   // the canvas in device pixels (≤ 2×), the count by area; particles already there keep their place
    const w = cv.clientWidth, h = cv.clientHeight, d = Math.min(window.devicePixelRatio || 1, 2);
    if (w === W && h === H && d === dpr) return false;
    const fx = W ? w / W : 1, fy = H ? h / H : 1, n = Math.min(CAP, Math.round(DENSITY * w * h)), old = P, keep = Math.min(N, n);
    W = w; H = h; dpr = d; cv.width = Math.round(w * d); cv.height = Math.round(h * d);
    P = new Float32Array(n * S); lv = new Uint8Array(n);
    for (let i = 0; i < keep; i++) { P.set(old.subarray(i * S, i * S + S), i * S); P[i * S] *= fx; P[i * S + 1] *= fy; }
    for (let i = keep; i < n; i++) seed(i);
    N = n;
    const rx = W * 350 / 640, ry = H * 200 / 160;   // the overlay's radial-gradient(350px 200px at top …) on the 640×160 box, scaled with ours
    ax = 1 / (rx * rx); ay = 1 / (ry * ry);
    return true;
  }
  function step(f) {   // f = 60 fps frames elapsed
    for (let k = 0; k < N * S; k += S) {
      const r = P[k + 2];
      let x = P[k] + P[k + 3] * f, y = P[k + 1] + P[k + 4] * f;
      if (x - r > W) { x = -r; y = Math.random() * H; } else if (x + r < 0) { x = W + r; y = Math.random() * H; }   // out: back in on the far side
      if (y - r > H) { y = -r; x = Math.random() * W; } else if (y + r < 0) { y = H + r; x = Math.random() * W; }
      P[k] = x; P[k + 1] = y;
      let o = P[k + 5], v = P[k + 6];
      if (v > 0 ? o >= 1 : o <= .1) P[k + 6] = -v; else o += v * f;   // turn at the ends, else move
      P[k + 5] = o < .1 ? .1 : o > 1 ? 1 : o;
    }
  }
  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    const cx = W / 2;
    for (let i = 0, k = 0; i < N; i++, k += S) {   // the edge fade: full inside 20 % of the ellipse hanging from the top, gone at its rim
      const dx = P[k] - cx, y = P[k + 1], e = Math.sqrt(dx * dx * ax + y * y * ay), m = e <= .2 ? 1 : e >= 1 ? 0 : 1 - (e - .2) / .8;
      lv[i] = Math.round(P[k + 5] * m * LEVELS);
    }
    ctx.fillStyle = '#fff';
    for (let l = 1; l <= LEVELS; l++) {   // one path and one fill per alpha level instead of one per dot
      let any = false; ctx.beginPath();
      for (let i = 0, k = 0; i < N; i++, k += S) if (lv[i] === l) { const x = P[k], y = P[k + 1], r = P[k + 2]; ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, TAU); any = true; }
      if (any) { ctx.globalAlpha = l / LEVELS; ctx.fill(); }
    }
    ctx.globalAlpha = 1;
  }
  function frame(t) {
    raf = requestAnimationFrame(frame);
    const dt = last ? t - last : 1000 / 60;
    if (dt < 12) return;   // 60 fps is plenty for a twinkle, also on 120 Hz screens
    last = t; step(Math.min(dt, 100) * .06); draw();
  }
  function stop() { cancelAnimationFrame(raf); raf = 0; last = 0; }
  function sync() {
    if (!root.classList.contains('dark')) { stop(); wrap.classList.remove('on'); return; }   // the light room has no sparkles (CSS hides the box too)
    const grew = size();
    if (!W || !H) { stop(); return; }
    if (still()) { stop(); if (grew || !wrap.classList.contains('on')) draw(); }   // a still sky
    else if (seen && !document.hidden) { if (!raf) { draw(); raf = requestAnimationFrame(frame); } }
    else stop();
    wrap.classList.add('on');   // fades in over 1 s (CSS)
  }
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { seen = es[es.length - 1].isIntersecting; sync(); }).observe(wrap);
  if ('ResizeObserver' in window) new ResizeObserver(() => { if (root.classList.contains('dark') && size() && !raf) draw(); }).observe(cv);
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('themechange', sync);   // theme.js; its first event fired before this file ran, so sync once now
  if (reduced.addEventListener) reduced.addEventListener('change', sync);
  sync();
})();
