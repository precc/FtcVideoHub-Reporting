async function loadDashboard() {
  const dbStatus = document.getElementById('dbStatus');
  const kpiGrid = document.getElementById('kpiGrid');
  const topVideos = document.getElementById('topVideos');
  const sectionActivity = document.getElementById('sectionActivity');
  const geography = document.getElementById('geography');
  const recentEvents = document.getElementById('recentEvents');

  try {
    const response = await fetch('/api/dashboard');
    const payload = await response.json();

    if (!response.ok || !payload.ok) {
      dbStatus.textContent = 'DB unavailable';
      dbStatus.style.color = '#fca5a5';
      kpiGrid.innerHTML = `<div class="kpi-card"><p class="kpi-label">Status</p><p class="kpi-value">No data</p><p class="kpi-meta">${payload.message || payload.error || 'Check database path.'}</p></div>`;
      return;
    }

    dbStatus.textContent = `Live DB: ${payload.dbPath}`;
    dbStatus.style.color = '#7dd3fc';

    const cards = [
      { label: 'Total events', value: payload.summary.totalEvents.toLocaleString(), meta: 'all time' },
      { label: 'Weekly active users', value: payload.summary.weeklyActiveUsers.toLocaleString(), meta: 'last 7 days' },
      { label: 'Monthly active users', value: payload.summary.monthlyActiveUsers.toLocaleString(), meta: 'last 30 days' },
      { label: 'Latest event', value: payload.summary.latestEvent ? payload.summary.latestEvent.event : '—', meta: payload.summary.latestEvent ? new Date(payload.summary.latestEvent.created_at).toLocaleString() : 'No data' }
    ];

    kpiGrid.innerHTML = cards.map((card) => `
      <article class="kpi-card">
        <p class="kpi-label">${card.label}</p>
        <p class="kpi-value">${card.value}</p>
        <p class="kpi-meta">${card.meta}</p>
      </article>
    `).join('');

    topVideos.innerHTML = renderVideoTable(payload.topVideos);
    sectionActivity.innerHTML = renderList(payload.sectionActivity, 'category', 'active_visitors');
    geography.innerHTML = renderList(payload.geography, 'country', 'visitors');
    recentEvents.innerHTML = renderRecentEvents(payload.recentEvents);
  } catch (error) {
    dbStatus.textContent = 'Request failed';
    dbStatus.style.color = '#fca5a5';
    kpiGrid.innerHTML = `<div class="kpi-card"><p class="kpi-label">Status</p><p class="kpi-value">Error</p><p class="kpi-meta">${error.message}</p></div>`;
  }
}

function renderVideoTable(data) {
  if (!data || data.length === 0) {
    return '<div class="empty-state">No video impressions recorded yet.</div>';
  }

  const rows = data.map((row) => `
    <tr>
      <td>${escapeHtml(row.video_title || row.video_id || 'Unknown')}</td>
      <td>${Number(row.views || 0).toLocaleString()}</td>
      <td>${Number(row.clicks || 0).toLocaleString()}</td>
      <td><span class="metric-badge">${Number(row.click_rate || 0).toFixed(3)}</span></td>
    </tr>
  `).join('');

  return `
    <table>
      <thead>
        <tr>
          <th>Video</th>
          <th>Views</th>
          <th>Clicks</th>
          <th>CTR</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function renderList(data, keyName, valueName) {
  if (!data || data.length === 0) {
    return '<div class="empty-state">No data available.</div>';
  }

  return `
    <div class="list-wrap">
      ${data.map((row) => `
        <div class="list-row">
          <span class="list-key">${escapeHtml(row[keyName] || 'Unknown')}</span>
          <span class="list-value">${Number(row[valueName]).toLocaleString()}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function renderRecentEvents(data) {
  if (!data || data.length === 0) {
    return '<div class="empty-state">No events recorded.</div>';
  }

  const rows = data.map((row) => `
    <tr>
      <td>${escapeHtml(row.event)}</td>
      <td>${escapeHtml(row.category || '—')}</td>
      <td>${escapeHtml(row.video_title || row.video_id || '—')}</td>
      <td>${escapeHtml(row.country || 'XX')}</td>
      <td>${new Date(row.created_at).toLocaleString()}</td>
    </tr>
  `).join('');

  return `
    <table>
      <thead>
        <tr>
          <th>Event</th>
          <th>Category</th>
          <th>Video</th>
          <th>Country</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

loadDashboard();
