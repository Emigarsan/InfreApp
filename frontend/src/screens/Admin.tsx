import { useEffect, useState } from 'react'
import { get, post } from '../api'
import { connect, disconnect } from '../ws'
import BackgroundLayout from '../components/BackgroundLayout'

type Session = {
    phase: 'PHASE1' | 'PHASE2' | 'FINISHED',
    hp_current: number,
    hp_max: number,
    locked: boolean,
    total_players: number,
    aux_current?: number,
    aux_max?: number
} | null

export default function Admin() {
    const [session, setSession] = useState<Session>(null)
    const [loading, setLoading] = useState(true)
    const [manualHp, setManualHp] = useState<string>('')

    // Cargar snapshot inicial
    useEffect(() => {
        get<Session>('/api/session')
            .then(s => {
                setSession(s)
                setLoading(false)
            })
            .catch(e => {
                console.error('Error al cargar /api/session', e)
                setLoading(false)
            })
    }, [])

    // Suscripción WS
    useEffect(() => {
        connect((msg: any) => setSession(msg))
        return () => disconnect()
    }, [])

    const start = () => post<Session>('/api/session/start', {}).then(setSession)
    const advance = () => post<Session>('/api/session/advance', {}).then(setSession)
    const recalc = () => post<Session>('/api/session/recalc', {}).then(setSession)

    const applyManualHp = async () => {
        if (!manualHp) return
        const value = parseInt(manualHp, 10)
        if (isNaN(value)) return
        const updated = await post<Session>('/api/session/setHp', { value })
        setSession(updated)
        setManualHp('')
    }

    return (
        <BackgroundLayout>
            <div style={{ display: 'grid', gap: 16, maxWidth: 600 }}>
                <h2>Panel de administración</h2>

                {loading && <div>Cargando estado…</div>}

                {!loading && !session && (
                    <div>
                        No hay ninguna sesión activa todavía.
                        <br />
                        Pulsa <b>Start</b> para iniciar una.
                        <div style={{ marginTop: 12 }}>
                            <button onClick={start}>Start</button>
                        </div>
                    </div>
                )}

                {session && (
                    <>
                        <div>Fase actual: {session.phase}</div>
                        <div>HP: {session.hp_current} / {session.hp_max}</div>
                        <div>Jugadores totales: {session.total_players}</div>

                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button onClick={start}>Start</button>
                            <button onClick={advance}>Avanzar fase</button>
                            <button onClick={recalc}>Recalcular</button>
                        </div>

                        <div style={{ marginTop: 20 }}>
                            <label>
                                Valor de vida manual:
                                <input
                                    type="number"
                                    value={manualHp}
                                    onChange={e => setManualHp(e.target.value)}
                                    style={{ marginLeft: 8 }}
                                />
                            </label>
                            <button onClick={applyManualHp} style={{ marginLeft: 8, }}>
                                Aplicar
                            </button>
                        </div>
                    </>
                )}
            </div>
        </BackgroundLayout>
    )
}
