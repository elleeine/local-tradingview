# Progress log

Short record of what has been done, so a future session can pick up quickly.
Details for each feature are in `docs/superpowers/specs/` and `docs/superpowers/plans/`.

## 2026-11-25 — install and first fixes
- Checked the machine: Windows 10, PowerShell 5, Node.js v26.13.1.
- Downloaded Quant Terminal from lewiswjackson.com into `quant-terminal/`.
- Fixed two bugs found by `node scripts/check.js`:
  - `server.js`: custom indicators were cached by file mtime, so two saves in the
    same millisecond could let a broken indicator through. Now uses a counter.
  - `scripts/setup.js`: checking eight symbols at once made every data source
    time out. Checks them one at a time now.
- Set the watchlist to BTC, ETH, SOL, SPY, QQQ, NVDA, AAPL, EURUSD on a daily chart.
- Launched the app at `http://localhost:3777`.

## 2026-11-25 — symbol catalog dropdown
- Added `public/js/catalog.js`: a static list of asset classes, markets and common
  symbols. Typing search is unchanged.
- Added `test/catalog.test.js` and wired it into `check.js` and `package.json`.

## 2026-11-25 — GitHub and automatic pushes
- Created the git repo and the public GitHub repo `elleeine/local-tradingview`.
- Added an SSH key for GitHub (`~/.ssh/id_ed25519_local_tradingview`) and set
  `origin` to SSH. No tokens or passwords are needed.
- `post-commit` hook pushes every commit. If offline, `retry-push.ps1` retries
  every 30 seconds for up to six hours. Verified with a simulated outage.
- `data/` is ignored: saved charts, alerts and watchlists never leave this computer.

## 2026-11-25/26 — session opening bells
- Added `custom/session-opens.js`: arrows for Sydney 10:00, Tokyo 09:00,
  London 08:00 and New York 09:30 in each exchange's own local clock, with DST.
- Eight tests in `test/session-opens.test.js` cover winter/summer times, dedupe,
  daily-bar suppression, forming bars and performance.
- Enabled on the saved chart and on newly opened panes. Saved chart switched to 1h.
- Optimised away 24,000 timezone formatting calls per render; now about 6 ms on
  300 bars.

## Known limits
- OANDA entries in the catalog need your own OANDA token to load.
- Session markers only appear on intraday charts (bars at those times).
- An unusually long gap bar crossing local midnight can miss a bell.
- The offline push retry gives up after six hours; a later commit restarts it.
- Alerts only run while the computer is on and the app is running.
