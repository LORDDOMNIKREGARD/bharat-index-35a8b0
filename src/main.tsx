import { StrictMode, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import Layout from './components/Layout'
import Home from './pages/Home'
const States = lazy(() => import('./pages/States'))
const StatePage = lazy(() => import('./pages/StatePage'))
const Guides = lazy(() => import('./pages/Guides'))
const Who = lazy(() => import('./pages/Who'))
const Practice = lazy(() => import('./pages/Practice'))
const News = lazy(() => import('./pages/News'))
const Help = lazy(() => import('./pages/Help'))
const NotFound = lazy(() => import('./pages/NotFound'))
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="states" element={<States />} />
          <Route path="states/:slug" element={<StatePage />} />
          <Route path="practice" element={<Practice />} />
          <Route path="news" element={<News />} />
          <Route path="help" element={<Help />} />
          <Route path="guides" element={<Guides />} />
          <Route path="who" element={<Who />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
