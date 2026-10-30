import Navbar from './components/layout/Navbar'
import TickerTape from './components/terminal/TickerTape'
import MainChart from './components/terminal/MainChart'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar />
      <TickerTape />

      <main className="grid grid-cols-1 gap-3 p-3 lg:grid-cols-10">
        <div className="lg:col-span-7">
          <MainChart />
        </div>
      </main>
    </div>
  )
}
