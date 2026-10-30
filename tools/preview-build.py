#!/usr/bin/env python3
"""Build a single-file preview of the public page (or the admin page) with everything inlined — data, images,
fonts, CSS, JS — so it renders in sandboxes that cannot fetch anything (the Cowork file preview, email, etc.).
Optionally forces UI states for screenshots.

usage: python3 tools/preview-build.py OUT.html [--page admin] [--lang ru] [--flip id,id] [--got id,id] [--booked id,id]
       [--mine id] [--sheet id] [--resolved] [--desktop] [--nohero] [--first id,id]
  --desktop  desktop card size (232 px) and desktop rows, inside a narrow preview panel
  --nohero   hide the header so more cards fit in one screenshot
  --first    move these items to the front of the Normal tier (to get them on screen)
"""
import base64, json, re, sys, os, mimetypes

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args = sys.argv[1:]
out = args[0] if args and not args[0].startswith('--') else 'preview.html'
opt = {}
i = 1
while i < len(args):
    a = args[i]
    if a in ('--resolved', '--desktop', '--nohero', '--debug'): opt[a[2:]] = True; i += 1
    else: opt[a[2:]] = args[i + 1]; i += 2

def read(p, mode='r'):
    with open(os.path.join(root, p), mode) as f: return f.read()
def data_url(p):
    mt = mimetypes.guess_type(p)[0] or 'application/octet-stream'
    if p.endswith('.woff2'): mt = 'font/woff2'
    if p.endswith('.webp'): mt = 'image/webp'
    return f"data:{mt};base64,{base64.b64encode(read(p, 'rb')).decode()}"

page = opt.get('page', 'index')
html = read(f'{page}.html')
data = json.load(open(os.path.join(root, 'data/items.json')))
# images → data URLs
for it in data['items']:
    img = it.get('image')
    if img and not img.startswith(('http', 'data:')) and os.path.exists(os.path.join(root, img)):
        it['image'] = data_url(img)
# forced states
for key in ('got', 'booked'):
    ids = [s for s in opt.get(key, '').split(',') if s]
    for it in data['items']:
        if it['id'] in ids:
            if key == 'got': it['status'] = 'got'
            else: it['booked'] = True
first = [s for s in opt.get('first', '').split(',') if s]
if first:
    for n, fid in enumerate(first):
        for it in data['items']:
            if it['id'] == fid: it['tier'] = 'normal'; it['order'] = -100 + n
if opt.get('sheet') or opt.get('mine') or opt.get('booked') or page == 'admin':
    data['site']['api'] = 'https://preview.invalid'   # booking UI shows; requests fail (shake path) unless --resolved

def inline_css(css):
    css = re.sub(r"url\(fonts/([^)]+)\)", lambda m: f"url({data_url('assets/fonts/' + m.group(1))})", css)
    css = css.replace('url(../img/sparkle.webp)', f"url({data_url('img/sparkle.webp')})")
    css = css.replace('url(paper.svg)', f"url({data_url('assets/paper.svg')})")
    return css

html = re.sub(r'<link rel="preload"[^>]*>\n?', '', html)
css_override = opt.get('css')   # --css /path/to/other.css replaces assets/app.css (A/B checks)
html = re.sub(r'<link rel="stylesheet" href="assets/([^"]+)">', lambda m: '<style>' + inline_css(open(css_override).read() if (css_override and m.group(1) == 'app.css') else read('assets/' + m.group(1))) + '</style>', html)

