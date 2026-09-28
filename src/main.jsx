import React from 'react'
import { createRoot } from 'react-dom/client'
import App from '../index.jsx'

function createStandaloneStorage() {
  return {
    async get(key) {
      const raw = localStorage.getItem(`ai-travel-planner:${key}`)
      return raw ? JSON.parse(raw) : null
    },
    async set(key, value) {
      localStorage.setItem(`ai-travel-planner:${key}`, JSON.stringify(value))
      return true
    },
  }
}

window.mobius = window.mobius || { storage: createStandaloneStorage() }

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App appId="standalone" token="standalone" />
  </React.StrictMode>
)
