-- Bookings for wishlist items. One active booking per item, enforced by the partial unique index.
-- The guest name is optional and never shown on the public page (only to the list owner).
CREATE TABLE bookings (
  id           INTEGER PRIMARY KEY,
  list         TEXT    NOT NULL,            -- wishlist slug, e.g. 'dmitri'
  item         TEXT    NOT NULL,            -- item id from the list JSON
  name         TEXT,                        -- optional, ≤ 40 chars
  token_hash   TEXT    NOT NULL,            -- sha256 of the guest's cancel token
  ip_hash      TEXT    NOT NULL,            -- sha256(ip + salt), only for abuse limits
  created_at   INTEGER NOT NULL,            -- unix seconds
  cancelled_at INTEGER,
  cancelled_by TEXT                         -- 'guest' | 'owner'
);
CREATE UNIQUE INDEX bookings_one_active ON bookings (list, item) WHERE cancelled_at IS NULL;
CREATE INDEX bookings_by_ip   ON bookings (ip_hash, created_at);
CREATE INDEX bookings_by_list ON bookings (list, cancelled_at);
