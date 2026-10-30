// Race test: N parallel bookings of one item must produce exactly one 201.
// usage: node tools/race-test.mjs <api-base> <list> <item> [n] [origin]
const [base = 'http://127.0.0.1:8787', list = 'dmitri', item = 'osprey', n = '20', origin = 'http://127.0.0.1:8765'] = process.argv.slice(2);
const url = `${base}/api/lists/${list}/items/${item}/book`;
// Fake client IPs only work against `wrangler dev`; Cloudflare's edge rejects a client-sent CF-Connecting-IP (403, error 1000).
const local = /^http:\/\/(127\.0\.0\.1|localhost)[:/]/.test(base + '/');
// A request that fails (network error) counts as status 0; it never stops the cleanup below.
const res = await Promise.all(Array.from({ length: +n }, (_, i) =>
  fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin, ...(local ? { 'CF-Connecting-IP': `10.0.0.${i + 1}` } : {}) }, body: JSON.stringify({ name: `racer ${i}` }) })
    .then(async r => ({ status: r.status, body: await r.json().catch(() => null) }))
    .catch(() => ({ status: 0, body: null }))));
const count = res.reduce((m, r) => (m[r.status] = (m[r.status] || 0) + 1, m), {});
console.log(JSON.stringify({ item, attempts: +n, statuses: count }));
for (const w of res.filter(r => r.status === 201)) {   // clean up every winner so the test leaves no booking behind
  const d = w.body && w.body.token ? await fetch(url, { method: 'DELETE', headers: { Origin: origin, Authorization: `Bearer ${w.body.token}` } }).then(r => r.status, () => 0) : 0;
  console.log('cleanup', d || `failed: clear "${item}" in admin.html → Bookings`);
}
if (count[0]) console.log(`${count[0]} request(s) failed; if one of them was booked, "${item}" stays booked: clear it in admin.html → Bookings`);
process.exit(count[201] === 1 ? 0 : 1);
