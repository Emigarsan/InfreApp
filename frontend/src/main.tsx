import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import Questionnaire from './screens/Questionnaire'
import PhaseOne from './screens/PhaseOne'
import PhaseTwo from './screens/PhaseTwo'
import Admin from './screens/Admin'
import './index.css'

const router = createBrowserRouter([
  {
    path: '/', element: <App />,
    children: [
      { index: true, element: <Questionnaire /> },
      { path: 'phase1', element: <PhaseOne /> },
      { path: 'phase2', element: <PhaseTwo /> },
      { path: 'admin', element: <Admin /> }, // 🔽 nueva ruta
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
