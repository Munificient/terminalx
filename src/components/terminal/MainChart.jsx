import { useEffect, useRef } from 'react'
import { createChart, CandlestickSeries, ColorType } from 'lightweight-charts'
import useMarketStore from '../../store/useMarketStore'

const CANDLE_SECONDS = 5
const HISTORY_COUNT = 120

const round2 = (n) => Math.round(n * 100) / 100
const fmt = (n) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function bucketTime(ms) {
  return Math.floor(ms / 1000 / CANDLE_SECONDS) * CANDLE_SECONDS
}

// walks backwards from the live price so the last candle lines up with the store
function makeHistory(endPrice) {
  let closes = [endPrice]
  for (let i = 0; i < HISTORY_COUNT; i++) {
    closes.unshift(closes[0] * (1 + (Math.random() - 0.5) * 0.002))
  }

  const now = bucketTime(Date.now())
  const candles = []
  for (let i = 1; i < closes.length; i++) {
    const open = closes[i - 1]
    const close = closes[i]
    candles.push({
      time: now - (closes.length - i) * CANDLE_SECONDS,
      open: round2(open),
      high: round2(Math.max(open, close) * (1 + Math.random() * 0.0006)),
      low: round2(Math.min(open, close) * (1 - Math.random() * 0.0006)),
      close: round2(close),
    })
  }
  return candles
}

export default function MainChart() {
  const containerRef = useRef(null)
  const seriesRef = useRef(null)
  const lastCandle = useRef(null)

  const btc = useMarketStore((s) => s.assets.find((a) => a.symbol === 'BTC'))
  const price = btc.currentPrice

  useEffect(() => {
    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94a3b8',
        fontFamily: 'JetBrains Mono, ui-monospace, monospace',
      },
      grid: {
        vertLines: { color: '#1e293b' },
        horzLines: { color: '#1e293b' },
      },
      rightPriceScale: { borderColor: '#334155' },
      timeScale: { borderColor: '#334155', timeVisible: true, secondsVisible: true },
    })

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
      borderVisible: false,
    })

    const startPrice = useMarketStore
      .getState()
      .assets.find((a) => a.symbol === 'BTC').currentPrice
    const history = makeHistory(startPrice)
    series.setData(history)
    chart.timeScale().fitContent()

    seriesRef.current = series
    lastCandle.current = history[history.length - 1]

    return () => {
      seriesRef.current = null
      lastCandle.current = null
    }
  }, [])

  useEffect(() => {
    const series = seriesRef.current
    const last = lastCandle.current
    if (!series || !last) return

    const time = bucketTime(Date.now())
    let next
    if (time === last.time) {
      next = {
        ...last,
        high: Math.max(last.high, price),
        low: Math.min(last.low, price),
        close: price,
      }
    } else {
      next = {
        time,
        open: last.close,
        high: Math.max(last.close, price),
        low: Math.min(last.close, price),
        close: price,
      }
    }

    try {
      series.update(next)
      lastCandle.current = next
    } catch (err) {
      console.error('chart update failed', err)
    }
  }, [price])

  const isUp = btc.change24h >= 0

  return (
    <section className="flex h-full flex-col rounded-lg bg-slate-800 p-3">
      <div className="mb-3 flex items-baseline justify-between">
        <div className="flex items-baseline gap-3">
          <h2 className="text-sm font-semibold text-slate-200">BTC / USD</h2>
          <span className="font-mono text-lg">${fmt(price)}</span>
          <span className={`font-mono text-xs ${isUp ? 'text-up' : 'text-down'}`}>
            {isUp ? '+' : ''}
            {btc.change24h.toFixed(2)}%
          </span>
        </div>
        <span className="text-xs text-slate-500">{CANDLE_SECONDS}s candles</span>
      </div>

      <div className="relative min-h-[320px] flex-1">
        <div ref={containerRef} className="absolute inset-0" />
      </div>
    </section>
  )
}
