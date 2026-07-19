/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import RootApp from './RootApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <RootApp />
    </BrowserRouter>
    <Analytics />
  </StrictMode>,
)
