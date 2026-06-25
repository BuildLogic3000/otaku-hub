/**
 * AniList GraphQL API — public, no auth required.
 * Docs: https://anilist.gitbook.io/anilist-apiv2-docs
 */
const axios = require('axios');
const NodeCache = require('node-cache');

const ENDPOINT = 'https://graphql.anilist.co';
const cache = new NodeCache({ stdTTL: 300 });

const MEDIA_FIELDS = `
  id
  title { romaji english native }
  description(asHtml: false)
  coverImage { large medium color }
  bannerImage
  status
  episodes
  duration
  genres
  averageScore
  popularity
  trending
  startDate { year month day }
  season
  seasonYear
  format
  studios(isMain: true) { nodes { name } }
  trailer { id site }
  siteUrl
`;

function normalizeAnime(media) {
  return {
    id: media.id,
    title: media.title?.english || media.title?.romaji || media.title?.native,
    titleRomaji: media.title?.romaji,
    description: media.description?.replace(/<[^>]*>/g, '') || '',
    cover: media.coverImage?.large || media.coverImage?.medium,
    banner: media.bannerImage,
    color: media.coverImage?.color,
    status: media.status,
    episodes: media.episodes,
    genres: media.genres || [],
    score: media.averageScore,
    popularity: media.popularity,
    season: media.season,
    seasonYear: media.seasonYear,
    format: media.format,
    studio: media.studios?.nodes?.[0]?.name || null,
    startDate: media.startDate,
    trailer: media.trailer
      ? `https://www.youtube.com/watch?v=${media.trailer.id}`
      : null,
    source: 'AniList',
    url: media.siteUrl,
  };
}

async function gql(query, variables = {}) {
  const res = await axios.post(ENDPOINT, { query, variables });
  return res.data.data;
}

async function getTrending() {
  const key = 'anilist:trending';
  if (cache.has(key)) return cache.get(key);

  const query = `
    query {
      Page(page: 1, perPage: 20) {
        media(type: ANIME, sort: TRENDING_DESC, isAdult: false) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;

  const data = await gql(query);
  const normalized = (data.Page.media || []).map(normalizeAnime);
  cache.set(key, normalized);
  return normalized;
}

async function search(q) {
  const key = `anilist:search:${q}`;
  if (cache.has(key)) return cache.get(key);

  const query = `
    query ($search: String) {
      Page(page: 1, perPage: 15) {
        media(type: ANIME, search: $search, isAdult: false) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;

  const data = await gql(query, { search: q });
  const normalized = (data.Page.media || []).map(normalizeAnime);
  cache.set(key, normalized);
  return normalized;
}

async function getCurrentSeason() {
  const key = 'anilist:seasonal';
  if (cache.has(key)) return cache.get(key);

  const now = new Date();
  const month = now.getMonth() + 1;
  const seasons = { 1: 'WINTER', 2: 'WINTER', 3: 'WINTER',
                    4: 'SPRING', 5: 'SPRING', 6: 'SPRING',
                    7: 'SUMMER', 8: 'SUMMER', 9: 'SUMMER',
                    10: 'FALL', 11: 'FALL', 12: 'FALL' };
  const season = seasons[month];
  const year = now.getFullYear();

  const query = `
    query ($season: MediaSeason, $year: Int) {
      Page(page: 1, perPage: 20) {
        media(type: ANIME, season: $season, seasonYear: $year, sort: POPULARITY_DESC, isAdult: false) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;

  const data = await gql(query, { season, year });
  const normalized = (data.Page.media || []).map(normalizeAnime);
  cache.set(key, normalized);
  return normalized;
}

module.exports = { getTrending, search, getCurrentSeason };
