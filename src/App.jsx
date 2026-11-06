import { useEffect } from 'react'
import { connect, disconnect } from './utils/mockSocket'
import Navbar from './components/layout/Navbar'
import TickerTape from './components/terminal/TickerTape'
import MainChart from './components/terminal/MainChart'
import OrderBook from './components/terminal/OrderBook'
import TradePanel from './components/terminal/TradePanel'
import PortfolioSummary from './components/terminal/PortfolioSummary'

export default function App() {
  useEffect(() => {
    connect()
    return () => disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar />
      <TickerTape />

      <main className="grid grid-cols-1 gap-3 p-3 lg:grid-cols-10">
        <div className="lg:col-span-7">
          <MainChart />
        </div>
        <div className="lg:col-span-3">
          <OrderBook />
        </div>
        <div className="lg:col-span-5">
          <TradePanel />
        </div>
        <div className="lg:col-span-5">
          <PortfolioSummary />
        </div>
      </main>
    </div>
  )
}
