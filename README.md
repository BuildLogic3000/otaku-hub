# ⛩ OtakuHub

A multi-source anime, manga, manhwa & Pixiv art aggregator.

## Live Data Sources

| Source | API | Auth Required |
|--------|-----|---------------|
| **MangaDex** | REST v5 | None (public) |
| **AniList** | GraphQL | None (public) |
| **MyAnimeList** | Jikan v4 | None (public) |
| **Pixiv** | Unofficial discovery | Optional OAuth for full access |

## Features

- 🏠 **Home** — hero banner + trending anime + trending manga
- 📺 **Trending Anime** — from AniList (real-time trending score)
- 📖 **Trending Manga** — from MangaDex (most followed)
- 🌸 **This Season** — current seasonal anime from AniList
- ⭐ **MAL Top Charts** — top anime & manga by popularity from Jikan/MAL
- 📅 **Airing Schedule** — weekly broadcast schedule from Jikan
- 🎨 **Pixiv Art** — trending illustrations (with graceful fallback)
- 🔍 **Global Search** — searches across MangaDex + AniList + Pixiv simultaneously
- 🗂️ **Caching** — all API responses cached server-side (5–10 min) to stay within rate limits

## Setup

```bash
npm install
npm start
# → http://localhost:3000
```

## Pixiv Full Access

Pixiv requires a JP IP or OAuth for their full API. To enable live data:

1. Create a Pixiv account and generate an OAuth refresh token
2. Install `pixiv-api-client`: `npm install pixiv-api-client`
3. Update `server/services/pixiv.js` to use authenticated requests

## Project Structure

```
otaku-hub/
├── server/
│   ├── index.js               # Express app entry point
│   ├── routes/
│   │   └── api.js             # All /api/* routes
│   └── services/
│       ├── mangadex.js        # MangaDex v5 REST
│       ├── anilist.js         # AniList GraphQL
│       ├── jikan.js           # Jikan (MAL) REST
│       └── pixiv.js           # Pixiv (public + fallback)
├── public/
│   ├── index.html
│   ├── css/main.css
│   ├── js/
│   │   ├── api.js             # Fetch wrappers
│   │   ├── render.js          # HTML render helpers
│   │   └── app.js             # Main app controller
│   └── assets/placeholder.svg
├── package.json
└── README.md
```

## API Endpoints

```
GET /api/manga/trending
GET /api/manga/search?q=...
GET /api/manga/:id
GET /api/manga/:id/chapters
GET /api/anime/trending
GET /api/anime/search?q=...
GET /api/anime/seasonal
GET /api/mal/top-anime
GET /api/mal/top-manga
GET /api/mal/schedule
GET /api/pixiv/trending
GET /api/pixiv/search?q=...
GET /api/search?q=...         ← aggregated cross-source search
```
