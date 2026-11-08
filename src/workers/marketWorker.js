const ORDER_BOOK_DEPTH = 12

// rough per-tick volatility so AAPL doesn't swing like SOL
const VOLATILITY = {
  BTC: 0.0015,
  ETH: 0.002,
  SOL: 0.003,
  AAPL: 0.0008,
}

const prices = {
  BTC: 64250,
  ETH: 3240,
  SOL: 152.4,
  AAPL: 191.3,
}

let timer = null

function nextPrice(price, vol) {
  const drift = (Math.random() - 0.5) * 2 * vol
  return Math.round(price * (1 + drift) * 100) / 100
}

function buildOrderBook(midPrice) {
  const spread = midPrice * 0.0002
  const step = midPrice * 0.0001
  const bids = []
  const asks = []
  let bidTotal = 0
  let askTotal = 0

  for (let i = 0; i < ORDER_BOOK_DEPTH; i++) {
    const askSize = Math.round((0.05 + Math.random() * 2.5) * 10000) / 10000
    const bidSize = Math.round((0.05 + Math.random() * 2.5) * 10000) / 10000
    askTotal += askSize
    bidTotal += bidSize

    asks.push({
      price: Math.round((midPrice + spread + i * step) * 100) / 100,
      size: askSize,
      total: Math.round(askTotal * 10000) / 10000,
    })
    bids.push({
      price: Math.round((midPrice - spread - i * step) * 100) / 100,
      size: bidSize,
      total: Math.round(bidTotal * 10000) / 10000,
    })
  }

  return { bids, asks }
}

function emitTicks() {
  const symbols = Object.keys(prices)
  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i]
    const updated = nextPrice(prices[symbol], VOLATILITY[symbol] || 0.001)
    prices[symbol] = updated

    self.postMessage({
      type: 'TICK',
      payload: { symbol, price: updated, ts: Date.now() },
    })

    if (symbol === 'BTC') {
      self.postMessage({
        type: 'ORDERBOOK_SNAPSHOT',
        payload: {
          symbol: 'BTC',
          orderBook: buildOrderBook(updated),
          ts: Date.now(),
        },
      })
    }
  }
}

self.onmessage = (event) => {
  const { type, intervalMs = 1000 } = event.data || {}

  if (type === 'CONNECT') {
    if (timer) return
    self.postMessage({ type: 'OPEN' })
    self.postMessage({
      type: 'ORDERBOOK_SNAPSHOT',
      payload: {
        symbol: 'BTC',
        orderBook: buildOrderBook(prices.BTC),
        ts: Date.now(),
      },
    })
    timer = setInterval(emitTicks, intervalMs)
  } else if (type === 'DISCONNECT') {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    self.postMessage({ type: 'CLOSE' })
  }
}
