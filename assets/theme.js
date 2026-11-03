/* Light / dark, as a button (Velvet UI's moon ↔ sun). The page follows the phone until someone taps the button;
   from then on the choice stays on this device. Each page's <head> already applied the stored class before the
   first paint, so there is no flash; this file only wires the button, the tab colour and the system preference. */
(function () {
  'use strict';
  const KEY = 'wl-theme', root = document.documentElement;
  const system = matchMedia('(prefers-color-scheme: dark)'), reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const meta = document.querySelector('meta[name="theme-color"]');
  const LIGHT = '#f4efe4', DARK = '#15120e';   // the <head> script may already have set the meta to DARK, so never read LIGHT from it
  const stored = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  const buttons = () => document.querySelectorAll('.theme-toggle');

  function paint(dark) {
    root.classList.toggle('dark', dark);
    if (meta) meta.setAttribute('content', dark ? DARK : LIGHT);
    buttons().forEach(b => b.setAttribute('aria-pressed', dark ? 'true' : 'false'));   // one model: a toggle button "Dark theme", pressed or not
  }
  function set(dark, save) {
    if (save) { try { localStorage.setItem(KEY, dark ? 'dark' : 'light'); } catch (e) {} }
    if (document.startViewTransition && !reduced.matches) document.startViewTransition(() => paint(dark));   // a short cross-fade of the whole room
    else paint(dark);
  }
  paint(root.classList.contains('dark'));
  buttons().forEach(b => b.addEventListener('click', () => {
    const dark = !root.classList.contains('dark');
    set(dark, true);
    if (window.Sound) window.Sound.play(dark ? 'toggle.on' : 'toggle.off', 'signature');
  }));
  system.addEventListener('change', (e) => { if (!stored()) set(e.matches, false); });   // no choice made yet: keep following the phone
  window.Theme = { set, get dark() { return root.classList.contains('dark'); } };
})();
