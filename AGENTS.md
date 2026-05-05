# AGENTS.md

## Cursor Cloud specific instructions

### Project Overview

Static HTML/CSS/JS portfolio site + Vercel serverless API functions (Node.js ESM) for an iOS developer. No build step, no bundler, zero npm dependencies in `package.json`.

### Running the Development Server

Serve the site locally with:

```bash
npx serve . -l 3000
```

Port 3000 (or 8080) is required — the API CORS allowlist only permits `http://localhost:3000` and `http://localhost:8080`.

### Serverless API Functions

API functions live in `/api/` and are Vercel serverless handlers (ESM, `export default async function handler(req, res)`). They proxy CRUD operations to JSONBin.io.

To validate API module syntax without Vercel CLI:

```bash
node -e "import('./api/apps.js').then(m => console.log(typeof m.default))"
```

Full local API testing requires `JSONBIN_ACCESS_KEY`, `JSONBIN_BIN_ID`, and `JSONBIN_APPS_BIN_ID` environment variables (or Vercel CLI with linked project).

### Key Gotchas

- There are **no npm dependencies** — `package.json` has no `dependencies` or `devDependencies` fields, so `npm install` is a no-op.
- The frontend loads apps from JSONBin public API first, then falls back to `/data/apps.json`. Both work without credentials.
- Newsletter subscribe (`POST /api/subscribers`) hits the production Vercel deployment by default (configured in `index.html` via `window.SERVERLESS_API_URL`).
- `env-config.js` is committed with public EmailJS client IDs. The CI deploy workflow overwrites it with secrets for production.
- No linter or test runner is configured in this repository.
