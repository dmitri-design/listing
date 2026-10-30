-- The list itself (site texts, tiers, ui strings, items) lives here once the owner edits it from admin.html.
-- data/items.json in the repo stays the seed and the offline fallback.
CREATE TABLE lists (
  slug       TEXT    PRIMARY KEY,           -- e.g. 'dmitri'
  doc        TEXT    NOT NULL,              -- the whole JSON document, as served by GET /api/lists/:slug
  updated_at INTEGER NOT NULL               -- unix seconds; also the doc's "updated" field
);

-- Photos uploaded from the phone. Small (≤ 600 KB WebP/JPEG/PNG), served by GET /api/lists/:slug/images/:id.
CREATE TABLE images (
  list       TEXT    NOT NULL,
  id         TEXT    NOT NULL,              -- item id, or item id + suffix for gallery images
  type       TEXT    NOT NULL,              -- image/webp | image/jpeg | image/png
  bytes      BLOB    NOT NULL,
  size       INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (list, id)
);
