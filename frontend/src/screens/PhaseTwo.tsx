import { useEffect, useState } from 'react'
import { connect, disconnect } from '../ws'
import { get, post } from '../api'
import BackgroundLayout from '../components/BackgroundLayout'

type Session = {
  phase: 'PHASE1' | 'PHASE2' | 'FINISHED',
  hp_current: number,
  hp_max: number,
  locked: boolean,
  total_players: number,
  aux_current: number,
  aux_max: number
} | null

export default function PhaseTwo() {
  const [session, setSession] = useState<Session>(null)

  // 1) Semilla inicial con REST
  useEffect(() => {
    get<Session>('/api/session')
      .then(s => setSession(s))
      .catch(err => {
        console.error('GET /api/session falló', err)
        setSession(null)
      })
  }, [])

  // 2) Suscripción WS
  useEffect(() => {
    connect((msg: any) => setSession(msg))
    return () => disconnect()
  }, [])

  if (!session) return <BackgroundLayout><div>Cargando…</div></BackgroundLayout>
  if (session.phase !== 'PHASE2' && session.phase !== 'FINISHED') <BackgroundLayout>return <div>Esperando Fase 2…</div></BackgroundLayout>

  const disabled = session.locked || session.phase === 'FINISHED'

  const adjustMain = (delta: number) => post<Session>('/api/session/adjust', { delta }).then(setSession)
  const adjustAux = (delta: number) => post<Session>('/api/session/adjustAux', { delta }).then(setSession)

  return (
    <BackgroundLayout>
      <div style={{ display: 'grid', gap: 24, placeItems: 'center' }}>
        {/* Contador principal: Thanos F2 */}
        <div style={{ display: 'grid', gap: 12, placeItems: 'center' }}>
          <img src="/thanos_phase2.png" alt="Thanos Fase 2" style={{ maxWidth: 360 }} />
          <div style={{ fontSize: 28 }}>{session.hp_current} / {session.hp_max}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[-10, -5, -1, +1, +5, +10].map(d =>
              <button
                key={'m' + d}
                disabled={disabled}
                onClick={() => adjustMain(d)}
                style={{ padding: '8px 14px', borderRadius: 12, boxShadow: '0 2px 6px rgba(0,0,0,.2)' }}
              >
                {d > 0 ? `+${d}` : d}
              </button>
            )}
          </div>
        </div>

        {/* Contador auxiliar */}
        <div style={{ display: 'grid', gap: 12, placeItems: 'center', width: '100%' }}>
          {session.aux_current > 0 ? (
            <>
              <img src="/indicator_phase2.png" alt="Indicador Fase 2" style={{ maxWidth: 640, width: '100%' }} />
              <div style={{ fontSize: 22 }}>{session.aux_current} / {session.aux_max}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[-10, -5, -1, +1, +5, +10].map(d =>
                  <button
                    key={'a' + d}
                    disabled={disabled}
                    onClick={() => adjustAux(d)}
                    style={{ padding: '8px 14px', borderRadius: 12, boxShadow: '0 2px 6px rgba(0,0,0,.2)' }}
                  >
                    {d > 0 ? `+${d}` : d}
                  </button>
                )}
              </div>
              <div style={{ opacity: .7, fontSize: 12 }}>
                Participantes totales: {session.total_players}
              </div>
            </>
          ) : (
            <>
              <img src="/indicator_phase2_2.png" alt="Indicador finalizado" style={{ maxWidth: 360, width: '100%' }} />
              <div style={{ fontSize: 20, marginTop: 12, fontWeight: 'bold', color: 'red', textAlign: 'center' }}>
                Cada mesa tiene su Cisne negro individual, no tiene vida masiva. En caso de duda, pregunta a los organizadores
              </div>
            </>
          )}
        </div>

        {session.phase === 'FINISHED' && (
          <div style={{ fontSize: 22 }}>¡Evento completado!</div>
        )}
      </div>
    </BackgroundLayout>
  )
}
