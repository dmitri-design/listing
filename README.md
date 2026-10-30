# Wishlist 2026

A one-page wishlist: cards on a wire, EN/RU, three tiers. Live at https://dmitri-design.github.io/listing/

## Structure

- `index.html` — the page shell (meta, Open Graph, language switch)
- `assets/app.css`, `assets/app.js` — styles and rendering; no framework, no build step
- `data/items.json` — **the only place content lives**: page texts (`site`), tiers, UI strings, items (EN + RU)
- `img/<id>.webp` — product images, ≤ 440 px, cut-outs or framed photos
- `tools/cut.py` — flood-fill background remover for new product photos (PIL + numpy)
- `wishlist-2026.html` — the v1 single-file build, kept as a send-as-a-file fallback

## Editing

Add or change an item in `data/items.json` (copy an existing object; `tier` is `normal | rich | god`, `status` is `wanted | got | dropped`, `avail` values are `y | g | n`). Drop its image into `img/` as `<id>.webp`. Commit, push, Pages redeploys in about a minute.

Everything visible on the page is a string in that file, in both languages.
