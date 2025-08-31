import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { connect, disconnect } from '../ws'
import { get, post } from '../api'
import BackgroundLayout from '../components/BackgroundLayout'

type Session = {
  phase: 'PHASE1' | 'PHASE2' | 'FINISHED',
  hp_current: number,
  hp_max: number,
  locked: boolean,
  total_players: number
} | null

export default function PhaseOne() {
  const [session, setSession] = useState<Session>(null)
  const navigate = useNavigate()

  // 1) Cargar snapshot inicial por REST
  useEffect(() => {
    get<Session>('/api/session')
      .then(s => setSession(s))
      .catch(err => {
        console.error('GET /api/session falló', err)
        setSession(null) // deja “Cargando…” si no hay sesión aún
      })
  }, [])

  // 2) Suscribir a tiempo real
  useEffect(() => {
    connect((msg: any) => setSession(msg))
    return () => disconnect()
  }, [])

  // 3) Si ya estamos en PHASE2/FINISHED, navegar
  useEffect(() => {
    if (!session) return
    if (session.phase === 'PHASE2' || session.phase === 'FINISHED') {
      navigate('/phase2')
    }
  }, [session, navigate])

  const adjust = (delta: number) => post<Session>('/api/session/adjust', { delta }).then(setSession)

  // Render
  if (!session) return <BackgroundLayout><div>Cargando…</div></BackgroundLayout>
  if (session.phase !== 'PHASE1') return <BackgroundLayout><div>Transicionando…</div></BackgroundLayout>

  const disabled = session.locked
  return (
    <BackgroundLayout>
      <div style={{ display: 'grid', placeItems: 'center', gap: 16 }}>
        <img src="/thanos_phase1.png" alt="Thanos Fase 1" style={{ maxWidth: 360 }} />
        <div style={{ fontSize: 28 }}>{session.hp_current} / {session.hp_max}</div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[-10, -5, -1, +1, +5, +10].map(d =>
            <button key={d} disabled={disabled}
              onClick={() => adjust(d)}
              style={{ padding: '8px 14px', borderRadius: 12, boxShadow: '0 2px 6px rgba(0,0,0,.2)', color: "blueviolet" }}>
              {d > 0 ? `+${d}` : d}
            </button>
          )}
        </div>

        {disabled && <div style={{ fontSize: 14, opacity: .7, color: 'white' }}>
          Parece que Thanos está tramando algo...
        </div>}
      </div>
    </BackgroundLayout>
  )
}
