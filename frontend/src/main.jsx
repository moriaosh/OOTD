import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './styles/legacy.css'
import ErrorBoundary from './components/ErrorBoundary';

  <ErrorBoundary>
    <App />
  </ErrorBoundary>

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

