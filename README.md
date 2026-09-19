# myring

Which ring would choose you? An AI-powered, three-trial personality game built around the seven emotional forces of the spectrum. Mobile-first, fast, and a little dramatic.

Live: https://tojen.github.io/myring/

Unofficial fan-made experience. Not affiliated with or endorsed by DC or Warner Bros.

## How it works

1. **Detection.** Seven rings appear.
2. **Trial I.** You answer one open-ended scenario. Two rings lose interest.
3. **Trial II.** A harder scenario, written by the model based on your first answer. Two more rings drop.
4. **Trial III.** The final signal. One ring chooses you.
5. **Result.** Primary ring, secondary ring, archetype, evidence quoted from your answers, and a spectrum fingerprint you can share or send as a challenge.

Answers are never stored. Result links only carry the ring names, scores, and archetype.

## Architecture

- `src/` — Vite + React + TypeScript frontend, deployed to GitHub Pages via `.github/workflows/deploy.yml`.
- `worker/` — Cloudflare Worker that proxies trial requests to Claude (`claude-fable-5-1`) with structured JSON output. The frontend never sees the Anthropic API key.

## Local development

```bash
npm install
cp .env.example .env            # set VITE_API_URL to your Worker URL
npm run dev                     # http://localhost:5173/myring/
```

Run the Worker locally in a second terminal:

```bash
cd worker
npm install
cp .dev.vars.example .dev.vars  # add ANTHROPIC_API_KEY
npx wrangler dev                # http://localhost:8787
```

Then set `VITE_API_URL=http://localhost:8787` in `.env`.

## Deploying the Worker

```bash
cd worker
npx wrangler login
npx wrangler secret put ANTHROPIC_API_KEY
npm run deploy
```

Wrangler prints the Worker URL, for example `https://myring-api.<subdomain>.workers.dev`.

`ALLOWED_ORIGINS` in `worker/wrangler.toml` controls CORS. It defaults to the GitHub Pages origin and localhost.

## Deploying the frontend

Pushes to `main` build and deploy to GitHub Pages automatically. The build reads the Worker URL from a repository variable:

```bash
gh variable set VITE_API_URL --body "https://myring-api.<subdomain>.workers.dev"
```

Re-run the workflow after setting it. Without it the app loads but trials fail with "THE SIGNAL WAS INTERRUPTED."

## Model notes

The Worker calls Claude with server-side fallbacks enabled (`fallbacks: 'default'`), so a request can be served by a fallback model when the primary is unavailable. Responses are constrained with a JSON schema and validated again on the client.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Frontend dev server |
| `npm run build` | Typecheck and build to `dist/` |
| `npm run lint` | oxlint |
| `npm run worker:deploy` | Deploy the Worker |
