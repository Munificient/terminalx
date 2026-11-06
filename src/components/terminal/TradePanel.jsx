import { useEffect, useState } from 'react'
import useMarketStore from '../../store/useMarketStore'

const fmt = (n) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function TradePanel() {
  const [symbol, setSymbol] = useState('BTC')
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState(null)

  const assets = useMarketStore((s) => s.assets)
  const balance = useMarketStore((s) => s.portfolio.balance)
  const holding = useMarketStore((s) =>
    s.portfolio.holdings.find((h) => h.symbol === symbol)
  )
  const executeTrade = useMarketStore((s) => s.executeTrade)

  const asset = assets.find((a) => a.symbol === symbol)
  const qty = parseFloat(amount)
  const estTotal = Number.isFinite(qty) && qty > 0 ? qty * asset.currentPrice : 0

  useEffect(() => {
    if (!message) return
    const id = setTimeout(() => setMessage(null), 3500)
    return () => clearTimeout(id)
  }, [message])

  function handleTrade(type) {
    let result
    try {
      result = executeTrade(type, symbol, amount, asset.currentPrice)
    } catch (err) {
      console.error('trade failed', err)
      result = { ok: false, error: 'Something went wrong, try again' }
    }

    if (result.ok) {
      const verb = type === 'buy' ? 'Bought' : 'Sold'
      setMessage({
        type: 'success',
        text: `${verb} ${amount} ${symbol} at $${fmt(asset.currentPrice)}`,
      })
      setAmount('')
    } else {
      setMessage({ type: 'error', text: result.error })
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    handleTrade('buy')
  }

  return (
    <section className="h-full rounded-lg bg-slate-800 p-4">
      <h2 className="mb-3 text-sm font-semibold text-slate-200">Trade</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Available USD</span>
          <span className="font-mono">${fmt(balance)}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-xs text-slate-400">
            Asset
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-sm text-slate-100 focus:border-slate-500 focus:outline-none"
            >
              {assets.map((a) => (
                <option key={a.symbol} value={a.symbol}>
                  {a.symbol}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs text-slate-400">
            Amount
            <input
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-sm text-slate-100 focus:border-slate-500 focus:outline-none"
            />
          </label>
        </div>

        <div className="space-y-1 font-mono text-xs text-slate-400">
          <div className="flex justify-between">
            <span>Market price</span>
            <span className="text-slate-200">${fmt(asset.currentPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span>Est. total</span>
            <span className="text-slate-200">${fmt(estTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>You hold</span>
            <span className="text-slate-200">
              {holding ? holding.amount : 0} {symbol}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="submit"
            className="rounded bg-up py-2 text-sm font-semibold text-slate-900 transition-opacity hover:opacity-90"
          >
            Buy
          </button>
          <button
            type="button"
            onClick={() => handleTrade('sell')}
            className="rounded bg-down py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Sell
          </button>
        </div>

        <div className="min-h-[1.25rem] text-xs" role="status">
          {message && (
            <span className={message.type === 'success' ? 'text-up' : 'text-down'}>
              {message.text}
            </span>
          )}
        </div>
      </form>
    </section>
  )
}
