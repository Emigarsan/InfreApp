import { useEffect, useState } from 'react'
import { get, post } from '../api'

type Session = {
    phase: 'PHASE1' | 'PHASE2' | 'FINISHED',
    hp_current: number,
    hp_max: number,
    locked: boolean,
    total_players: number
} | null

export default function Admin() {
    const [session, setSession] = useState<Session>(null)
    const [p1Normal, setP1Normal] = useState(16)
    const [p1Expert, setP1Expert] = useState(23)
    const [p2Normal, setP2Normal] = useState(23)
    const [p2Expert, setP2Expert] = useState(26)

    useEffect(() => { get<Session>('/api/session').then(setSession).catch(() => setSession(null)) }, [])

    const start = async () => {
        const s = await post<Session>('/api/session/start', { p1Normal, p1Expert, p2Normal, p2Expert })
        setSession(s)
    }
    const advance = async () => {
        const s = await post<Session>('/api/session/advance', {})
        setSession(s)
    }
    const reset = async () => {
        const s = await post<Session>('/api/session/reset', {}) // 🔽 necesitas endpoint (abajo)
        setSession(s)
    }

    const plusMain = (d: number) => post<Session>('/api/session/adjust', { delta: d }).then(setSession)
    const plusAux = (d: number) => post<Session>('/api/session/adjustAux', { delta: d }).then(setSession)


    return (
        <div style={{ display: 'grid', gap: 12 }}>
            <h2>Admin</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, maxWidth: 600 }}>
                <label>F1 Normal <input type="number" value={p1Normal} onChange={e => setP1Normal(+e.target.value || 0)} /></label>
                <label>F1 Experto <input type="number" value={p1Expert} onChange={e => setP1Expert(+e.target.value || 0)} /></label>
                <label>F2 Normal <input type="number" value={p2Normal} onChange={e => setP2Normal(+e.target.value || 0)} /></label>
                <label>F2 Experto <input type="number" value={p2Expert} onChange={e => setP2Expert(+e.target.value || 0)} /></label>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={start} style={{ padding: '8px 12px' }}>Start / Recalc</button>
                <button onClick={advance} style={{ padding: '8px 12px' }}>Advance → Fase 2</button>
                <button onClick={reset} style={{ padding: '8px 12px' }}>Reset</button>
            </div>

            <pre style={{ background: '#111', color: '#0f0', padding: 12, borderRadius: 8, overflow: 'auto' }}>
                {JSON.stringify(session, null, 2)}
            </pre>
        </div>
    )
}
