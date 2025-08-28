import { Link, Outlet } from 'react-router-dom'

export default function App() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <header style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <h1>Thanos Event</h1>
        <nav style={{ display: 'flex', gap: 12 }}>
          <Link to="/">Cuestionario</Link>
          <Link to="/phase1">Fase 1</Link>
          <Link to="/phase2">Fase 2</Link>
          <Link to="/admin">Admin</Link>

        </nav>
      </header>
      <Outlet />
    </div>
  )
}
