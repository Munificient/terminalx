# TerminalX

A real-time financial trading terminal UI built with React, Zustand, Web Workers, and TradingView's Lightweight Charts. All prices and order book depth updates are simulated off the main thread in a dedicated Web Worker streaming WebSocket-style JSON frames, so there's no backend and no real market data. I built it to practice high-frequency state updates, worker message passing, and canvas charting in React.

## Features

- Live prices for BTC, ETH, SOL and AAPL streamed every second from a Web Worker market feed
- Candlestick chart for BTC (5 second candles) that updates incrementally as new prices arrive
- Order book with 12 levels per side, depth bars, and rows that flash green or red when the price moves
- Trade panel with buy/sell validation checked against your USD balance and current holdings
- Portfolio summary with total value, per-asset valuation and P&L
- Infinitely scrolling ticker tape (pauses on hover)
- Dark theme, monospace numbers, stacks vertically on mobile

## Tech Stack

- React 19 + Vite
- Tailwind CSS 3
- Zustand for state
- Web Workers (`marketWorker.js`) for off-main-thread feed & depth generation
- lightweight-charts v5
- lucide-react for icons

## Getting Started

Clone the repo, then:

```bash
npm install
npm run dev
```

Other scripts:

```bash
npm run build     # production build into dist/
npm run preview   # serve the production build locally
npm run lint
```

## Project Structure

```
src/
  components/
    layout/Navbar.jsx
    terminal/
      TickerTape.jsx
      MainChart.jsx
      OrderBook.jsx
      TradePanel.jsx
      PortfolioSummary.jsx
  store/useMarketStore.js    assets, order book, portfolio, trade logic
  utils/mockSocket.js        worker-backed socket client: connect() / disconnect()
  workers/marketWorker.js    background tick generator & 12-level order book builder
  App.jsx
  index.css
```

## How It Works

`mockSocket.js` spawns `marketWorker.js` as a module Web Worker and sends a `CONNECT` control message. Inside the worker, a `setInterval` nudges each asset's price by a small random amount, rebuilds the 12-level BTC order book around the new mid-price, and posts typed frames (`OPEN`, `TICK`, `ORDERBOOK_SNAPSHOT`, `CLOSE`) back to the main thread. `mockSocket.js` routes those frames into the Zustand store, while components subscribe to just the slice of state they need.

`executeTrade` lives in the store and returns `{ ok, error }`, so the trade panel can display inline feedback without throwing.

## Technical Challenges

**Keeping high-frequency updates off the main thread without freezing the UI**

Four assets update every second, and each BTC tick also regenerates a 24-row order book with cumulative depth totals. Generating those snapshots inside a dedicated Web Worker keeps the math off the UI thread, and narrow Zustand selectors ensure the chart only re-renders on BTC price ticks while the trade panel only reacts to balance or selected-asset changes. The store also preserves object references for unchanged assets so `React.memo` skips unaffected ticker items. Price flashes are plain CSS animations triggered by keying the price node on `currentPrice`, avoiding extra timers or state updates. I also had to guard `connect()` against spawning duplicate workers when React StrictMode runs effects twice in dev.

**Managing Lightweight-Charts memory allocation**

The chart is created once in a `useEffect` with an empty dependency array and destroyed in cleanup via `chart.remove()`. That tears down the canvas, the resize observer, and all event listeners so StrictMode remounts and HMR don't leak chart instances. The series and active candle live in refs rather than React state, and live ticks call `series.update()` so only the current candle mutates instead of reloading the full series with `setData` every second.

**Keeping the numbers honest**

Floating-point arithmetic gets messy when multiplying fractional crypto amounts by prices, so balances and holdings are rounded after every trade, and sell validation compares against a `1e-9` epsilon so you can close out an entire position without leaving a `0.00000001` dust balance behind.

## Limitations

- Prices are simulated via random walk, not real exchange market data, and the order book is regenerated per tick rather than backed by a matching engine
- Only BTC has a candlestick chart and order book
- Orders fill immediately at the current market price, and portfolio state resets on page reload

## Ideas for Later

- Dynamic chart and order book for whichever asset is selected
- Persist portfolio and trade history in `localStorage`
- Limit orders and a filled-orders log
- Swap the worker feed for a live exchange WebSocket endpoint
