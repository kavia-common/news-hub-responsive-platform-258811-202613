# News Hub — Frontend (React)

## Overview
Responsive React app with:
- Category navigation + search
- Feed view (infinite scroll + “Load more” fallback)
- Article detail view
- Favorites + Settings side drawer
- Loading / error states
- Backend REST API integration via `/api/*`

## Development
Assumes the backend is running on `http://localhost:3001`.

```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

### API proxy
`vite.config.js` proxies `/api` to `http://localhost:3001`.

If deploying behind a reverse proxy, ensure `/api` routes to the backend container.
