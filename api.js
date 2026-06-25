const express = require('express');
const router = express.Router();
const mangadexService = require('../services/mangadex');
const anilistService = require('../services/anilist');
const jikanService = require('../services/jikan');
const pixivService = require('../services/pixiv');

// ─── MangaDex ────────────────────────────────────────────────────────────────

router.get('/manga/trending', async (req, res) => {
  try {
    const data = await mangadexService.getTrending();
    res.json({ source: 'MangaDex', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/manga/search', async (req, res) => {
  const { q, limit = 20, offset = 0 } = req.query;
  if (!q) return res.status(400).json({ error: 'Query param q is required' });
  try {
    const data = await mangadexService.search(q, Number(limit), Number(offset));
    res.json({ source: 'MangaDex', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/manga/:id', async (req, res) => {
  try {
    const data = await mangadexService.getById(req.params.id);
    res.json({ source: 'MangaDex', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/manga/:id/chapters', async (req, res) => {
  try {
    const data = await mangadexService.getChapters(req.params.id);
    res.json({ source: 'MangaDex', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── AniList (Anime) ──────────────────────────────────────────────────────────

router.get('/anime/trending', async (req, res) => {
  try {
    const data = await anilistService.getTrending();
    res.json({ source: 'AniList', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/anime/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Query param q is required' });
  try {
    const data = await anilistService.search(q);
    res.json({ source: 'AniList', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/anime/seasonal', async (req, res) => {
  try {
    const data = await anilistService.getCurrentSeason();
    res.json({ source: 'AniList', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Jikan / MyAnimeList ──────────────────────────────────────────────────────

router.get('/mal/top-anime', async (req, res) => {
  try {
    const data = await jikanService.getTopAnime();
    res.json({ source: 'MyAnimeList', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/mal/top-manga', async (req, res) => {
  try {
    const data = await jikanService.getTopManga();
    res.json({ source: 'MyAnimeList', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/mal/anime/:id', async (req, res) => {
  try {
    const data = await jikanService.getAnimeById(req.params.id);
    res.json({ source: 'MyAnimeList', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/mal/schedule', async (req, res) => {
  try {
    const data = await jikanService.getSchedule();
    res.json({ source: 'MyAnimeList', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Pixiv ────────────────────────────────────────────────────────────────────

router.get('/pixiv/trending', async (req, res) => {
  try {
    const data = await pixivService.getTrending();
    res.json({ source: 'Pixiv', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/pixiv/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Query param q is required' });
  try {
    const data = await pixivService.search(q);
    res.json({ source: 'Pixiv', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Aggregated search ────────────────────────────────────────────────────────

router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Query param q is required' });
  try {
    const [manga, anime, pixiv] = await Promise.allSettled([
      mangadexService.search(q, 6, 0),
      anilistService.search(q),
      pixivService.search(q),
    ]);
    res.json({
      query: q,
      results: {
        manga: manga.status === 'fulfilled' ? manga.value : [],
        anime: anime.status === 'fulfilled' ? anime.value : [],
        pixiv: pixiv.status === 'fulfilled' ? pixiv.value : [],
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
