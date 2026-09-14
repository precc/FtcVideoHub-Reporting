const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

function resolveDbPath(configuredPath) {
  if (!configuredPath || configuredPath.trim() === '') {
    return path.resolve(process.cwd(), 'data', 'telemetry.db');
  }

  return path.isAbsolute(configuredPath)
    ? configuredPath
    : path.resolve(process.cwd(), configuredPath);
}

function getDashboardData(dbPath) {
  if (!fs.existsSync(dbPath)) {
    return {
      ok: false,
      error: `Database not found at ${dbPath}`,
      dbPath,
      message: 'Seed a demo DB or point TELEMETRY_DB_PATH at the live SQLite file.'
    };
  }

  try {
    const db = new Database(dbPath, { readonly: true, fileMustExist: true });

    const totalEvents = db.prepare('SELECT COUNT(*) AS count FROM events').get().count;
    const weeklyActiveUsers = db.prepare("SELECT COUNT(DISTINCT visitor_id) AS count FROM events WHERE created_at >= datetime('now', '-7 days')").get().count;
    const monthlyActiveUsers = db.prepare("SELECT COUNT(DISTINCT visitor_id) AS count FROM events WHERE created_at >= datetime('now', '-30 days')").get().count;
    const latestEvent = db.prepare('SELECT * FROM events ORDER BY created_at DESC LIMIT 1').get();

    const topVideos = db.prepare(`
      SELECT
        video_id,
        MAX(video_title) AS video_title,
        COUNT(DISTINCT CASE WHEN event = 'video_view' THEN id END) AS views,
        COUNT(DISTINCT CASE WHEN event = 'video_click' THEN id END) AS clicks,
        ROUND(1.0 * COUNT(DISTINCT CASE WHEN event = 'video_click' THEN id END) / NULLIF(COUNT(DISTINCT CASE WHEN event = 'video_view' THEN id END), 0), 4) AS click_rate
      FROM events
      WHERE video_id IS NOT NULL
      GROUP BY video_id
      ORDER BY click_rate DESC, views DESC, clicks DESC
      LIMIT 10
    `).all();

    const sectionActivity = db.prepare(`
      SELECT category, COUNT(DISTINCT visitor_id) AS active_visitors
      FROM events
      WHERE event = 'section_view'
        AND created_at >= datetime('now', '-7 days')
        AND category IS NOT NULL
      GROUP BY category
      ORDER BY active_visitors DESC, category ASC
    `).all();

    const geography = db.prepare(`
      SELECT country, COUNT(DISTINCT visitor_id) AS visitors
      FROM events
      GROUP BY country
      ORDER BY visitors DESC, country ASC
    `).all();

    const recentEvents = db.prepare(`
      SELECT event, category, video_id, video_title, country, visitor_id, created_at
      FROM events
      ORDER BY created_at DESC
      LIMIT 20
    `).all();

    const summary = {
      totalEvents,
      weeklyActiveUsers,
      monthlyActiveUsers,
      latestEvent: latestEvent ? {
        event: latestEvent.event,
        category: latestEvent.category,
        video_title: latestEvent.video_title,
        country: latestEvent.country,
        created_at: latestEvent.created_at,
        visitor_id: latestEvent.visitor_id
      } : null
    };

    db.close();

    return {
      ok: true,
      dbPath,
      summary,
      topVideos,
      sectionActivity,
      geography,
      recentEvents
    };
  } catch (error) {
    return {
      ok: false,
      error: 'Database query failed',
      dbPath,
      message: error.message
    };
  }
}

module.exports = {
  resolveDbPath,
  getDashboardData
};
