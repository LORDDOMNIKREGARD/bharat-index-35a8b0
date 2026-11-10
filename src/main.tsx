import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import Layout from './components/Layout'
import Home from './pages/Home'
import States from './pages/States'
import StatePage from './pages/StatePage'
import Guides from './pages/Guides'
import Who from './pages/Who'
import NotFound from './pages/NotFound'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="states" element={<States />} />
          <Route path="states/:slug" element={<StatePage />} />
          <Route path="guides" element={<Guides />} />
          <Route path="who" element={<Who />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
