import { create } from 'zustand'

const ORDER_BOOK_DEPTH = 12

const seedAssets = [
  { id: 1, symbol: 'BTC', name: 'Bitcoin', price: 64250, open24h: 63480 },
  { id: 2, symbol: 'ETH', name: 'Ethereum', price: 3240, open24h: 3262 },
  { id: 3, symbol: 'SOL', name: 'Solana', price: 152.4, open24h: 148.2 },
  { id: 4, symbol: 'AAPL', name: 'Apple Inc.', price: 191.3, open24h: 189.4 },
]

function calcChange(price, open) {
  if (!open) return 0
  return ((price - open) / open) * 100
}

const initialAssets = seedAssets.map((a) => ({
  id: a.id,
  symbol: a.symbol,
  name: a.name,
  currentPrice: a.price,
  previousPrice: a.price,
  open24h: a.open24h,
  change24h: calcChange(a.price, a.open24h),
}))

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

const round8 = (n) => Math.round(n * 1e8) / 1e8
const round2 = (n) => Math.round(n * 100) / 100

const useMarketStore = create((set, get) => ({
  connected: false,
  assets: initialAssets,
  orderBook: buildOrderBook(seedAssets[0].price),
  portfolio: {
    balance: 100000,
    holdings: [
      { symbol: 'BTC', amount: 0.25, avgPrice: 61800 },
      { symbol: 'ETH', amount: 2, avgPrice: 3100 },
    ],
  },

  setConnected: (connected) => set({ connected }),

  setOrderBook: (orderBook) => {
    if (!orderBook || !Array.isArray(orderBook.bids) || !Array.isArray(orderBook.asks)) {
      return
    }
    set({ orderBook })
  },

  updateTicker: (symbol, newPrice) => {
    const price = Number(newPrice)
    if (!Number.isFinite(price) || price <= 0) return

    set((state) => {
      const assets = state.assets.map((a) => {
        if (a.symbol !== symbol) return a
        return {
          ...a,
          previousPrice: a.currentPrice,
          currentPrice: price,
          change24h: calcChange(price, a.open24h),
        }
      })
      return { assets }
    })
  },

  executeTrade: (type, symbol, amount, price) => {
    const qty = Number(amount)
    const px = Number(price)

    if (type !== 'buy' && type !== 'sell') {
      return { ok: false, error: 'Unknown order type' }
    }
    if (!Number.isFinite(qty) || qty <= 0) {
      return { ok: false, error: 'Enter a valid amount' }
    }
    if (!Number.isFinite(px) || px <= 0) {
      return { ok: false, error: 'Invalid price' }
    }

    const { portfolio } = get()
    const cost = qty * px
    const existing = portfolio.holdings.find((h) => h.symbol === symbol)

    if (type === 'buy') {
      if (cost > portfolio.balance) {
        return { ok: false, error: 'Insufficient USD balance' }
      }

      let holdings
      if (existing) {
        const newAmount = existing.amount + qty
        const newAvg = (existing.amount * existing.avgPrice + cost) / newAmount
        holdings = portfolio.holdings.map((h) =>
          h.symbol === symbol
            ? { ...h, amount: round8(newAmount), avgPrice: round2(newAvg) }
            : h
        )
      } else {
        holdings = [
          ...portfolio.holdings,
          { symbol, amount: round8(qty), avgPrice: round2(px) },
        ]
      }

      set({
        portfolio: { balance: round2(portfolio.balance - cost), holdings },
      })
      return { ok: true }
    }

    if (!existing || existing.amount < qty - 1e-9) {
      return { ok: false, error: `Not enough ${symbol} to sell` }
    }

    const holdings = portfolio.holdings
      .map((h) =>
        h.symbol === symbol ? { ...h, amount: round8(h.amount - qty) } : h
      )
      .filter((h) => h.amount > 1e-8)

    set({
      portfolio: { balance: round2(portfolio.balance + cost), holdings },
    })
    return { ok: true }
  },
}))

export default useMarketStore
