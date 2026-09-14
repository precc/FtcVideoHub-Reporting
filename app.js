require('dotenv').config();

const express = require('express');
const path = require('path');
const { getDashboardData, resolveDbPath } = require('./lib/telemetry-db');

const app = express();
const basePort = Number(process.env.PORT) || 3100;

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`Telemetry dashboard listening on http://localhost:${port}`);
    console.log(`Database path: ${resolveDbPath(process.env.TELEMETRY_DB_PATH)}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      const nextPort = port + 1;
      if (nextPort <= basePort + 10) {
        console.warn(`Port ${port} is busy, retrying on ${nextPort}`);
        startServer(nextPort);
        return;
      }
      console.error(`No free port found starting from ${basePort}`);
      process.exit(1);
    }

    throw error;
  });
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/dashboard', (req, res) => {
  const dbPath = resolveDbPath(process.env.TELEMETRY_DB_PATH);
  const data = getDashboardData(dbPath);

  if (!data.ok) {
    res.status(404).json(data);
    return;
  }

  res.json(data);
});

app.get('/api/health', (req, res) => {
  const dbPath = resolveDbPath(process.env.TELEMETRY_DB_PATH);
  res.json({
    ok: true,
    dbPath,
    hasDb: require('fs').existsSync(dbPath)
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

startServer(basePort);
