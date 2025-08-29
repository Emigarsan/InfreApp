import { useEffect, useState } from 'react'
import { get, post } from '../api'
import { useNavigate } from 'react-router-dom'
import Autocomplete from '../components/Autocomplete'
import { HEROES, ASPECTS } from '../data/heroes'
import BackgroundLayout from '../components/BackgroundLayout'

type Table = { id: string, name: string, mode: 'NORMAL' | 'EXPERT', playerCount: number }
type PlayerForm = { hero: string; aspect: string }

export default function Questionnaire() {
  const [tables, setTables] = useState<Table[]>([])
  const [choice, setChoice] = useState<'JOIN' | 'CREATE'>('CREATE')
  const [name, setName] = useState('Mesa ' + Math.floor(Math.random() * 1000))
  const [mode, setMode] = useState<'NORMAL' | 'EXPERT'>('NORMAL')
  const [playerCount, setPlayerCount] = useState<number | ''>(1)
  const [players, setPlayers] = useState<PlayerForm[]>([{ hero: '', aspect: '' }])
  const [joinId, setJoinId] = useState<string>('')
  const navigate = useNavigate()

  useEffect(() => {
    get<Table[]>('/api/tables')
      .then(setTables)
      .catch(e => {
        console.error('No se pudo cargar /api/tables', e)
        setTables([])
      })
  }, [])

  useEffect(() => {
    setPlayers(Array.from({ length: playerCount }, (_, i) => players[i] ?? { hero: '', aspect: '' }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerCount])

  const setPlayer = (idx: number, patch: Partial<PlayerForm>) => {
    setPlayers(prev => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)))
  }

  const submit = async () => {
    if (choice === 'CREATE') {
      // Validación mínima
      const ok = players.length > 0 && players.every(p => p.hero && p.aspect)
      if (!ok) {
        alert('Completa Héroe y Aspecto en todos los jugadores')
        return
      }
      await post<Table>('/api/tables', { name, mode, players })
    }
    // Para JOIN seguimos igual (MVP), solo usamos la selección para el flujo
    navigate('/phase1')
  }

  return (
    <BackgroundLayout>
      {/* 🔽 Recuadro con fondo para mejorar legibilidad */}
      <div
        style={{
          backgroundColor: 'rgba(0,0,0,0.75)', // negro translúcido
          color: 'white',
          padding: '24px',
          borderRadius: '12px',
          maxWidth: '700px',
          margin: '0 auto',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
        }}
      >
        <div style={{ display: 'grid', gap: 16 }}>
          <h2 style={{ marginTop: 0 }}>Únete a una mesa o crea una nueva</h2>

          <div style={{ display: 'flex', gap: 12 }}>
            <label><input type="radio" checked={choice === 'CREATE'} onChange={() => setChoice('CREATE')} /> Crear</label>
            <label><input type="radio" checked={choice === 'JOIN'} onChange={() => setChoice('JOIN')} /> Unirse</label>
          </div>

          {choice === 'JOIN' ? (
            <div style={{ display: 'grid', gap: 8 }}>
              <label>Mesa existente
                <select value={joinId} onChange={e => setJoinId(e.target.value)}>
                  <option value="">Selecciona…</option>
                  {tables.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} — {t.mode} — {t.playerCount} jugadores
                    </option>
                  ))}
                </select>
              </label>
              <div style={{ fontSize: 12, opacity: .8 }}>
                Este MVP no añade jugadores al unirse; sirve como selector para el flujo.
              </div>
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
                <input
                  type="number"
                  min={1}
                  max={4}
                  value={playerCount}
                  onChange={e => {
                    const val = e.target.value
                    if (val === '') {
                      setPlayerCount('') // permitir campo vacío mientras escribe
                    } else {
                      const num = parseInt(val, 10)
                      if (!isNaN(num)) {
                        setPlayerCount(Math.min(4, Math.max(1, num)))
                      }
                    }
                  }}
                  onBlur={() => {
                    // Si queda vacío al salir, reponemos un valor válido
                    if (playerCount === '') setPlayerCount(1)
                  }}
                />
              </label>

              <div style={{ display: 'grid', gap: 12 }}>
                {players.map((p, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 8,
                      alignItems: 'end'
                    }}
                  >
                    <Autocomplete
                      label={`Héroe ${idx + 1}`}
                      placeholder="Busca un héroe…"
                      value={p.hero}
                      onChange={(v) => setPlayer(idx, { hero: v })}
                      options={HEROES}
                      autoFocus={idx === players.length - 1 && !p.hero}
                    />
                    <Autocomplete
                      label="Aspecto"
                      placeholder="Busca un aspecto…"
                      value={p.aspect}
                      onChange={(v) => setPlayer(idx, { aspect: v })}
                      options={ASPECTS}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={submit}
            style={{
              padding: '10px 16px',
              borderRadius: 12,
              boxShadow: '0 2px 6px rgba(0,0,0,.2)',
              marginTop: 8
            }}
          >
            Continuar
          </button>
        </div>
      </div>
    </BackgroundLayout>
  )
}
