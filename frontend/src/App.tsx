
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { HomePage } from './pages/HomePage'
import { ResultsPage } from './pages/ResultsPage'
import { ComparisonPage } from './pages/ComparisonPage'
import { SavedAnalysesPage } from './pages/SavedAnalysesPage'
import { WhatIfPage } from './pages/WhatIfPage'

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/analysis/:id" element={<ResultsPage />} />
          <Route path="/comparison" element={<ComparisonPage />} />
          <Route path="/what-if" element={<WhatIfPage />} />
          <Route path="/saved" element={<SavedAnalysesPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}