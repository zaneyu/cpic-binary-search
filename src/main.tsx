import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import 'katex/dist/katex.min.css'
import { RootLayout } from './components/layout/RootLayout'
import { SearchPage } from './pages/SearchPage'
import { BobPage } from './pages/BobPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<SearchPage />} />
          <Route path="/bob" element={<BobPage />} />
        </Route>
      </Routes>
    </HashRouter>
  </StrictMode>,
)
