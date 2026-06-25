/**
 * OtakuHub — Render helpers
 * Pure functions that return HTML strings or DOM nodes.
 */

const Render = (() => {

  function scoreStars(score) {
    if (!score) return '';
    const s = (score / 10).toFixed(1);
    return `<span class="card-score">★ ${s}</span>`;
  }

  // Generic anime/manga card
  function card({ id, title, cover, score, genres = [], tags = [], source, url, _type }) {
    const genreList = [...genres, ...tags].slice(0, 2);
    return `
      <div class="card" data-id="${id}" data-source="${source}" data-url="${url || ''}" data-type="${_type || ''}">
        <span class="card-source-dot">${source}</span>
        <img class="card-cover" src="${cover || '/assets/placeholder.svg'}" alt="${title}" loading="lazy"
             onerror="this.src='/assets/placeholder.svg'" />
        <div class="card-info">
          <p class="card-title">${title || 'Unknown'}</p>
          <div class="card-meta">
            ${scoreStars(score)}
            ${genreList.map(g => `<span class="card-tag">${g}</span>`).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // Pixiv art card
  function pixivCard(item) {
    return `
      <div class="pixiv-card" data-url="${item.url}" data-type="pixiv-art">
        ${item.isSimulated ? '<span class="pixiv-sim-badge">preview</span>' : ''}
        <img src="${item.cover}" alt="${item.title}" loading="lazy"
             onerror="this.src='/assets/placeholder.svg'" />
        <div class="pixiv-card-info">
          <p class="pixiv-card-title">${item.title}</p>
          <p class="pixiv-card-artist">by ${item.artistName}</p>
        </div>
      </div>
    `;
  }

  // Section header HTML
  function sectionHeader(title, subtitle, source) {
    return `
      <div class="section-header">
        <h2 class="section-title">${title}</h2>
        ${subtitle ? `<span class="section-subtitle">${subtitle}</span>` : ''}
        ${source ? `<span class="section-source">${source}</span>` : ''}
      </div>
    `;
  }

  // Hero banner (takes first featured item)
  function hero(item) {
    const banner = item.banner || item.cover || '';
    const genres = [...(item.genres || []), ...(item.tags || [])].slice(0, 5);
    return `
      <div class="hero">
        ${banner ? `<img class="hero-bg" src="${banner}" alt="" />` : ''}
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <p class="hero-eyebrow">Featured · ${item.source || ''}</p>
          <h1 class="hero-title">${item.title || ''}</h1>
          ${item.description ? `<p class="hero-desc">${truncate(item.description, 180)}</p>` : ''}
          <div class="hero-tags">
            ${genres.map(g => `<span class="hero-tag">${g}</span>`).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // Modal body for an anime/manga item
  function modalContent(item) {
    const genres = [...(item.genres || []), ...(item.tags || [])];
    const stats = [];

    if (item.score)      stats.push({ label: 'Score',    value: `★ ${(item.score / 10).toFixed(1)}` });
    if (item.episodes)   stats.push({ label: 'Episodes', value: item.episodes });
    if (item.chapters)   stats.push({ label: 'Chapters', value: item.chapters });
    if (item.status)     stats.push({ label: 'Status',   value: item.status });
    if (item.seasonYear) stats.push({ label: 'Year',     value: item.seasonYear });
    if (item.studio)     stats.push({ label: 'Studio',   value: item.studio });

    return `
      ${item.cover ? `<img class="modal-cover" src="${item.cover}" alt="${item.title}" onerror="this.style.display='none'" />` : ''}
      <div class="modal-content">
        <p class="modal-source">${item.source || ''}</p>
        <h2 class="modal-title">${item.title || ''}</h2>
        ${genres.length ? `
          <div class="modal-tags">
            ${genres.slice(0, 8).map(g => `<span class="modal-tag">${g}</span>`).join('')}
          </div>` : ''}
        ${stats.length ? `
          <div class="modal-stats">
            ${stats.map(s => `
              <div class="modal-stat-item">
                <span class="modal-stat-label">${s.label}</span>
                <span class="modal-stat-value">${s.value}</span>
              </div>`).join('')}
          </div>` : ''}
        ${item.description ? `<p class="modal-desc">${truncate(item.description, 400)}</p>` : ''}
        ${item.url ? `<a class="modal-link" href="${item.url}" target="_blank" rel="noopener">
          View on ${item.source} ↗
        </a>` : ''}
      </div>
    `;
  }

  // Schedule day column
  function scheduleDay(dayName, items) {
    const rows = items.slice(0, 8).map(a => `
      <div class="schedule-item" data-url="${a.url}" data-type="schedule-anime"
           data-title="${a.title}" data-cover="${a.cover || ''}" data-source="${a.source}">
        <img class="schedule-thumb" src="${a.cover || '/assets/placeholder.svg'}" alt="${a.title}"
             onerror="this.src='/assets/placeholder.svg'" loading="lazy" />
        <div>
          <p class="schedule-item-title">${a.title}</p>
          ${a.score ? `<p class="schedule-item-score">★ ${a.score}</p>` : ''}
        </div>
      </div>
    `).join('');

    return `
      <div class="schedule-day">
        <p class="schedule-day-name">${dayName}</p>
        ${rows || '<p style="font-size:.78rem;color:var(--text-muted)">No data</p>'}
      </div>
    `;
  }

  function truncate(str, max) {
    if (!str) return '';
    return str.length > max ? str.slice(0, max) + '…' : str;
  }

  return { card, pixivCard, sectionHeader, hero, modalContent, scheduleDay };
})();
