#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const Database = require('better-sqlite3');
require('dotenv').config();

function resolveDbPath(configuredPath) {
  if (!configuredPath || configuredPath.trim() === '') {
    return path.resolve(process.cwd(), 'data', 'discovered-videos.db');
  }

  return path.isAbsolute(configuredPath)
    ? configuredPath
    : path.resolve(process.cwd(), configuredPath);
}

async function prompt(question, rl) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer));
  });
}

async function main() {
  const configured = process.env.VIDEO_DB_PATH;
  const dbPath = resolveDbPath(configured);

  if (!fs.existsSync(dbPath)) {
    console.error(`Database not found at ${dbPath}`);
    process.exit(1);
  }

  const db = new Database(dbPath);

  const rows = db.prepare(`
    SELECT video_id, title, publisher, published_at, category
    FROM discovered_videos
    WHERE reviewed = 0
    ORDER BY published_at ASC
  `).all();

  if (!rows || rows.length === 0) {
    console.log('No unreviewed videos found.');
    db.close();
    return;
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log(`Found ${rows.length} unreviewed videos. Starting review...`);

  try {
    for (const row of rows) {
      console.log('------------------------------------------------------------');
      console.log(`video_id:     ${row.video_id}`);
      console.log(`title:        ${row.title}`);
      console.log(`publisher:    ${row.publisher}`);
      console.log(`published_at: ${row.published_at}`);
      console.log(`current cat:  ${row.category}`);

      const answer = await prompt("New category (enter to keep, 's' to skip, 'q' to quit): ", rl);
      const trimmed = (answer || '').trim();

      if (trimmed.toLowerCase() === 'q') {
        console.log('Aborting review session.');
        break;
      }

      if (trimmed.toLowerCase() === 's') {
        console.log(`Skipped ${row.video_id}`);
        continue;
      }

      // If empty, keep existing category
      const newCategory = trimmed === '' ? row.category : trimmed;

      const upd = db.prepare('UPDATE discovered_videos SET category = ?, reviewed = 1 WHERE video_id = ?');
      const info = upd.run(newCategory, row.video_id);

      if (info.changes && info.changes > 0) {
        console.log(`Marked ${row.video_id} reviewed (category='${newCategory}').`);
      } else {
        console.warn(`Failed to update ${row.video_id}.`);
      }
    }
  } finally {
    rl.close();
    db.close();
  }

  console.log('Review session finished.');
}

main().catch((err) => {
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
});
