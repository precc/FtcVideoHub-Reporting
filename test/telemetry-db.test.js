const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

require('../scripts/seed-demo-db.js');

const { resolveDbPath, getDashboardData } = require('../lib/telemetry-db');

const expectedPath = path.resolve(__dirname, '..', 'data', 'telemetry.db');

test('resolveDbPath defaults to the repo data directory', () => {
  assert.equal(resolveDbPath('./data/telemetry.db'), expectedPath);
  assert.equal(resolveDbPath(''), path.resolve(process.cwd(), 'data', 'telemetry.db'));
});

test('dashboard data loads from the SQLite telemetry table', () => {
  const result = getDashboardData(expectedPath);

  assert.equal(result.ok, true);
  assert.equal(typeof result.summary.totalEvents, 'number');
  assert.ok(result.summary.totalEvents > 0);
  assert.ok(result.summary.weeklyActiveUsers >= 1);
  assert.ok(Array.isArray(result.topVideos));
  assert.ok(Array.isArray(result.sectionActivity));
  assert.ok(Array.isArray(result.recentEvents));
});
