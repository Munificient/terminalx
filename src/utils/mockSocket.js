import useMarketStore from '../store/useMarketStore'

const TICK_MS = 1000
let worker = null

export function connect() {
  // React StrictMode runs effects twice in dev, so without this guard
  // we'd end up with two worker streams ticking at double speed
  if (worker) return

  worker = new Worker(new URL('../workers/marketWorker.js', import.meta.url), {
    type: 'module',
  })

  worker.onmessage = (event) => {
    const { type, payload } = event.data || {}
    const store = useMarketStore.getState()

    if (type === 'OPEN') {
      store.setConnected(true)
    } else if (type === 'TICK' && payload) {
      store.updateTicker(payload.symbol, payload.price)
    } else if (type === 'ORDERBOOK_SNAPSHOT' && payload) {
      store.setOrderBook(payload.orderBook)
    } else if (type === 'CLOSE') {
      store.setConnected(false)
    }
  }

  worker.onerror = (err) => {
    console.error('Market worker stream error', err)
    useMarketStore.getState().setConnected(false)
  }

  worker.postMessage({ type: 'CONNECT', intervalMs: TICK_MS })
}

export function disconnect() {
  if (!worker) return
  worker.postMessage({ type: 'DISCONNECT' })
  worker.terminate()
  worker = null
  useMarketStore.getState().setConnected(false)
}

export function isConnected() {
  return worker !== null
}