shim = f"""<script>
window.__PREVIEW = {json.dumps(opt)};
window.__DATA = {json.dumps(data, ensure_ascii=False)};
window.__BOOKED = new Set(({json.dumps(opt.get('booked', ''))}).split(',').filter(Boolean));
(function(){{
  const real = window.fetch.bind(window);
  window.fetch = function(u, o){{
    const s = String(u);
    if (s.indexOf('items.json') !== -1) return Promise.resolve(new Response(JSON.stringify(window.__DATA), {{status:200, headers:{{'Content-Type':'application/json'}}}}));
    if (s.indexOf('preview.invalid') !== -1) {{
      const m = (o && o.method) || 'GET';
      if (s.endsWith('/admin/ping')) return Promise.resolve(new Response(null, {{status:204}}));
      if (s.endsWith('/admin/bookings')) return Promise.resolve(new Response(JSON.stringify({{bookings:[{{item:'osprey',name:'Ann',created_at:1793300000}},{{item:'lg',name:null,created_at:1793200000}}]}}), {{status:200, headers:{{'Content-Type':'application/json'}}}}));
      if (/\/api\/lists\/[a-z0-9-]+$/.test(s) && m === 'GET') return Promise.resolve(new Response(JSON.stringify(window.__DATA), {{status:200, headers:{{'Content-Type':'application/json'}}}}));
      if (/\/api\/lists\/[a-z0-9-]+$/.test(s) && m === 'PUT') return Promise.resolve(new Response(JSON.stringify({{updated: Math.floor(Date.now()/1000)}}), {{status:200, headers:{{'Content-Type':'application/json'}}}}));
      const J = (b, st) => new Response(b == null ? null : JSON.stringify(b), {{status: st, headers: {{'Content-Type':'application/json'}}}});
      const later = (resp) => new Promise(r => setTimeout(() => r(resp), 300));
      if (s.endsWith('/bookings')) return Promise.resolve(J({{booked: [...window.__BOOKED]}}, 200));
      const bm = s.match(/\/items\/([a-z0-9-]+)\/book$/);
      if (bm && m === 'DELETE') {{ window.__BOOKED.delete(bm[1]); return later(new Response(null, {{status: 204}})); }}
      if (bm && m === 'POST') {{
        if (window.__PREVIEW.resolved && !window.__BOOKED.has(bm[1])) {{ window.__BOOKED.add(bm[1]); return later(J({{token:'previewtoken_previewtoken_1234'}}, 201)); }}
        return later(J({{error:'taken'}}, 409));
      }}
      return later(J({{error:'not_found'}}, 404));
    }}
    return real(u, o);
  }};
  try {{ localStorage.setItem('wl-lang', {json.dumps(opt.get('lang', 'en'))}); }} catch (e) {{}}
  if (window.__PREVIEW.page === 'admin') {{ try {{ localStorage.setItem('wl-admin:dmitri', 'preview-token-preview-token'); }} catch (e) {{}} }}
  if (window.__PREVIEW.mine) {{ try {{ localStorage.setItem('bk:dmitri:' + window.__PREVIEW.mine, 'mytoken_mytoken_mytoken_12345'); }} catch (e) {{}} }}
}})();
</script>"""
extra = ''
if opt.get('desktop'):
    extra += "<script>Object.defineProperty(window, 'innerWidth', { get: () => 1024 });</script><style>:root { --cw: 232px !important; --gap: 22px !important; }</style>"
if opt.get('nohero'):
    extra += "<style>.hero { display: none !important; } .tier:first-child { margin-top: 4px; }</style>"
html = html.replace('</head>', shim + extra + '\n</head>')
scripts = ''
for m in re.finditer(r'<script src="assets/([^"]+)" defer></script>', html):
    scripts += '<script>' + read('assets/' + m.group(1)) + '</script>\n'
html = re.sub(r'<script src="assets/[^"]+" defer></script>\n?', '', html)
after = """<script>
window.__errs = [];
window.addEventListener('error', (e) => window.__errs.push(e.message + ' @' + e.lineno));
window.addEventListener('unhandledrejection', (e) => window.__errs.push('rejection: ' + (e.reason && e.reason.message || e.reason)));
if (window.__PREVIEW.debug) setTimeout(() => {
  const d = document.createElement('pre');
  d.style.cssText = 'position:fixed;z-index:99999;left:0;right:0;bottom:0;margin:0;padding:6px 8px;background:#111;color:#0f0;font:11px/1.3 monospace;white-space:pre-wrap';
  d.textContent = 'cards ' + document.querySelectorAll('.card').length + ' · flipped ' + document.querySelectorAll('.card.flipped').length + ' · errors ' + JSON.stringify(window.__errs);
  document.body.appendChild(d);
}, 3200);
setTimeout(() => {
  const P = window.__PREVIEW;
  (P.flip || '').split(',').filter(Boolean).forEach(id => { const c = document.querySelector('.card[data-id="' + id + '"]'); if (c) c.click(); });
  if (P.undo) { const u = () => document.querySelector('.bk-undo[data-id="' + P.undo + '"]'); setTimeout(() => { if (u()) u().click(); }, 300); setTimeout(() => { if (u()) u().click(); }, 900); }
  if (P.edit) { const b = document.querySelector('.row[data-id="' + P.edit + '"]'); if (b) b.click(); }
  if (P.view) { const b = document.querySelector('.seg [data-view="' + P.view + '"]'); if (b) b.click(); }
  if (P.sheet) { const b = document.querySelector('.bk-btn[data-id="' + P.sheet + '"]'); if (b) { b.click(); closeSheet = function () {}; if (P.resolved) setTimeout(() => document.querySelector('.sheet-go').click(), 400); } }
}, 1400);
</script>"""
html = html.replace('</body>', scripts + after + '</body>')
with open(out, 'w') as f: f.write(html)
print(out, len(html) // 1024, 'KB')
