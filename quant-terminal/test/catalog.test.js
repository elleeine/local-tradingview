import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.QT_OFFLINE = '1';
const { MARKET_CATALOG } = await import('../public/js/catalog.js');
const { resolve } = await import('../lib/providers.js');

test('catalog covers every asset class', () => {
  const names = MARKET_CATALOG.map((g) => g.name);
  for (const expected of ['Crypto', 'Stocks', 'Forex', 'Futures', 'Commodities', 'Your data'])
    assert.ok(names.includes(expected), `missing class ${expected}`);
});

test('every market has at least one symbol and symbols are unique', () => {
  const all = [];
  for (const group of MARKET_CATALOG) {
    assert.ok(Array.isArray(group.markets) && group.markets.length, `${group.name} has no markets`);
    for (const market of group.markets) {
      assert.ok(market.symbols.length, `${group.name} / ${market.name} has no symbols`);
      all.push(...market.symbols);
    }
  }
  assert.equal(new Set(all).size, all.length, 'a symbol appears twice in the catalog');
});

test('every catalog symbol resolves', async () => {
  for (const group of MARKET_CATALOG)
    for (const market of group.markets)
      for (const symbol of market.symbols)
        await assert.doesNotReject(resolve(symbol), `${symbol} does not resolve`);
});

// resolve() accepts any EXCHANGE:TICKER, so check the shape itself to catch typos.
const SUPPORTED = new Set(['BINANCE', 'COINBASE', 'KRAKEN', 'BYBIT', 'BLOFIN', 'US', 'YAHOO', 'FX', 'CME', 'OANDA']);

test('every catalog symbol uses a supported exchange and a well-formed ticker', () => {
  for (const group of MARKET_CATALOG)
    for (const market of group.markets)
      for (const symbol of market.symbols) {
        const parts = symbol.split(':');
        assert.equal(parts.length, 2, `${symbol}: expected EXCHANGE:TICKER`);
        assert.ok(SUPPORTED.has(parts[0]), `${symbol}: unsupported exchange ${parts[0]}`);
        assert.match(parts[1], /^[A-Z0-9^._!-]+$/, `${symbol}: bad ticker`);
      }
});
