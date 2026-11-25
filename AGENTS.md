# AGENTS.md — Quant Terminal

## What this repo is
This directory is the install target for **Quant Terminal**, a locally-run trading
terminal: charts, 88 indicators (no per-chart limit), drawing tools, alerts,
screener, heatmap, seasonals, calendars, news, company financials, strategy tester
with quant checks, bar replay, paper trading. The app lives in `quant-terminal/`.

## Hard requirements
- **Node.js 18+ only.** Nothing else: no API keys, no accounts, no `npm install`,
  no sudo/admin, no other installs.
- Download source: `https://lewiswjackson.com/investing/kit/quant-terminal.zip`
  (Windows) or `.../quant-terminal.tar.gz` (macOS/Linux/Git Bash).
- Install into a folder named `quant-terminal` **inside the current working dir**.
  The archive already contains that folder — do **not** pre-create it.

## Command conventions (important)
- Always use `node scripts/<name>.js`, never `npm run ...`. Windows PowerShell
  execution policy can block npm; `node` works everywhere.
- Windows PowerShell 5: chain with `;`, not `&&`; bare `curl` means
  `Invoke-WebRequest`, so use `curl.exe` for real curl. Windows 10/11 ship
  `curl.exe` and `tar.exe`.
- After a `winget` Node install, the new `node` is not on the current PATH —
  call `C:\Program Files\nodejs\node.exe` by full path or open a new terminal.

## Setup / run order
1. **Check:** `node -v` → need 18+. If missing/old, install (with user consent):
   - macOS: `brew install node`, else LTS installer from nodejs.org
   - Windows: `winget install --id OpenJS.NodeJS.LTS -e`
   - Linux: distro package if ≥18, else nvm (github.com/nvm-sh/nvm)
2. **Download** from URL above into this dir. If `./quant-terminal/server.js`
   exists, it's an update: run `node scripts/stop.js` inside it first, download
   fresh to a temp folder, then copy everything over **except `data/`**
   (saved charts, alerts, watchlists).
3. **Test:** `node scripts/check.js` → offline tests, data-source reachability,
   brief live-data load; prints `READY` / `NOT READY`. Read `FAIL` lines and fix.
   Binance blocked or Yahoo rate-limiting is normal — app falls back
   automatically to other sources.
4. **Configure (new installs only; skip on update):**
   `node scripts/setup.js --watchlist "<comma,symbols>" --symbol <first> --tf <tf>`
   - `--tf`: `4h` for crypto/forex, `1D` for stocks or a mix.
   - Default watchlists: crypto = BTC,ETH,SOL,XRP,BNB,DOGE,LINK,AVAX;
     US stocks = SPY,QQQ,AAPL,NVDA,MSFT,TSLA,AMZN,META;
     forex = EURUSD,GBPUSD,USDJPY,AUDUSD,USDCAD,USDCHF;
     mix/no answer = BTC,ETH,SOL,SPY,QQQ,NVDA,AAPL,EURUSD.
   - It skips symbols the public sources lack — report any skips to the user.
5. **Launch:** `node scripts/launch.js` → starts in background, opens browser,
   prints the address. In a sandbox/container/WSL the app may die when the chat
   closes: tell the user to run `start.command` (Mac) / `start.bat` (Windows) /
   `./start.sh` (Linux) in `quant-terminal/` and leave that window open. Mac
   "unidentified developer" warning on `start.command` is expected: right-click
   → Open → Open again.

## Files & customization
- `data/` = all user state (charts, alerts, watchlists). Never overwrite on update.
- `custom/` = custom indicators. Customization is done via chat, e.g. "mark the
  London open", "send alerts to Discord", "mark three green candles in a row".
- Don't change app code during install unless a check fails and the fix is
  clearly in the code.

## Known limits (tell the user)
- Alerts run only while the computer is on and the app is running.
- Intraday US stock history is short on public data sources.
- It does not trade real money on its own (can connect to PTQ for that).

## How the user wants install work done
- Friendly, patient, plain language; explain technical terms once, briefly.
- Before each step, one short line + progress marker ("Step 2 of 5"). Keep
  updates to a line or two, focused on what it means for the user.
- Run every command yourself; only hand the user a command if it needs a
  password or admin rights (prefix `!` in Claude Code).
- On failure: read the error, fix the cause, retry — up to 3 tries per step,
  then explain plainly what's wrong and what you tried.
- Needs internet (lewiswjackson.com, nodejs.org, public market data). If the
  sandbox blocks network access, ask the user to approve it.
- If a safety check blocks a download/run, do **not** change your own permission
  settings. Say so in one line, then give one command at a time for the user
  to run. If a script needs approval, say in one line what it does first.
- Never ask for passwords, API keys, exchange keys, or broker logins.
- No sudo/admin; install nothing except Node.js, and only after the user says yes.
- If you can't ask questions, use the defaults above and keep going.
