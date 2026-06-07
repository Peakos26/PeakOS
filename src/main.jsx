import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/PeakOS/sw.js')
      .then((registration) => {
        console.log('Service Worker registrado com sucesso:', registration)
      })
      .catch((error) => {
        console.log('Falha ao registrar Service Worker:', error)
      })
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
