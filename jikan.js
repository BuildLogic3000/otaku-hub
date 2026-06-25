/**
 * Jikan REST API v4 — unofficial MyAnimeList wrapper, public.
 * Docs: https://docs.api.jikan.moe
 */
const axios = require('axios');
const NodeCache = require('node-cache');

const BASE = 'https://api.jikan.moe/v4';
const cache = new NodeCache({ stdTTL: 600 }); // 10-min cache

// Jikan is rate-limited (3 req/s), add a small delay helper
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function normalizeAnime(item) {
  return {
    id: item.mal_id,
    title: item.title_english || item.title,
    titleJapanese: item.title_japanese,
    cover: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url,
    synopsis: item.synopsis,
    score: item.score,
    rank: item.rank,
    popularity: item.popularity,
    episodes: item.episodes,
    status: item.status,
    airedFrom: item.aired?.from,
    genres: (item.genres || []).map(g => g.name),
    studios: (item.studios || []).map(s => s.name),
    rating: item.rating,
    duration: item.duration,
    source: 'MyAnimeList',
    url: item.url,
  };
}

function normalizeManga(item) {
  return {
    id: item.mal_id,
    title: item.title_english || item.title,
    titleJapanese: item.title_japanese,
    cover: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url,
    synopsis: item.synopsis,
    score: item.score,
    rank: item.rank,
    popularity: item.popularity,
    chapters: item.chapters,
    volumes: item.volumes,
    status: item.status,
    authors: (item.authors || []).map(a => a.name),
    genres: (item.genres || []).map(g => g.name),
    source: 'MyAnimeList',
    url: item.url,
  };
}

async function getTopAnime() {
  const key = 'jikan:top-anime';
  if (cache.has(key)) return cache.get(key);

  const res = await axios.get(`${BASE}/top/anime`, {
    params: { limit: 25, filter: 'bypopularity' },
  });

  const normalized = (res.data.data || []).map(normalizeAnime);
  cache.set(key, normalized);
  return normalized;
}

async function getTopManga() {
  const key = 'jikan:top-manga';
  if (cache.has(key)) return cache.get(key);

  const res = await axios.get(`${BASE}/top/manga`, {
    params: { limit: 25 },
  });

  const normalized = (res.data.data || []).map(normalizeManga);
  cache.set(key, normalized);
  return normalized;
}

async function getAnimeById(id) {
  const key = `jikan:anime:${id}`;
  if (cache.has(key)) return cache.get(key);

  const res = await axios.get(`${BASE}/anime/${id}`);
  const normalized = normalizeAnime(res.data.data);
  cache.set(key, normalized);
  return normalized;
}

async function getSchedule() {
  const key = 'jikan:schedule';
  if (cache.has(key)) return cache.get(key);

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const results = {};

  for (const day of days) {
    try {
      const res = await axios.get(`${BASE}/schedules`, { params: { filter: day, limit: 10 } });
      results[day] = (res.data.data || []).map(normalizeAnime);
      await delay(400); // respect rate limit
    } catch {
      results[day] = [];
    }
  }

  cache.set(key, results);
  return results;
}

module.exports = { getTopAnime, getTopManga, getAnimeById, getSchedule };
