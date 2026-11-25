# local-tradingview

A local copy of Quant Terminal — a self-hosted trading terminal with charts,
indicators, drawing tools, alerts, a screener, heatmap, seasonals, calendars,
news, company financials, a strategy tester, bar replay and paper trading.

Everything runs on your own computer. No account or API key is needed for the
public market data sources. Anything you save lives in `quant-terminal/data/`,
which is intentionally not tracked by git.

## Start it

Requires Node.js 18 or newer.

- Windows: double-click `quant-terminal/start.bat`
- macOS: double-click `quant-terminal/start.command`
- Linux: run `./quant-terminal/start.sh`

Then open the address it prints (usually `http://localhost:3777`).

## Checks

Run from inside `quant-terminal/`:

```
node scripts/check.js
```

It runs the offline tests, checks the public data sources, loads live data and
prints `READY` or `NOT READY`. Never use `npm run`; PowerShell's execution
policy can block npm on Windows.

## Layout

- `quant-terminal/` — the application
- `quant-terminal/custom/` — your custom indicators
- `quant-terminal/data/` — your saved state (ignored by git)
- `AGENTS.md` — notes for AI coding assistants

See `quant-terminal/README.md` for the full feature documentation.

## Pushing changes

This repo uses an SSH key stored in `~/.ssh/id_ed25519_local_tradingview`, so no
token or password is needed. The `post-commit` hook pushes each commit to GitHub
automatically. If you are offline, the commit still succeeds and you can push
later with `git push`.
