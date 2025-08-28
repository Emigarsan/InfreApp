import { Link, Outlet } from 'react-router-dom'

export default function App() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <header style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <h1>LMDT Infrefest</h1>
        <nav style={{ display: 'flex', gap: 12 }}>
          <Link to="/">Cuestionario</Link>
        </nav>
      </header>
      <Outlet />
    </div>
  )
}
