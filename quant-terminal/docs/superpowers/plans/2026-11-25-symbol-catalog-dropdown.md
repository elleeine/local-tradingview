# Symbol Catalog Dropdown Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a browsable, grouped dropdown of asset classes, markets, and common symbols to the existing symbol search, while keeping typed search unchanged.

**Architecture:** A static catalog module in `public/js/` is imported by the ES module `app.js`. The existing symbol-search modal gains a `<details>` browser above the live result list; clicking a catalog entry uses the same `pick()` path as a typed result. No server or API changes.

**Tech Stack:** Browser ES modules, plain HTML/CSS, Node's built-in test runner.

**Spec:** `docs/superpowers/specs/2026-11-25-symbol-catalog-dropdown-design.md`

## Global Constraints
- Node 18+, no build step, no new dependencies, no API keys, no new network calls.
- Use `node scripts/...`, never `npm run ...`.
- Symbol strings must be the app's real id form (`EXCHANGE:TICKER`, e.g. `BINANCE:BTCUSDT`).
- Reuse existing `.list`, `.list .item`, `.list .group` CSS; typing must still work.

## Review Focus
- Clicking a catalog symbol while text is typed → picks the clicked symbol, not the typed text (verify in browser).
- A catalog symbol that no data source understands → cannot ship; every symbol resolves via `resolve()` offline (`catalog.test.js`).
- Duplicate or mis-grouped entries → no duplicates across groups (`catalog.test.js`).
- Yahoo rate-limited / a source blocked → browser still opens and shows all groups, since it is static (`catalog.test.js` counts groups).
- Empty search box → browser visible and usable; typed search → browser hidden, live results shown (verify in browser).

---

### Task 1: Catalog data and validity test

**Files:**
- Create: `public/js/catalog.js`
- Test: `test/catalog.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `MARKET_CATALOG` — array of `{ name, markets }`; each market is `{ name, symbols }`; `symbols` is an array of symbol-id strings.

- [ ] **Step 1: Write the failing test** in `test/catalog.test.js` importing `MARKET_CATALOG` from `../public/js/catalog.js`, with `process.env.QT_OFFLINE = '1'` set before importing `resolve` from `../lib/providers.js`. Assert: (a) group names include `Crypto`, `Stocks`, `Forex`, `Futures`, `Commodities`, `Your data`; (b) every market has at least one symbol; (c) every symbol resolves without throwing; (d) no symbol appears twice.

- [ ] **Step 2: Run it and confirm it fails** with module-not-found.

Run: `node --test test/catalog.test.js`
Expected: FAIL (module not found).

- [ ] **Step 3: Create `public/js/catalog.js`** exporting `MARKET_CATALOG` as described in Interfaces. Use 6 groups. Markets and common symbols: Crypto → Binance (BTC, ETH, SOL, XRP, BNB, DOGE, LINK, AVAX), Coinbase (BTC, ETH, SOL), Kraken (BTC, ETH, XRP), Bybit (BTCUSDT.P, ETHUSDT.P), BloFin (BTCUSDT.P); Stocks → US/Nasdaq (SPY, QQQ, AAPL, NVDA, MSFT, TSLA, AMZN, META), Global/Yahoo (`^FTSE`, `^GSPC`, `^N225`, `VOD.L`); Forex → FX (EURUSD, GBPUSD, USDJPY, AUDUSD, USDCAD, USDCHF), Kraken (EURUSD, GBPUSD); Futures → CME (NQ1!, ES1!, MNQ1!, MES1!), Binance perps (BTCUSDT.P, ETHUSDT.P, SOLUSDT.P); Commodities → Metals (XAUUSD, XAGUSD); Your data → OANDA (`OANDA:EUR_USD`), CSV (skip: a real CSV id depends on the user's files — omit this market rather than invent one). Prefix each symbol correctly: `BINANCE:`, `COINBASE:`, `KRAKEN:`, `BYBIT:`, `BLOFIN:`, `US:`, `YAHOO:`, `FX:`, `CME:`, `OANDA:`. Do not add display names — the UI derives them with `ticker()`.

- [ ] **Step 4: Run the test and confirm it passes.**

Run: `node --test test/catalog.test.js`
Expected: PASS.

- [ ] **Step 5: Commit.**

```bash
git add public/js/catalog.js test/catalog.test.js
git commit -m "feat: static symbol catalog for market browsing"
```

### Task 2: Wire the browser into symbol search

**Files:**
- Modify: `public/js/app.js` (import line 1; `openSymbolSearch()` at lines 391–462)
- Modify: `public/css/app.css` (after `.list .group`, line 914)

**Interfaces:**
- Consumes: `MARKET_CATALOG` from Task 1; `esc`, `ticker` from `api.js`; existing `pick()` inside `openSymbolSearch()`.
- Produces: no new exports; the modal now contains a `<details id="symBrowse">` element.

- [ ] **Step 1: Add the import** `import { MARKET_CATALOG } from "./catalog.js";` to `public/js/app.js`.

- [ ] **Step 2: Render the browser.** In `openSymbolSearch()`, insert a `<details id="symBrowse" class="catalog"><summary>Browse markets — click a symbol</summary><div class="list">…</div></details>` between the input and `#symList`. Build the inner HTML from `MARKET_CATALOG`: one `<div class="group">` per group name, one small label per market, and one `<div class="item" data-sym="…">` per symbol showing `ticker(symbol)` on the left and the market name on the right. Escape all text with `esc()`. Do not change the `#symList` markup or the hint text.

- [ ] **Step 3: Wire clicks and typing.** In `openSymbolSearch()`: add `browse.onclick` that finds `e.target.closest("[data-sym]")` and calls `pick(node.dataset.sym)` (do nothing when the click is on the summary). In the existing `q.oninput` handler, set `browse.hidden = !!q.value.trim()` so the browser hides while typing and returns when the box is cleared. Do not change `run()`, `q.onkeydown`, or `list.onclick`.

- [ ] **Step 4: Style the browser.** Add ~10 lines to `public/css/app.css`: a cursor and muted colour for `.catalog summary`, padding for `.catalog .list`, and a compact market label (`.catalog .market`). Reuse the existing `.group` and `.item` rules; no new colours.

- [ ] **Step 5: Verify.** Run `node scripts/check.js`. Expected: `PASS Offline tests`, `PASS Data sources`, `PASS Live smoke test`, `READY`. Then open `http://localhost:3777` (restart with `node scripts/launch.js` if needed), click the symbol search, confirm the browser opens showing all six groups, click `BTC` under Binance, and confirm the chart switches. Type `AAPL` and confirm the browser hides and live results appear.

- [ ] **Step 6: Commit.**

```bash
git add public/js/app.js public/css/app.css
git commit -m "feat: browse markets dropdown in symbol search"
```
