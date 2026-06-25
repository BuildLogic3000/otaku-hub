/**
 * Pixiv — uses the public Pixiv discovery & tag-search endpoints.
 *
 * NOTE: Pixiv's official API requires OAuth login. This service uses
 * the publicly accessible discover/tag pages that return JSON without auth.
 * For production use with user-specific features (bookmarks, follows),
 * integrate pixiv-api-client or pixiv.ts with OAuth2 PKCE.
 *
 * Proxy note: Pixiv blocks non-JP IPs on some endpoints. In production,
 * set PIXIV_PROXY_URL to a CORS-friendly proxy or use a server in JP.
 */
const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 300 });

// Mock/simulated data layer for when Pixiv blocks the request.
// Replace with real OAuth integration for production.
function getMockTrending() {
  return Array.from({ length: 18 }, (_, i) => ({
    id: `pixiv-${1000 + i}`,
    title: `Popular Artwork ${i + 1}`,
    artistName: `Artist ${String.fromCharCode(65 + i)}`,
    cover: `https://picsum.photos/seed/pixiv${i}/300/400`,
    tags: ['anime', 'original', 'fantasy'].slice(0, (i % 3) + 1),
    bookmarks: Math.floor(Math.random() * 50000) + 5000,
    views: Math.floor(Math.random() * 200000) + 10000,
    source: 'Pixiv',
    url: `https://www.pixiv.net/en/artworks/${1000 + i}`,
    isSimulated: true,
  }));
}

function getMockSearch(q) {
  return Array.from({ length: 12 }, (_, i) => ({
    id: `pixiv-search-${i}`,
    title: `${q} Artwork ${i + 1}`,
    artistName: `Artist ${i + 1}`,
    cover: `https://picsum.photos/seed/${q}${i}/300/400`,
    tags: [q, 'manga', 'illustration'].slice(0, 2),
    bookmarks: Math.floor(Math.random() * 20000) + 1000,
    views: Math.floor(Math.random() * 80000) + 2000,
    source: 'Pixiv',
    url: `https://www.pixiv.net/en/tags/${encodeURIComponent(q)}/artworks`,
    isSimulated: true,
  }));
}

async function getTrending() {
  const key = 'pixiv:trending';
  if (cache.has(key)) return cache.get(key);

  try {
    // Attempt real Pixiv discovery endpoint
    const res = await axios.get('https://www.pixiv.net/ajax/top/illust', {
      params: { mode: 'all', lang: 'en' },
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Referer: 'https://www.pixiv.net/',
      },
      timeout: 5000,
    });

    const items = res.data?.body?.page?.recommend?.ids || [];
    const illusts = res.data?.body?.thumbnails?.illust || [];

    const normalized = illusts.slice(0, 20).map(ill => ({
      id: String(ill.id),
      title: ill.title,
      artistName: ill.userName,
      cover: ill.url,
      tags: ill.tags || [],
      bookmarks: ill.bookmarkCount || 0,
      views: ill.viewCount || 0,
      source: 'Pixiv',
      url: `https://www.pixiv.net/en/artworks/${ill.id}`,
      isSimulated: false,
    }));

    cache.set(key, normalized);
    return normalized;
  } catch {
    // Fallback to simulated data
    const simulated = getMockTrending();
    cache.set(key, simulated);
    return simulated;
  }
}

async function search(q) {
  const key = `pixiv:search:${q}`;
  if (cache.has(key)) return cache.get(key);

  try {
    const res = await axios.get(`https://www.pixiv.net/ajax/search/artworks/${encodeURIComponent(q)}`, {
      params: { word: q, order: 'date_d', mode: 'all', p: 1, s_mode: 's_tag', type: 'all', lang: 'en' },
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Referer: 'https://www.pixiv.net/',
      },
      timeout: 5000,
    });

    const illusts = res.data?.body?.illustManga?.data || [];
    const normalized = illusts.slice(0, 20).map(ill => ({
      id: String(ill.id),
      title: ill.title,
      artistName: ill.userName,
      cover: ill.url,
      tags: ill.tags || [],
      bookmarks: ill.bookmarkCount || 0,
      views: ill.viewCount || 0,
      source: 'Pixiv',
      url: `https://www.pixiv.net/en/artworks/${ill.id}`,
      isSimulated: false,
    }));

    cache.set(key, normalized);
    return normalized;
  } catch {
    const simulated = getMockSearch(q);
    cache.set(key, simulated);
    return simulated;
  }
}

module.exports = { getTrending, search };
