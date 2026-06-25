/**
 * MangaDex v5 API — public, no auth required for browsing.
 * Docs: https://api.mangadex.org/docs
 */
const axios = require('axios');
const NodeCache = require('node-cache');

const BASE = 'https://api.mangadex.org';
const cache = new NodeCache({ stdTTL: 300 }); // 5-min cache

function coverUrl(mangaId, fileName) {
  if (!fileName) return null;
  return `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.256.jpg`;
}

function normalizeManga(item) {
  const attr = item.attributes || {};
  const title =
    attr.title?.en ||
    Object.values(attr.title || {})[0] ||
    'Unknown Title';

  const coverRel = (item.relationships || []).find(r => r.type === 'cover_art');
  const coverFile = coverRel?.attributes?.fileName || null;

  return {
    id: item.id,
    title,
    description: attr.description?.en || '',
    status: attr.status,
    year: attr.year,
    contentRating: attr.contentRating,
    tags: (attr.tags || []).map(t => t.attributes?.name?.en).filter(Boolean),
    cover: coverUrl(item.id, coverFile),
    source: 'MangaDex',
    url: `https://mangadex.org/title/${item.id}`,
  };
}

async function getTrending() {
  const key = 'mangadex:trending';
  if (cache.has(key)) return cache.get(key);

  const res = await axios.get(`${BASE}/manga`, {
    params: {
      limit: 20,
      order: { followedCount: 'desc' },
      includes: ['cover_art'],
      contentRating: ['safe', 'suggestive'],
      hasAvailableChapters: true,
    },
  });

  const normalized = (res.data.data || []).map(normalizeManga);
  cache.set(key, normalized);
  return normalized;
}

async function search(query, limit = 20, offset = 0) {
  const key = `mangadex:search:${query}:${limit}:${offset}`;
  if (cache.has(key)) return cache.get(key);

  const res = await axios.get(`${BASE}/manga`, {
    params: {
      title: query,
      limit,
      offset,
      includes: ['cover_art'],
      contentRating: ['safe', 'suggestive'],
    },
  });

  const normalized = (res.data.data || []).map(normalizeManga);
  cache.set(key, normalized);
  return normalized;
}

async function getById(id) {
  const key = `mangadex:id:${id}`;
  if (cache.has(key)) return cache.get(key);

  const res = await axios.get(`${BASE}/manga/${id}`, {
    params: { includes: ['cover_art', 'author', 'artist'] },
  });

  const normalized = normalizeManga(res.data.data);
  cache.set(key, normalized);
  return normalized;
}

async function getChapters(mangaId) {
  const key = `mangadex:chapters:${mangaId}`;
  if (cache.has(key)) return cache.get(key);

  const res = await axios.get(`${BASE}/manga/${mangaId}/feed`, {
    params: {
      limit: 100,
      translatedLanguage: ['en'],
      order: { chapter: 'desc' },
    },
  });

  const chapters = (res.data.data || []).map(ch => ({
    id: ch.id,
    chapter: ch.attributes?.chapter,
    title: ch.attributes?.title,
    publishedAt: ch.attributes?.publishAt,
    pages: ch.attributes?.pages,
    url: `https://mangadex.org/chapter/${ch.id}`,
  }));

  cache.set(key, chapters);
  return chapters;
}

module.exports = { getTrending, search, getById, getChapters };
