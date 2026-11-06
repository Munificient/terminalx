import useMarketStore from '../../store/useMarketStore'

const fmt = (n) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function PortfolioSummary() {
  const portfolio = useMarketStore((s) => s.portfolio)
  const assets = useMarketStore((s) => s.assets)

  const rows = portfolio.holdings.map((h) => {
    const asset = assets.find((a) => a.symbol === h.symbol)
    const price = asset ? asset.currentPrice : 0
    const value = h.amount * price
    const pnl = h.avgPrice > 0 ? ((price - h.avgPrice) / h.avgPrice) * 100 : 0
    return { ...h, price, value, pnl }
  })

  const holdingsValue = rows.reduce((sum, r) => sum + r.value, 0)
  const totalValue = portfolio.balance + holdingsValue

  return (
    <section className="h-full rounded-lg bg-slate-800 p-4">
      <h2 className="mb-3 text-sm font-semibold text-slate-200">Portfolio</h2>

      <div className="mb-4 grid grid-cols-3 gap-3 font-mono">
        <div>
          <div className="font-sans text-[11px] uppercase text-slate-500">Total value</div>
          <div className="text-sm sm:text-base">${fmt(totalValue)}</div>
        </div>
        <div>
          <div className="font-sans text-[11px] uppercase text-slate-500">USD balance</div>
          <div className="text-sm sm:text-base">${fmt(portfolio.balance)}</div>
        </div>
        <div>
          <div className="font-sans text-[11px] uppercase text-slate-500">Holdings</div>
          <div className="text-sm sm:text-base">${fmt(holdingsValue)}</div>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">No holdings yet. Buy something to get started.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] font-mono text-xs">
            <thead>
              <tr className="text-left text-[11px] uppercase text-slate-500">
                <th className="pb-2 font-normal">Asset</th>
                <th className="pb-2 text-right font-normal">Amount</th>
                <th className="pb-2 text-right font-normal">Avg price</th>
                <th className="pb-2 text-right font-normal">Value</th>
                <th className="pb-2 text-right font-normal">P&amp;L</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.symbol} className="border-t border-slate-700">
                  <td className="py-2 font-semibold text-slate-200">{row.symbol}</td>
                  <td className="py-2 text-right">
                    {row.amount.toLocaleString('en-US', { maximumFractionDigits: 6 })}
                  </td>
                  <td className="py-2 text-right text-slate-400">${fmt(row.avgPrice)}</td>
                  <td className="py-2 text-right">${fmt(row.value)}</td>
                  <td className={`py-2 text-right ${row.pnl >= 0 ? 'text-up' : 'text-down'}`}>
                    {row.pnl >= 0 ? '+' : ''}
                    {row.pnl.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
