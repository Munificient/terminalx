import useMarketStore from '../store/useMarketStore'

const TICK_MS = 1000

const VOLATILITY = {
  BTC: 0.0015,
  ETH: 0.002,
  SOL: 0.003,
  AAPL: 0.0008,
}

let timer = null

function nextPrice(price, vol) {
  const drift = (Math.random() - 0.5) * 2 * vol
  return Math.round(price * (1 + drift) * 100) / 100
}

function tick() {
  const { assets, updateTicker } = useMarketStore.getState()

  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i]
    const vol = VOLATILITY[asset.symbol] || 0.001
    updateTicker(asset.symbol, nextPrice(asset.currentPrice, vol))
  }
}

export function connect() {
  timer = setInterval(tick, TICK_MS)
}

export function disconnect() {
  if (!timer) return
  clearInterval(timer)
  timer = null
}

export function isConnected() {
  return timer !== null
}
