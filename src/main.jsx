import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AppContexProvider } from './context/AppContext.jsx'

if (import.meta.env.DEV) {
  const { worker } = await import('./mocks/worker')
  worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: import.meta.env.BASE_URL + 'mockServiceWorker.js'
    }
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppContexProvider>
        <App />
      </AppContexProvider>
    </BrowserRouter>
  </StrictMode>,
)
