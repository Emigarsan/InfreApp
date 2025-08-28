import { useEffect, useState } from 'react'
import { get, post } from '../api'
import { useNavigate } from 'react-router-dom'

type Table = { id: string, name: string, mode: 'NORMAL' | 'EXPERT', playerCount: number }

export default function Questionnaire() {
  const [tables, setTables] = useState<Table[]>([])
  const [choice, setChoice] = useState<'JOIN' | 'CREATE'>('CREATE')
  const [name, setName] = useState('Mesa ' + Math.floor(Math.random() * 1000))
  const [mode, setMode] = useState<'NORMAL' | 'EXPERT'>('NORMAL')
  const [playerCount, setPlayerCount] = useState(1)
  const [players, setPlayers] = useState<{ hero: string, aspect: string }[]>([{ hero: '', aspect: '' }])
  const [joinId, setJoinId] = useState<string>('')
  const navigate = useNavigate()

  useEffect(() => { get<Table[]>('/api/tables').then(setTables) }, [])
  useEffect(() => {
    setPlayers(Array.from({ length: playerCount }, (_, i) => players[i] ?? { hero: '', aspect: '' }))
  }, [playerCount])

  const submit = async () => {
    if (choice === 'CREATE') {
      await post<Table>('/api/tables', {
        name, mode,
        players
      })
    }
    navigate('/phase1')
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <h2>Únete a una mesa o crea una nueva</h2>

      <div style={{ display: 'flex', gap: 12 }}>
        <label><input type="radio" checked={choice === 'CREATE'} onChange={() => setChoice('CREATE')} /> Crear</label>
        <label><input type="radio" checked={choice === 'JOIN'} onChange={() => setChoice('JOIN')} /> Unirse</label>
      </div>

      {choice === 'JOIN' ? (
        <div style={{ display: 'grid', gap: 8 }}>
          <label>Mesa existente
            <select value={joinId} onChange={e => setJoinId(e.target.value)}>
              <option value="">Selecciona…</option>
              {tables.map(t => <option key={t.id} value={t.id}>{t.name} — {t.mode} — {t.playerCount} jugadores</option>)}
            </select>
          </label>
          <div style={{ fontSize: 12, opacity: .8 }}>Este MVP no añade jugadores al unirse; sirve como selector para el flujo.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          <label>Nombre de la mesa
            <input value={name} onChange={e => setName(e.target.value)} />
          </label>
          <label>Modo
            <select value={mode} onChange={e => setMode(e.target.value as any)}>
              <option value="NORMAL">Normal</option>
              <option value="EXPERT">Experto</option>
            </select>
          </label>
          <label>Nº de jugadores
            <input type="number" min={1} max={4} value={playerCount} onChange={e => setPlayerCount(parseInt(e.target.value || '1'))} />
          </label>

          <div style={{ display: 'grid', gap: 8 }}>
            {players.map((p, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <input placeholder={"Personaje " + (idx + 1)} value={p.hero} onChange={e => {
                  const n = [...players]; n[idx] = { ...n[idx], hero: e.target.value }; setPlayers(n)
                }} />
                <select value={p.aspect} onChange={e => {
                  const n = [...players]; n[idx] = { ...n[idx], aspect: e.target.value }; setPlayers(n)
                }}>
                  <option value="">Aspecto…</option>
                  <option value="Aggression">Agresividad</option>
                  <option value="Justice">Justicia</option>
                  <option value="Leadership">Liderazgo</option>
                  <option value="Protection">Protección</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={submit} style={{ padding: '10px 16px', borderRadius: 12, boxShadow: '0 2px 6px rgba(0,0,0,.2)' }}>Continuar</button>

      <div style={{ fontSize: 12, opacity: .8 }}>
        Un admin puede iniciar/ajustar la sesión con POST /api/session/start y /api/session/adjust.
      </div>
    </div>
  )
}
