const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbDir = path.resolve(__dirname, '..', 'data');
const dbPath = path.join(dbDir, 'telemetry.db');

fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(dbPath);

db.exec(`
  DROP TABLE IF EXISTS events;

  CREATE TABLE events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event TEXT NOT NULL,
    category TEXT,
    video_id TEXT,
    video_title TEXT,
    publisher TEXT,
    visitor_id TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'XX',
    path TEXT,
    created_at TEXT NOT NULL
  );

  CREATE INDEX idx_events_created_at ON events(created_at);
  CREATE INDEX idx_events_visitor_id ON events(visitor_id);
  CREATE INDEX idx_events_event ON events(event);
  CREATE INDEX idx_events_category ON events(category);
  CREATE INDEX idx_events_video_id ON events(video_id);
`);

const insert = db.prepare(`
  INSERT INTO events (event, category, video_id, video_title, publisher, visitor_id, country, path, created_at)
  VALUES (@event, @category, @video_id, @video_title, @publisher, @visitor_id, @country, @path, @created_at)
`);

const sample = [
  { event: 'page_view', category: null, video_id: null, video_title: null, publisher: null, visitor_id: 'v-001', country: 'US', path: '/', created_at: '2026-09-08T12:00:00.000Z' },
  { event: 'page_view', category: null, video_id: null, video_title: null, publisher: null, visitor_id: 'v-002', country: 'CA', path: '/', created_at: '2026-09-09T10:50:00.000Z' },
  { event: 'section_view', category: 'kickoff', video_id: null, video_title: null, publisher: null, visitor_id: 'v-001', country: 'US', path: '/', created_at: '2026-09-08T12:05:00.000Z' },
  { event: 'section_view', category: 'starter-bot', video_id: null, video_title: null, publisher: null, visitor_id: 'v-002', country: 'CA', path: '/', created_at: '2026-09-09T10:55:00.000Z' },
  { event: 'video_view', category: 'kickoff', video_id: 'vid-1', video_title: 'Kickoff Episode 1', publisher: 'FTC Hub', visitor_id: 'v-001', country: 'US', path: '/', created_at: '2026-09-08T12:07:00.500Z' },
  { event: 'video_view', category: 'kickoff', video_id: 'vid-1', video_title: 'Kickoff Episode 1', publisher: 'FTC Hub', visitor_id: 'v-003', country: 'US', path: '/', created_at: '2026-09-10T09:00:00.500Z' },
  { event: 'video_view', category: 'kickoff', video_id: 'vid-1', video_title: 'Kickoff Episode 1', publisher: 'FTC Hub', visitor_id: 'v-004', country: 'GB', path: '/', created_at: '2026-09-11T09:00:00.500Z' },
  { event: 'video_view', category: 'starter-bot', video_id: 'vid-2', video_title: 'Starter Bot Tutorial', publisher: 'Field Robotics', visitor_id: 'v-002', country: 'CA', path: '/', created_at: '2026-09-09T11:00:00.500Z' },
  { event: 'video_view', category: 'starter-bot', video_id: 'vid-2', video_title: 'Starter Bot Tutorial', publisher: 'Field Robotics', visitor_id: 'v-005', country: 'US', path: '/', created_at: '2026-09-12T18:30:00.500Z' },
  { event: 'video_view', category: 'prototypes', video_id: 'vid-3', video_title: 'Prototype Review', publisher: 'Build Lab', visitor_id: 'v-006', country: 'AU', path: '/', created_at: '2026-09-13T14:00:00.500Z' },
  { event: 'video_click', category: 'kickoff', video_id: 'vid-1', video_title: 'Kickoff Episode 1', publisher: 'FTC Hub', visitor_id: 'v-001', country: 'US', path: '/', created_at: '2026-09-08T12:09:00.000Z' },
  { event: 'video_click', category: 'starter-bot', video_id: 'vid-2', video_title: 'Starter Bot Tutorial', publisher: 'Field Robotics', visitor_id: 'v-005', country: 'US', path: '/', created_at: '2026-09-12T18:35:00.000Z' },
  { event: 'video_click', category: 'prototypes', video_id: 'vid-3', video_title: 'Prototype Review', publisher: 'Build Lab', visitor_id: 'v-006', country: 'AU', path: '/', created_at: '2026-09-13T14:03:00.000Z' },
  { event: 'video_click', category: 'kickoff', video_id: 'vid-1', video_title: 'Kickoff Episode 1', publisher: 'FTC Hub', visitor_id: 'v-004', country: 'GB', path: '/', created_at: '2026-09-11T09:05:00.000Z' },
  { event: 'section_view', category: 'game-analysis', video_id: null, video_title: null, publisher: null, visitor_id: 'v-004', country: 'GB', path: '/', created_at: '2026-09-11T09:10:00.000Z' },
  { event: 'section_view', category: 'field', video_id: null, video_title: null, publisher: null, visitor_id: 'v-006', country: 'AU', path: '/', created_at: '2026-09-13T14:10:00.000Z' },
  { event: 'page_view', category: null, video_id: null, video_title: null, publisher: null, visitor_id: 'v-007', country: 'DE', path: '/', created_at: '2026-09-13T15:00:00.000Z' },
  { event: 'page_view', category: null, video_id: null, video_title: null, publisher: null, visitor_id: 'v-008', country: 'US', path: '/', created_at: '2026-09-12T08:00:00.000Z' },
  { event: 'video_view', category: 'game-analysis', video_id: 'vid-4', video_title: 'Game Analysis Deep Dive', publisher: 'League Watch', visitor_id: 'v-009', country: 'FR', path: '/', created_at: '2026-09-13T08:00:00.500Z' },
  { event: 'video_click', category: 'game-analysis', video_id: 'vid-4', video_title: 'Game Analysis Deep Dive', publisher: 'League Watch', visitor_id: 'v-009', country: 'FR', path: '/', created_at: '2026-09-13T08:02:00.000Z' },
  { event: 'video_view', category: 'field', video_id: 'vid-5', video_title: 'Field Build Walkthrough', publisher: 'Robot Lab', visitor_id: 'v-010', country: 'US', path: '/', created_at: '2026-09-12T14:00:00.500Z' },
  { event: 'video_view', category: 'field', video_id: 'vid-5', video_title: 'Field Build Walkthrough', publisher: 'Robot Lab', visitor_id: 'v-011', country: 'US', path: '/', created_at: '2026-09-12T14:05:00.500Z' }
];

const tx = db.transaction((rows) => {
  for (const row of rows) {
    insert.run(row);
  }
});

tx(sample);

console.log(`Seeded demo telemetry DB at ${dbPath}`);
console.log(`Rows inserted: ${sample.length}`);

db.close();
