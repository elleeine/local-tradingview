# Symbol catalog dropdown — short design

## Intent / why
The symbol search only responds to typed letters. The user wants to click and pick
from a browsable list of asset classes and the markets under each, without giving up
typing. Chosen approach: **A — classes, markets, and the common symbols under each**.

## Goals
- In the existing symbol search window, show a grouped, scrollable dropdown of
  asset classes, their markets, and a short list of common symbols.
- Clicking any symbol picks it exactly as a typed search result does (loads chart).
- The typing box and live search keep working unchanged.

## Non-goals / anti-goals
- No "every symbol from every source" list (slow, huge, breaks when a source is down).
- No new API calls, no accounts, no API keys, no new dependencies.
- No change to how search results are fetched or ranked.

## Constraints
- Node 18+, local app, no build step. `public/js/app.js` is an ES module.
- Existing CSS has `.list .group`, `.list .item`, `.item.sel` — reuse them.
- Must work offline and when a data source is blocked.

## Approaches
- **A (picked):** static catalog in a new `public/js/catalog.js`, imported by
  `app.js`. Instant, offline-safe, tiny.
- B: fetch full symbol lists live per market. Comprehensive but slow and fragile.
- C: markets only, then type within one. Still requires typing, so it misses the goal.

## How
1. `public/js/catalog.js` exports `MARKET_CATALOG`: ordered groups, each with a
   label, its markets, and common symbols as ready-to-use symbol strings
   (e.g. `BINANCE:BTCUSDT`, `US:AAPL`, `FX:EURUSD`, `CME:NQ1!`).
   Classes: Crypto (Binance/Coinbase/Kraken/Bybit/BloFin), Stocks (US/Nasdaq,
   Global/Yahoo), Forex (FX/Kraken), Futures (CME, crypto perps),
   Commodities (metals), Your data (OANDA). CSV files have no fixed id, so they
   stay findable by typing rather than in this static list (builder's call).
2. In `openSymbolSearch()`, put a collapsible "Browse markets" section under the
   input and above the live result list. Render groups from `MARKET_CATALOG` with
   the existing `.group` / `.item` styles. Clicking a symbol calls the same `pick()`
   used by search results.
3. Typing hides the browser list and shows live results, as today; clearing the box
   brings the browser back.
4. One small self-check test in `test/` asserting every catalog symbol resolves
   through `resolve()` offline, so a typo cannot ship.

## Left to the builder
- Exact symbol sets per market (common, recognisable names, ~6–10 each).
- Exact wording of the dropdown header.
