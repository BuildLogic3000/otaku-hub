/**
 * OtakuHub — Main application controller
 */

const App = (() => {
  const content    = document.getElementById('content');
  const loader     = document.getElementById('loader');
  const backdrop   = document.getElementById('modalBackdrop');
  const modalBody  = document.getElementById('modalBody');
  const modalClose = document.getElementById('modalClose');
  const searchInput = document.getElementById('searchInput');
  const searchBtn   = document.getElementById('searchBtn');
  const menuToggle  = document.getElementById('menuToggle');
  const sidebar     = document.getElementById('sidebar');

  // ── Utilities ──────────────────────────────────────

  function showLoader() {
    loader.classList.add('visible');
    content.innerHTML = '';
    content.appendChild(loader);
  }

  function hideLoader() {
    loader.classList.remove('visible');
  }

  function setActiveNav(view) {
    document.querySelectorAll('.nav-link').forEach(el => {
      el.classList.toggle('active', el.dataset.view === view);
    });
  }

  function openModal(html) {
    modalBody.innerHTML = html;
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  function renderCards(items, type) {
    return items.map(item => Render.card({ ...item, _type: type })).join('');
  }

  function attachCardClicks() {
    content.querySelectorAll('.card').forEach(el => {
      el.addEventListener('click', () => {
        const { id, source, url, type } = el.dataset;
        const title = el.querySelector('.card-title')?.textContent;
        const cover = el.querySelector('.card-cover')?.src;
        openModal(Render.modalContent({
          id, source, url, title, cover,
          score: el.querySelector('.card-score')?.textContent?.replace('★ ', '') * 10 || null,
        }));
      });
    });

    content.querySelectorAll('.pixiv-card').forEach(el => {
      el.addEventListener('click', () => {
        window.open(el.dataset.url, '_blank', 'noopener');
      });
    });

    content.querySelectorAll('.schedule-item').forEach(el => {
      el.addEventListener('click', () => {
        window.open(el.dataset.url, '_blank', 'noopener');
      });
    });
  }

  // ── Views ───────────────────────────────────────────

  async function viewHome() {
    setActiveNav('home');
    showLoader();
    try {
      const [trendingAnime, trendingManga] = await Promise.all([
        API.animeTrending(),
        API.mangaTrending(),
      ]);

      const animeItems = trendingAnime.data || [];
      const mangaItems = trendingManga.data || [];

      const featured = animeItems[0];

      let html = '';
      if (featured) html += Render.hero(featured);

      html += Render.sectionHeader('Trending Anime', 'Most watched right now', 'AniList');
      html += `<div class="cards-grid">${renderCards(animeItems.slice(0, 12), 'anime')}</div>`;

      html += Render.sectionHeader('Trending Manga & Manhwa', 'Hot on MangaDex', 'MangaDex');
      html += `<div class="cards-grid">${renderCards(mangaItems.slice(0, 12), 'manga')}</div>`;

      hideLoader();
      content.innerHTML = html;
      attachCardClicks();
    } catch (e) {
      hideLoader();
      content.innerHTML = `<div class="error-box">Failed to load home: ${e.message}</div>`;
    }
  }

  async function viewTrendingAnime() {
    setActiveNav('trending-anime');
    showLoader();
    try {
      const res = await API.animeTrending();
      const items = res.data || [];

      let html = Render.sectionHeader('Trending Anime', `${items.length} titles`, 'AniList');
      html += `<div class="cards-grid">${renderCards(items, 'anime')}</div>`;

      hideLoader();
      content.innerHTML = html;
      attachCardClicks();
    } catch (e) {
      hideLoader();
      content.innerHTML = `<div class="error-box">Error: ${e.message}</div>`;
    }
  }

  async function viewTrendingManga() {
    setActiveNav('trending-manga');
    showLoader();
    try {
      const res = await API.mangaTrending();
      const items = res.data || [];

      let html = Render.sectionHeader('Trending Manga & Manhwa', `${items.length} titles`, 'MangaDex');
      html += `<div class="cards-grid">${renderCards(items, 'manga')}</div>`;

      hideLoader();
      content.innerHTML = html;
      attachCardClicks();
    } catch (e) {
      hideLoader();
      content.innerHTML = `<div class="error-box">Error: ${e.message}</div>`;
    }
  }

  async function viewSeasonal() {
    setActiveNav('seasonal');
    showLoader();
    try {
      const res = await API.animeSeasonal();
      const items = res.data || [];
      const season = items[0]?.season || 'Current';
      const year   = items[0]?.seasonYear || '';

      let html = Render.sectionHeader(`${season} ${year}`, 'Airing this season', 'AniList');
      html += `<div class="cards-grid">${renderCards(items, 'anime')}</div>`;

      hideLoader();
      content.innerHTML = html;
      attachCardClicks();
    } catch (e) {
      hideLoader();
      content.innerHTML = `<div class="error-box">Error: ${e.message}</div>`;
    }
  }

  async function viewTopMAL() {
    setActiveNav('top-mal');
    showLoader();
    try {
      const [animeRes, mangaRes] = await Promise.all([
        API.malTopAnime(),
        API.malTopManga(),
      ]);

      const anime = animeRes.data || [];
      const manga = mangaRes.data || [];

      let html = `
        <div class="section-header">
          <h2 class="section-title">MAL Top Charts</h2>
          <span class="section-source">MyAnimeList</span>
        </div>
        <div class="tabs">
          <button class="tab-btn active" data-tab="anime">Top Anime</button>
          <button class="tab-btn" data-tab="manga">Top Manga</button>
        </div>
        <div id="tab-anime">
          <div class="cards-grid">${renderCards(anime, 'mal-anime')}</div>
        </div>
        <div id="tab-manga" style="display:none">
          <div class="cards-grid">${renderCards(manga, 'mal-manga')}</div>
        </div>
      `;

      hideLoader();
      content.innerHTML = html;
      attachCardClicks();

      // Tab switching
      content.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          content.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const tab = btn.dataset.tab;
          document.getElementById('tab-anime').style.display = tab === 'anime' ? '' : 'none';
          document.getElementById('tab-manga').style.display = tab === 'manga' ? '' : 'none';
        });
      });

    } catch (e) {
      hideLoader();
      content.innerHTML = `<div class="error-box">Error: ${e.message}</div>`;
    }
  }

  async function viewSchedule() {
    setActiveNav('schedule');
    showLoader();
    try {
      const res = await API.malSchedule();
      const schedule = res.data || {};

      const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
      let html = Render.sectionHeader('Airing Schedule', 'Weekly broadcast times', 'MyAnimeList');
      html += '<div class="schedule-grid">';
      days.forEach(d => {
        html += Render.scheduleDay(d.charAt(0).toUpperCase() + d.slice(1), schedule[d] || []);
      });
      html += '</div>';

      hideLoader();
      content.innerHTML = html;
      attachCardClicks();
    } catch (e) {
      hideLoader();
      content.innerHTML = `<div class="error-box">Error loading schedule: ${e.message}</div>`;
    }
  }

  async function viewPixiv() {
    setActiveNav('pixiv');
    showLoader();
    try {
      const res = await API.pixivTrending();
      const items = res.data || [];
      const hasSimulated = items.some(i => i.isSimulated);

      let html = Render.sectionHeader('Pixiv — Trending Art', 'Popular illustrations & manga', 'Pixiv');

      if (hasSimulated) {
        html += `<div class="error-box" style="margin-bottom:16px">
          ⚠️ Pixiv blocks direct API access from non-JP servers. Showing preview data.
          For live data, add a Pixiv OAuth token or a Japan-based proxy.
        </div>`;
      }

      html += '<div class="pixiv-grid">';
      items.forEach(item => { html += Render.pixivCard(item); });
      html += '</div>';

      hideLoader();
      content.innerHTML = html;
      attachCardClicks();
    } catch (e) {
      hideLoader();
      content.innerHTML = `<div class="error-box">Error: ${e.message}</div>`;
    }
  }

  async function viewSearch(q) {
    showLoader();
    try {
      const res = await API.search(q);
      const { manga = [], anime = [], pixiv = [] } = res.results || {};

      let html = Render.sectionHeader(`Results for "${q}"`, `${manga.length + anime.length + pixiv.length} items found`);

      if (anime.length) {
        html += `<div class="search-section">
          ${Render.sectionHeader('Anime', '', 'AniList')}
          <div class="cards-grid">${renderCards(anime.slice(0, 8), 'anime')}</div>
        </div>`;
      }

      if (manga.length) {
        html += `<div class="search-section">
          ${Render.sectionHeader('Manga & Manhwa', '', 'MangaDex')}
          <div class="cards-grid">${renderCards(manga.slice(0, 8), 'manga')}</div>
        </div>`;
      }

      if (pixiv.length) {
        html += `<div class="search-section">
          ${Render.sectionHeader('Pixiv Art', '', 'Pixiv')}
          <div class="pixiv-grid">${pixiv.slice(0, 12).map(Render.pixivCard).join('')}</div>
        </div>`;
      }

      if (!anime.length && !manga.length && !pixiv.length) {
        html += `<div class="empty-state">
          <div class="empty-icon">🔍</div>
          <p>No results for "${q}"</p>
        </div>`;
      }

      hideLoader();
      content.innerHTML = html;
      attachCardClicks();
    } catch (e) {
      hideLoader();
      content.innerHTML = `<div class="error-box">Search error: ${e.message}</div>`;
    }
  }

  // ── Router ──────────────────────────────────────────

  const views = {
    'home':           viewHome,
    'trending-anime': viewTrendingAnime,
    'trending-manga': viewTrendingManga,
    'seasonal':       viewSeasonal,
    'top-mal':        viewTopMAL,
    'schedule':       viewSchedule,
    'pixiv':          viewPixiv,
  };

  function navigate(view) {
    if (sidebar.classList.contains('open')) {
      sidebar.classList.remove('open');
    }
    const fn = views[view];
    if (fn) fn();
  }

  // ── Event listeners ─────────────────────────────────

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(link.dataset.view);
    });
  });

  function doSearch() {
    const q = searchInput.value.trim();
    if (!q) return;
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    viewSearch(q);
  }

  searchBtn.addEventListener('click', doSearch);
  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') doSearch();
  });

  modalClose.addEventListener('click', closeModal);
  backdrop.addEventListener('click', e => {
    if (e.target === backdrop) closeModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  // ── Init ─────────────────────────────────────────────
  navigate('home');

})();
