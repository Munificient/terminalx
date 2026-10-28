import Navbar from './components/layout/Navbar'
import TickerTape from './components/terminal/TickerTape'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar />
      <TickerTape />
    </div>
  )
}
