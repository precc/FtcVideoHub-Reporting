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

// Timestamps are generated relative to seed time (minutes ago) rather than
// hardcoded dates, so the demo data always falls inside the dashboard's
// weekly/monthly activity windows no matter when `npm run seed` is run.
const NOW = Date.now();
function minutesAgo(minutes) {
  return new Date(NOW - minutes * 60 * 1000).toISOString();
}

const sample = [
  { event: 'page_view', category: null, video_id: null, video_title: null, publisher: null, visitor_id: 'v-001', country: 'US', path: '/', created_at: minutesAgo(7444) },
  { event: 'page_view', category: null, video_id: null, video_title: null, publisher: null, visitor_id: 'v-002', country: 'CA', path: '/', created_at: minutesAgo(6074) },
  { event: 'section_view', category: 'kickoff', video_id: null, video_title: null, publisher: null, visitor_id: 'v-001', country: 'US', path: '/', created_at: minutesAgo(7439) },
  { event: 'section_view', category: 'starter-bot', video_id: null, video_title: null, publisher: null, visitor_id: 'v-002', country: 'CA', path: '/', created_at: minutesAgo(6069) },
  { event: 'video_view', category: 'kickoff', video_id: 'vid-1', video_title: 'Kickoff Episode 1', publisher: 'FTC Hub', visitor_id: 'v-001', country: 'US', path: '/', created_at: minutesAgo(7437) },
  { event: 'video_view', category: 'kickoff', video_id: 'vid-1', video_title: 'Kickoff Episode 1', publisher: 'FTC Hub', visitor_id: 'v-003', country: 'US', path: '/', created_at: minutesAgo(4744) },
  { event: 'video_view', category: 'kickoff', video_id: 'vid-1', video_title: 'Kickoff Episode 1', publisher: 'FTC Hub', visitor_id: 'v-004', country: 'GB', path: '/', created_at: minutesAgo(3304) },
  { event: 'video_view', category: 'starter-bot', video_id: 'vid-2', video_title: 'Starter Bot Tutorial', publisher: 'Field Robotics', visitor_id: 'v-002', country: 'CA', path: '/', created_at: minutesAgo(6064) },
  { event: 'video_view', category: 'starter-bot', video_id: 'vid-2', video_title: 'Starter Bot Tutorial', publisher: 'Field Robotics', visitor_id: 'v-005', country: 'US', path: '/', created_at: minutesAgo(1294) },
  { event: 'video_view', category: 'prototypes', video_id: 'vid-3', video_title: 'Prototype Review', publisher: 'Build Lab', visitor_id: 'v-006', country: 'AU', path: '/', created_at: minutesAgo(124) },
  { event: 'video_click', category: 'kickoff', video_id: 'vid-1', video_title: 'Kickoff Episode 1', publisher: 'FTC Hub', visitor_id: 'v-001', country: 'US', path: '/', created_at: minutesAgo(7435) },
  { event: 'video_click', category: 'starter-bot', video_id: 'vid-2', video_title: 'Starter Bot Tutorial', publisher: 'Field Robotics', visitor_id: 'v-005', country: 'US', path: '/', created_at: minutesAgo(1289) },
  { event: 'video_click', category: 'prototypes', video_id: 'vid-3', video_title: 'Prototype Review', publisher: 'Build Lab', visitor_id: 'v-006', country: 'AU', path: '/', created_at: minutesAgo(121) },
  { event: 'video_click', category: 'kickoff', video_id: 'vid-1', video_title: 'Kickoff Episode 1', publisher: 'FTC Hub', visitor_id: 'v-004', country: 'GB', path: '/', created_at: minutesAgo(3299) },
  { event: 'section_view', category: 'game-analysis', video_id: null, video_title: null, publisher: null, visitor_id: 'v-004', country: 'GB', path: '/', created_at: minutesAgo(3294) },
  { event: 'section_view', category: 'field', video_id: null, video_title: null, publisher: null, visitor_id: 'v-006', country: 'AU', path: '/', created_at: minutesAgo(114) },
  { event: 'section_view', category: 'prototypes', video_id: null, video_title: null, publisher: null, visitor_id: 'v-006', country: 'AU', path: '/', created_at: minutesAgo(126) },
  { event: 'section_view', category: 'match', video_id: null, video_title: null, publisher: null, visitor_id: 'v-012', country: 'MX', path: '/', created_at: minutesAgo(4) },
  { event: 'video_view', category: 'match', video_id: 'vid-6', video_title: 'Match Highlights Week 3', publisher: 'Scouting Crew', visitor_id: 'v-012', country: 'MX', path: '/', created_at: minutesAgo(2) },
  { event: 'video_click', category: 'match', video_id: 'vid-6', video_title: 'Match Highlights Week 3', publisher: 'Scouting Crew', visitor_id: 'v-012', country: 'MX', path: '/', created_at: minutesAgo(0) },
  { event: 'video_click', category: 'field', video_id: 'vid-5', video_title: 'Field Build Walkthrough', publisher: 'Robot Lab', visitor_id: 'v-011', country: 'US', path: '/', created_at: minutesAgo(1556) },
  { event: 'page_view', category: null, video_id: null, video_title: null, publisher: null, visitor_id: 'v-007', country: 'DE', path: '/', created_at: minutesAgo(64) },
  { event: 'page_view', category: null, video_id: null, video_title: null, publisher: null, visitor_id: 'v-008', country: 'US', path: '/', created_at: minutesAgo(1924) },
  { event: 'video_view', category: 'game-analysis', video_id: 'vid-4', video_title: 'Game Analysis Deep Dive', publisher: 'League Watch', visitor_id: 'v-009', country: 'FR', path: '/', created_at: minutesAgo(484) },
  { event: 'video_click', category: 'game-analysis', video_id: 'vid-4', video_title: 'Game Analysis Deep Dive', publisher: 'League Watch', visitor_id: 'v-009', country: 'FR', path: '/', created_at: minutesAgo(482) },
  { event: 'video_view', category: 'field', video_id: 'vid-5', video_title: 'Field Build Walkthrough', publisher: 'Robot Lab', visitor_id: 'v-010', country: 'US', path: '/', created_at: minutesAgo(1564) },
  { event: 'video_view', category: 'field', video_id: 'vid-5', video_title: 'Field Build Walkthrough', publisher: 'Robot Lab', visitor_id: 'v-011', country: 'US', path: '/', created_at: minutesAgo(1559) },
  { event: 'search_click', category: null, video_id: null, video_title: null, publisher: null, visitor_id: 'v-007', country: 'DE', path: '/', created_at: minutesAgo(70) },
  { event: 'search_click', category: null, video_id: null, video_title: null, publisher: null, visitor_id: 'v-002', country: 'CA', path: '/', created_at: minutesAgo(6070) },
  { event: 'search_click', category: null, video_id: null, video_title: null, publisher: null, visitor_id: 'v-009', country: 'FR', path: '/', created_at: minutesAgo(483) },
  { event: 'search_click', category: null, video_id: null, video_title: null, publisher: null, visitor_id: 'v-012', country: 'MX', path: '/', created_at: minutesAgo(3) }
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
