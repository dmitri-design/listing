/* Interface sounds — a port of the Velvet UI engine (24h.studio, https://velvet-ui-eight.vercel.app).
   Synthesized live with the Web Audio API, never identical twice. Quiet by design: a bonus layer, never the message.
   Voices used here: "signature" (balanced, quiet, tactile) for the language switch and the booking confirmation,
   "crisp" (sharp, bright, precise) for the card flip. Mute is visible, persistent and remembered (the sound pill). */
(function () {
  'use strict';

  const VOICES = Object.freeze({
    signature: { baseHz: 118, decayMs: 46, attackMs: 1, waveform: 'sine', bodyDropPct: 9, bodyLp: 540,
      transient: { amt: .16, hz: 420, shape: 'lowpass', ms: 12 }, sub: .23, click: 0, ping: 0,
      pitchVarPct: 2, volJitterPct: 5, reverbWet: .18, layerSpreadMs: 3 },
    velvet: { baseHz: 104, decayMs: 72, attackMs: 8, waveform: 'sine', bodyDropPct: 7, bodyLp: 520,
      transient: { amt: .12, hz: 260, shape: 'lowpass', ms: 18 }, sub: .53, click: 0, ping: 0,
      pitchVarPct: 7, volJitterPct: 12, reverbWet: .42, layerSpreadMs: 10 },
    crisp: { baseHz: 240, decayMs: 20, attackMs: 1, waveform: 'sine', bodyDropPct: 15, bodyLp: 1800,
      transient: { amt: .62, hz: 5200, shape: 'bandpass', ms: 5 }, sub: .02, click: 1, ping: .42, clickHz: 5200, clickMs: 5, pingHz: 3600,
      pitchVarPct: 1, volJitterPct: 5, reverbWet: .08, layerSpreadMs: 2 },
  });

  /* Interface moments. toggle.on: "a setting has moved into an active state — rounded mechanical detent, very short
     upward motion, smooth tail, minimal sub". ui.confirm: "a task has been completed — restrained upward resolution,
     quiet tactile body, clear higher-register completion layer, compact closure". state.error: "matte stopped
     boundary, short downward contour, dry firm transient, recoverable". */
  const ROLES = Object.freeze({
    'toggle.on':   { hits: [{ pitch: 1.14, gain: .48, glide: 1.025 }], decay: .3, transient: .48, sub: .22, reverb: .25 },
    'toggle.off':  { hits: [{ pitch: .87, gain: .46, glide: .975 }], decay: .32, transient: .42, sub: .24, reverb: .22 },
    'toast.in':    { hits: [{ dt: .012, pitch: 1.2, gain: .36, glide: .99 }, { dt: .082, pitch: .94, gain: .24, glide: .9 }],
                     tone: { dt: .044, pitch: 3.1, gain: .055, decay: 1.25, glide: 1.06, jitter: .45 }, decay: 1.36, reverb: 1.55, transient: .09, sub: .1 },
    'state.error': { hits: [{ pitch: .64, gain: .54, glide: .84 }, { dt: .066, pitch: .47, gain: .38, glide: .78 }], decay: .76, reverb: .14, transient: .18, sub: .52 },
    'ui.confirm':  { hits: [{ pitch: 1.04, gain: .56, glide: 1.03 }, { dt: .104, pitch: 1.68, gain: .5, glide: 1.1 }],
                     tone: { dt: .106, pitch: 4.9, gain: .085, decay: 1.3, glide: 1.04, jitter: .08 }, decay: 1.72, reverb: .92, transient: .42, sub: .28 },
  });

  const KEY = 'wl-sound';
  let ctx = null, master = null, reverb = null, noise = null;
  let enabled = true;
  try { enabled = localStorage.getItem(KEY) !== '0'; } catch (e) {}
  const rnd = (a, b) => a + Math.random() * (b - a);

  function boot() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume().catch(() => {}); return true; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    const comp = ctx.createDynamicsCompressor(); comp.connect(ctx.destination);
    master = ctx.createGain(); master.gain.value = 1; master.connect(comp);
    /* room: 100 ms of noise with a cubic decay, low-passed at 2.2 kHz */
    const rl = Math.floor(.1 * ctx.sampleRate), rb = ctx.createBuffer(2, rl, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = rb.getChannelData(c); for (let i = 0; i < rl; i++) d[i] = (2 * Math.random() - 1) * Math.pow(1 - i / rl, 3); }
    reverb = ctx.createConvolver(); reverb.buffer = rb;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2200;
    const rg = ctx.createGain(); rg.gain.value = 1;
    reverb.connect(lp); lp.connect(rg); rg.connect(comp);
    /* 200 ms of white noise for transients and clicks */
    const nl = Math.floor(.2 * ctx.sampleRate); noise = ctx.createBuffer(1, nl, ctx.sampleRate);
    const nd = noise.getChannelData(0); for (let i = 0; i < nl; i++) nd[i] = 2 * Math.random() - 1;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return true;
  }

  function hit(at, v, role, h) {
    const pv = rnd(-v.pitchVarPct, v.pitchVarPct) / 100;
    const hz = v.baseHz * (h.pitch || 1) * (1 + pv);
    const gain = .8 * (h.gain || 1) * (1 + rnd(-v.volJitterPct, v.volJitterPct) / 100);
    const atk = Math.max(.001, v.attackMs / 1000);
    const dec = v.decayMs / 1000 * (role.decay || 1);
    const a = Math.max(atk, .003);
    const tail = Math.max(.006, Math.min(.018, .22 * dec));
    const spread = Math.max(0, (v.layerSpreadMs + rnd(-1, 1)) / 1000);
    const trAmt = v.transient.amt * (role.transient !== undefined ? role.transient : 1);
    const subAmt = v.sub * (role.sub !== undefined ? role.sub : 1);
    const wet = Math.min(.6, v.reverbWet * (role.reverb || 1));
    const bus = ctx.createGain(); bus.gain.value = 1; bus.connect(master);
    if (wet > .001) { const w = ctx.createGain(); w.gain.value = wet; bus.connect(w); w.connect(reverb); }
    if (trAmt > .02) {   /* transient: a few ms of filtered noise */
      const s = ctx.createBufferSource(); s.buffer = noise;
      const f = ctx.createBiquadFilter(); f.type = v.transient.shape; f.frequency.value = v.transient.hz; f.Q.value = v.transient.shape === 'lowpass' ? .5 : .8;
      const g = ctx.createGain();
      g.gain.setValueAtTime(1e-4, at); g.gain.linearRampToValueAtTime(trAmt * gain * .6, at + .0015);
      g.gain.exponentialRampToValueAtTime(1e-4, at + .0015 + v.transient.ms / 1000);
      s.connect(f); f.connect(g); g.connect(bus); s.start(at); s.stop(at + .06);
    }
    const t0 = at + spread;   /* body: one sine with a short glide, low-passed */
    const o = ctx.createOscillator(); o.type = v.waveform; o.frequency.setValueAtTime(hz, t0);
    const to = h.glide ? hz * h.glide : Math.max(40, hz * (1 - v.bodyDropPct / 100));
    o.frequency.exponentialRampToValueAtTime(to, t0 + atk + .7 * dec);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = v.bodyLp; lp.Q.value = .5;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(gain, t0 + a);
    g.gain.exponentialRampToValueAtTime(8e-4, t0 + a + dec); g.gain.linearRampToValueAtTime(1e-4, t0 + a + dec + tail);
    o.connect(lp); lp.connect(g); g.connect(bus); o.start(t0); o.stop(t0 + a + dec + tail + .05);
    if (subAmt > .01) {   /* sub: an octave below */
      const ts = at + 2 * spread, as = Math.max(a + .004, .008);
      const so = ctx.createOscillator(); so.type = 'sine'; so.frequency.value = hz / 2;
      const sg = ctx.createGain();
      sg.gain.setValueAtTime(0, ts); sg.gain.linearRampToValueAtTime(subAmt * gain, ts + as);
      sg.gain.exponentialRampToValueAtTime(8e-4, ts + as + dec); sg.gain.linearRampToValueAtTime(1e-4, ts + as + dec + tail);
      so.connect(sg); sg.connect(bus); so.start(ts); so.stop(ts + as + dec + tail + .05);
    }
    if (v.click > .01) {   /* crisp only: a band-passed click */
      const s = ctx.createBufferSource(); s.buffer = noise;
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = (v.clickHz || 4000) * (1 + pv); f.Q.value = 3.5;
      const cg = ctx.createGain(), peak = v.click * gain * .5 * (role.transient !== undefined ? role.transient : 1);
      cg.gain.setValueAtTime(1e-4, at); cg.gain.linearRampToValueAtTime(peak, at + .0015);
      cg.gain.exponentialRampToValueAtTime(1e-4, at + .0015 + (v.clickMs || 6) / 1000);
      s.connect(f); f.connect(cg); cg.connect(bus); s.start(at); s.stop(at + .05);
    }
    if (v.ping > .01) {   /* crisp only: a high ping */
      const p = ctx.createOscillator(); p.type = 'sine';
      const phz = (v.pingHz || 3000) * (h.pitch || 1) * (1 + pv);
      p.frequency.setValueAtTime(phz, at); p.frequency.exponentialRampToValueAtTime(.94 * phz, at + dec);
      const pg = ctx.createGain();
      pg.gain.setValueAtTime(0, at); pg.gain.linearRampToValueAtTime(v.ping * gain * .35, at + .004);
      pg.gain.exponentialRampToValueAtTime(1e-4, at + 1.4 * dec);
      p.connect(pg); pg.connect(bus); p.start(at); p.stop(at + 1.5 * dec + .05);
    }
    if (role.tone) {   /* completion layer: a quiet high tone that resolves upward */
      const t = role.tone, jit = pv * (t.jitter !== undefined ? t.jitter : .35), tt = at + (t.dt || 0), tdec = dec * (t.decay || 1);
      const thz = v.baseHz * t.pitch * (1 + jit), tto = t.glide ? thz * t.glide : .98 * thz;
      const to2 = ctx.createOscillator(); to2.type = 'sine';
      to2.frequency.setValueAtTime(thz, tt); to2.frequency.exponentialRampToValueAtTime(tto, tt + tdec);
      const tf = ctx.createBiquadFilter(); tf.type = 'lowpass'; tf.frequency.value = Math.max(880, Math.min(2400, 2.2 * v.bodyLp)); tf.Q.value = .45;
      const tg = ctx.createGain();
      tg.gain.setValueAtTime(0, tt); tg.gain.linearRampToValueAtTime(t.gain * gain, tt + .006);
      tg.gain.exponentialRampToValueAtTime(8e-4, tt + .006 + tdec); tg.gain.linearRampToValueAtTime(1e-4, tt + .006 + tdec + tail);
      to2.connect(tf); tf.connect(tg); tg.connect(bus); to2.start(tt); to2.stop(tt + .006 + tdec + tail + .05);
    }
  }

  function play(roleName, voiceName) {
    if (!enabled) return;
    if (!boot()) return;
    const v = VOICES[voiceName] || VOICES.signature, role = ROLES[roleName];
    if (!role) return;
    const at = ctx.currentTime + .002;
    role.hits.forEach(h => hit(at + (h.dt || 0), v, role, h));
  }

  const Sound = {
    play,
    get enabled() { return enabled; },
    setEnabled(v) { enabled = !!v; try { localStorage.setItem(KEY, enabled ? '1' : '0'); } catch (e) {} if (enabled) boot(); },
    unlock: boot,
    ROLES: Object.keys(ROLES),
    VOICES: Object.keys(VOICES),
  };
  window.Sound = Sound;
})();
