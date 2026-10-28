import { memo } from 'react'
import useMarketStore from '../../store/useMarketStore'

const fmt = (n) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// the key on the price span remounts it on every new price, which restarts the css flash
const TickerItem = memo(function TickerItem({ asset }) {
  const { symbol, currentPrice, previousPrice, change24h } = asset

  let priceClass = 'text-slate-200'
  if (currentPrice > previousPrice) priceClass = 'text-up flash-up'
  else if (currentPrice < previousPrice) priceClass = 'text-down flash-down'

  return (
    <div className="flex items-center gap-2 whitespace-nowrap px-6 font-mono text-sm">
      <span className="font-semibold text-slate-400">{symbol}</span>
      <span key={currentPrice} className={`rounded px-1 ${priceClass}`}>
        ${fmt(currentPrice)}
      </span>
      <span className={`text-xs ${change24h >= 0 ? 'text-up' : 'text-down'}`}>
        {change24h >= 0 ? '+' : ''}
        {change24h.toFixed(2)}%
      </span>
    </div>
  )
})

export default function TickerTape() {
  const assets = useMarketStore((s) => s.assets)

  // only 4 assets, so repeat them to make each half wider than a big monitor
  const items = [...assets, ...assets, ...assets]

  return (
    <div className="overflow-hidden border-b border-slate-700 bg-slate-950 py-2">
      <div className="ticker-track flex w-max">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0" aria-hidden={copy === 1}>
            {items.map((asset, i) => (
              <TickerItem key={`${asset.symbol}-${i}`} asset={asset} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
