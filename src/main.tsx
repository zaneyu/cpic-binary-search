import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import 'katex/dist/katex.min.css'

function Placeholder() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-heading">CPIC — scaffold OK</h1>
      <p className="mt-2 text-sm text-text-muted">Design tokens wired. Building the surfaces next.</p>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Placeholder />} />
      </Routes>
    </HashRouter>
  </StrictMode>,
)
