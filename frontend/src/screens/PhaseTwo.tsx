import { useEffect, useState } from 'react'
import { connect, disconnect } from '../ws'
import { post } from '../api'

type Session = {
  phase: 'PHASE1' | 'PHASE2' | 'FINISHED',
  hp_current: number,
  hp_max: number,
  locked: boolean,
  total_players: number,
  aux_current: number,
  aux_max: number
}

export default function PhaseTwo() {
  const [session, setSession] = useState<Session | null>(null)
  useEffect(() => { connect(setSession); return () => disconnect(); }, [])

  if (!session) return <div>Cargando…</div>
  if (session.phase !== 'PHASE2' && session.phase !== 'FINISHED') return <div>Esperando…</div>

  const disabled = session.locked || session.phase === 'FINISHED'

  const adjustMain = (delta: number) => post<Session>('/api/session/adjust', { delta }).then(setSession)
  const adjustAux = (delta: number) => post<Session>('/api/session/adjustAux', { delta }).then(setSession)

  return (
    <div style={{ display: 'grid', gap: 24, placeItems: 'center' }}>
      {/* Contador 1: Thanos Fase 2 */}
      <div style={{ display: 'grid', gap: 12, placeItems: 'center' }}>
        <img src="/thanos_phase2.png" alt="Thanos Fase 2" style={{ maxWidth: 320 }} />
        <div style={{ fontSize: 28 }}>{session.hp_current} / {session.hp_max}</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[-10, -5, -1, +1, +5, +10].map(d =>
            <button key={'m' + d} disabled={disabled}
              onClick={() => adjustMain(d)}
              style={{ padding: '8px 14px', borderRadius: 12, boxShadow: '0 2px 6px rgba(0,0,0,.2)' }}>
              {d > 0 ? `+${d}` : d}
            </button>
          )}
        </div>
      </div>

      {/* Contador 2: Imagen horizontal + contador basado en participantes */}
      <div style={{ display: 'grid', gap: 12, placeItems: 'center', width: '100%' }}>
        <img src="/indicator_phase2.png" alt="Indicador Fase 2" style={{ maxWidth: 640, width: '100%' }} />
        <div style={{ fontSize: 22 }}>{session.aux_current} / {session.aux_max}</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[-10, -5, -1, +1, +5, +10].map(d =>
            <button key={'a' + d} disabled={disabled}
              onClick={() => adjustAux(d)}
              style={{ padding: '8px 14px', borderRadius: 12, boxShadow: '0 2px 6px rgba(0,0,0,.2)' }}>
              {d > 0 ? `+${d}` : d}
            </button>
          )}
        </div>
        <div style={{ opacity: .7, fontSize: 12 }}>
          Participantes totales: {session.total_players}
        </div>
      </div>

      {session.phase === 'FINISHED' && <div style={{ fontSize: 22 }}>¡Evento completado!</div>}
    </div>
  )
}
