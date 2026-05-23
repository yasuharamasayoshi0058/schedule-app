CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  all_day INTEGER NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  owner_email TEXT NOT NULL,
  notify_before INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
