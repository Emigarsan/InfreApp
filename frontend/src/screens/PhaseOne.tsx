import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { connect, disconnect } from '../ws'
import { post } from '../api'

type Session = {
  phase: 'PHASE1' | 'PHASE2' | 'FINISHED',
  hp_current: number,
  hp_max: number,
  locked: boolean,
  total_players: number
}

export default function PhaseOne() {
  const [session, setSession] = useState<Session | null>(null)
  const navigate = useNavigate()

  useEffect(() => { connect(setSession); return () => disconnect(); }, [])

  // 🔽 si el backend ya cambió a PHASE2, redirige
  useEffect(() => {
    if (!session) return
    if (session.phase === 'PHASE2' || session.phase === 'FINISHED') {
      navigate('/phase2')
    }
  }, [session, navigate])

  const adjust = (delta: number) => post<Session>('/api/session/adjust', { delta }).then(setSession)

  if (!session) return <div>Cargando…</div>
  if (session.phase !== 'PHASE1') return <div>Transicionando…</div>

  const disabled = session.locked
  return (
    <div style={{ display: 'grid', placeItems: 'center', gap: 16 }}>
      <img src="/thanos_phase1.png" alt="Thanos Fase 1" style={{ maxWidth: 320 }} />
      <div style={{ fontSize: 28 }}>{session.hp_current} / {session.hp_max}</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[-10, -5, -1, +1, +5, +10].map(d =>
          <button key={d} disabled={disabled}
            onClick={() => adjust(d)}
            style={{ padding: '8px 14px', borderRadius: 12, boxShadow: '0 2px 6px rgba(0,0,0,.2)' }}>
            {d > 0 ? `+${d}` : d}
          </button>
        )}
      </div>
      {disabled && <div style={{ fontSize: 18 }}>¡Fase completada, preparando la siguiente…!</div>}
    </div>
  )
}
