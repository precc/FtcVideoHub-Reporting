# FTC Video Hub Telemetry Dashboard

A simple read-only web dashboard for visualizing the SQLite telemetry data produced by the FTC Video Hub app.

## Features

- Configurable SQLite database path via the `TELEMETRY_DB_PATH` environment variable
- Read-only access to the live database using SQLite WAL compatibility
- KPI cards for total events, weekly active users, and monthly active users
- Top video performance by view, click, and CTR
- Section activity and geography breakdowns
- Recent event feed
- Demo seeding script so the dashboard has data immediately in a clean checkout

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Optionally create or seed a demo database:

   ```bash
   npm run seed
   ```

3. Start the app:

   ```bash
   npm start
   ```

4. Open http://localhost:3000

## Environment

Set the database path by exporting or creating a `.env` file:

```env
PORT=3100
TELEMETRY_DB_PATH=./data/telemetry.db
```

The default location is `./data/telemetry.db`. The default port is `3100` to avoid conflicts with other local services.

## Data contract

This app expects a SQLite database with the `events` table described by the FTC Video Hub telemetry schema.

The app opens the database in read-only mode and does not write to it.

## Run Review Program

```
npm run review
```
or,
```
node scripts/review-videos.js
```
