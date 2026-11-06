import { ArrowDown, ArrowUp } from 'lucide-react'
import useMarketStore from '../../store/useMarketStore'

const fmt = (n) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function Row({ row, side, maxTotal, flash }) {
  const isAsk = side === 'ask'
  const depth = Math.min(100, (row.total / maxTotal) * 100)

  return (
    <div className={`relative grid grid-cols-3 px-3 py-0.5 font-mono text-xs ${flash}`}>
      <div
        className={`absolute inset-y-0 right-0 ${isAsk ? 'bg-down/10' : 'bg-up/10'}`}
        style={{ width: `${depth}%` }}
      />
      <span className={`relative ${isAsk ? 'text-down' : 'text-up'}`}>{fmt(row.price)}</span>
      <span className="relative text-right text-slate-300">{row.size.toFixed(4)}</span>
      <span className="relative text-right text-slate-500">{row.total.toFixed(4)}</span>
    </div>
  )
}

export default function OrderBook() {
  const { bids, asks } = useMarketStore((s) => s.orderBook)
  const btc = useMarketStore((s) => s.assets.find((a) => a.symbol === 'BTC'))

  const maxTotal = Math.max(asks[asks.length - 1].total, bids[bids.length - 1].total)
  const spread = asks[0].price - bids[0].price

  let flash = ''
  let midColor = 'text-slate-200'
  let Arrow = null
  if (btc.currentPrice > btc.previousPrice) {
    flash = 'flash-up'
    midColor = 'text-up'
    Arrow = ArrowUp
  } else if (btc.currentPrice < btc.previousPrice) {
    flash = 'flash-down'
    midColor = 'text-down'
    Arrow = ArrowDown
  }

  // rows are keyed by price, so a new book remounts them and the flash replays
  return (
    <section className="h-full rounded-lg bg-slate-800 p-3">
      <h2 className="mb-2 text-sm font-semibold text-slate-200">Order Book</h2>

      <div className="grid grid-cols-3 px-3 pb-1 text-[11px] uppercase text-slate-500">
        <span>Price</span>
        <span className="text-right">Size (BTC)</span>
        <span className="text-right">Total</span>
      </div>

      <div>
        {[...asks].reverse().map((row) => (
          <Row key={row.price} row={row} side="ask" maxTotal={maxTotal} flash={flash} />
        ))}
      </div>

      <div className="my-1 flex items-center justify-between border-y border-slate-700 px-3 py-2 font-mono">
        <span className={`flex items-center gap-1 text-base font-semibold ${midColor}`}>
          {fmt(btc.currentPrice)}
          {Arrow && <Arrow className="h-4 w-4" />}
        </span>
        <span className="text-xs text-slate-500">Spread {fmt(spread)}</span>
      </div>

      <div>
        {bids.map((row) => (
          <Row key={row.price} row={row} side="bid" maxTotal={maxTotal} flash={flash} />
        ))}
      </div>
    </section>
  )
}
