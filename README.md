# Wishlist 2026

A one-page wishlist: cards on a wire, EN/RU, three tiers. Friends book a gift so nobody doubles up; the owner edits everything from a phone. Live at https://dmitri-design.github.io/listing/

## Structure

- `index.html` — the page shell (meta, Open Graph, sound pill, language switch)
- `assets/app.css`, `assets/app.js` — styles and rendering; no framework, no build step
- `assets/sounds.js` — interface sounds synthesized with Web Audio (a port of [Velvet UI](https://velvet-ui-eight.vercel.app) by 24h.studio): Signature voice for the language switch and the booking confirmation, Crisp for the card flip
- `admin.html`, `assets/admin.css`, `assets/admin.js` — the owner dashboard: add, edit, cross off (got it), hide, reorder, delete, photos, bookings, page texts
- `worker/` — the API on Cloudflare Workers + D1: bookings, the live list, uploaded photos, owner endpoints (see the header of `worker/index.js`)
- `data/items.json` — seed and offline fallback: page texts (`site`), tiers, UI strings, items (EN + RU). Once the API is live, the list is edited in admin.html and lives in D1
- `img/<id>.webp` — product images in the repo, ≤ 440 px, cut-outs or framed photos
- `tools/` — `deploy-api.mjs` (deploy, safe to re-run), `worker-test.mjs` (offline API test), `race-test.mjs` (parallel booking test), `preview-build.py` (single-file preview with forced states), `cut.py` (background remover)

## Deploy the API

```
npx wrangler login
node tools/deploy-api.mjs
```

The script creates the D1 database, applies migrations, deploys the Worker, sets the secrets, seeds the list from `data/items.json` (first run only), writes the API address into `data/items.json → site.api`, and saves the admin password to `admin.token` (gitignored). Commit and push; booking and admin.html switch on.

Re-running it is safe, e.g. to deploy a Worker fix: the live list you edit in admin.html stays as it is (if the workers.dev address changed, only its `site.api` follows). `node tools/deploy-api.mjs --reseed` is the one way to overwrite the live list with `data/items.json`, so run admin.html → Export JSON first.

## Editing

From the iPhone: open `/admin.html` in Safari and add it to the Home Screen first (Share → Add to Home Screen). Then open it from the Home Screen icon and paste the password from `admin.token` there: a Home Screen web app keeps its own storage, separate from Safari, so a password pasted in Safari does not carry over. Saves go live on the next page load. If another device saved in the meantime, the save is refused instead of overwriting that change: reload and redo it.

By hand (before the API exists, or for bulk edits): change `data/items.json` (copy an existing object; `tier` is `normal | rich | god`, `status` is `wanted | got | dropped`, `avail` values are `y | g | n`), drop the image into `img/` as `<id>.webp`, commit, push. Once the API is live, the live list wins and the repo file is only the seed and offline fallback. To push repo edits over it: admin.html → Export JSON (the live copy, with everything edited on the phone), make your changes in that file, save it as `data/items.json`, then `node tools/deploy-api.mjs --reseed`.

Everything visible on the page is a string, in both languages.
