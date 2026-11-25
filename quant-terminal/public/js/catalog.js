// Browsable symbol catalog. Static so it works offline and when a source is blocked.
// Symbols are the app's real ids (EXCHANGE:TICKER); the UI shows ticker() of each.
export const MARKET_CATALOG = [
  {
    name: "Crypto",
    markets: [
      {
        name: "Binance",
        symbols: ["BTCUSDT", "ETHUSDT", "SOLUSDT", "XRPUSDT", "BNBUSDT", "DOGEUSDT", "LINKUSDT", "AVAXUSDT"].map((s) => `BINANCE:${s}`),
      },
      {
        name: "Coinbase",
        symbols: ["BTC", "ETH", "SOL"].map((s) => `COINBASE:${s}-USD`),
      },
      {
        name: "Kraken",
        symbols: ["XBTUSD", "ETHUSD", "XRPUSD"].map((s) => `KRAKEN:${s}`),
      },
      {
        name: "Bybit perps",
        symbols: ["BTCUSDT", "ETHUSDT"].map((s) => `BYBIT:${s}.P`),
      },
      { name: "BloFin perps", symbols: ["BLOFIN:BTCUSDT.P"] },
    ],
  },
  {
    name: "Stocks",
    markets: [
      {
        name: "US (Nasdaq)",
        symbols: ["SPY", "QQQ", "AAPL", "NVDA", "MSFT", "TSLA", "AMZN", "META"].map((s) => `US:${s}`),
      },
      {
        name: "Global (Yahoo)",
        symbols: ["^FTSE", "^GSPC", "^N225", "VOD.L"].map((s) => `YAHOO:${s}`),
      },
    ],
  },
  {
    name: "Forex",
    markets: [
      {
        name: "FX",
        symbols: ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "USDCHF"].map((s) => `FX:${s}`),
      },
      { name: "Kraken", symbols: ["KRAKEN:EURUSD", "KRAKEN:GBPUSD"] },
    ],
  },
  {
    name: "Futures",
    markets: [
      {
        name: "CME",
        symbols: ["NQ1!", "ES1!", "MNQ1!", "MES1!"].map((s) => `CME:${s}`),
      },
      {
        name: "Binance perps",
        symbols: ["BTCUSDT", "ETHUSDT", "SOLUSDT"].map((s) => `BINANCE:${s}.P`),
      },
    ],
  },
  {
    name: "Commodities",
    markets: [{ name: "Metals", symbols: ["FX:XAUUSD", "FX:XAGUSD"] }],
  },
  {
    name: "Your data",
    markets: [
      {
        name: "OANDA (your token)",
        symbols: ["EUR_USD", "GBP_USD", "USD_JPY"].map((s) => `OANDA:${s}`),
      },
    ],
  },
];
