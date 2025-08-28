import { useEffect, useMemo, useRef, useState } from 'react'

type AutocompleteProps = {
    label?: string
    placeholder?: string
    value: string
    onChange: (next: string) => void
    options: string[]
    maxItems?: number
    autoFocus?: boolean
}

export default function Autocomplete({
    label,
    placeholder,
    value,
    onChange,
    options,
    maxItems = 8,
    autoFocus = false
}: AutocompleteProps) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState(value)
    const [activeIdx, setActiveIdx] = useState(0)
    const wrapRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Filtrado simple (case-insensitive, incluye coincidencias parciales)
    const items = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return options.slice(0, maxItems)
        return options.filter(o => o.toLowerCase().includes(q)).slice(0, maxItems)
    }, [options, query, maxItems])

    useEffect(() => { setQuery(value) }, [value])

    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', onDocClick)
        return () => document.removeEventListener('mousedown', onDocClick)
    }, [])

    useEffect(() => { if (autoFocus) inputRef.current?.focus() }, [autoFocus])

    const commit = (v: string) => {
        onChange(v)
        setQuery(v)
        setOpen(false)
    }

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
            setOpen(true)
            return
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActiveIdx(i => Math.min(i + 1, items.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActiveIdx(i => Math.max(i - 1, 0))
        } else if (e.key === 'Enter') {
            e.preventDefault()
            if (items[activeIdx]) commit(items[activeIdx])
        } else if (e.key === 'Escape') {
            setOpen(false)
        }
    }

    return (
        <div ref={wrapRef} style={{ position: 'relative', width: '100%' }}>
            {label && <label style={{ display: 'block', fontSize: 12, opacity: .8, marginBottom: 4 }}>{label}</label>}
            <input
                ref={inputRef}
                value={query}
                placeholder={placeholder}
                onFocus={() => setOpen(true)}
                onChange={e => { setQuery(e.target.value); setOpen(true); setActiveIdx(0) }}
                onKeyDown={onKeyDown}
                style={{
                    width: '100%', padding: '10px 12px', borderRadius: 12,
                    border: '1px solid #ccc', outline: 'none',
                    boxShadow: '0 1px 3px rgba(0,0,0,.06)'
                }}
                aria-autocomplete="list"
                aria-expanded={open}
            />
            {open && items.length > 0 && (
                <ul
                    role="listbox"
                    style={{
                        position: 'absolute', zIndex: 20, left: 0, right: 0, top: '100%', marginTop: 6,
                        background: '#fff', border: '1px solid #ddd', borderRadius: 12,
                        boxShadow: '0 6px 20px rgba(0,0,0,.08)', maxHeight: 250, overflow: 'auto', padding: 6, listStyle: 'none'
                    }}
                >
                    {items.map((opt, idx) => (
                        <li
                            key={opt}
                            role="option"
                            aria-selected={idx === activeIdx}
                            onMouseDown={(e) => { e.preventDefault(); commit(opt) }} // prevent blur
                            onMouseEnter={() => setActiveIdx(idx)}
                            style={{
                                padding: '8px 10px',
                                borderRadius: 10,
                                background: idx === activeIdx ? '#f3f4f6' : 'transparent',
                                cursor: 'pointer'
                            }}
                        >
                            {opt}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
