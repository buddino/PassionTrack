'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getLocationHistory } from '@/lib/store'

interface LocationDropdownProps {
    location: string
    onChange: (loc: string) => void
}

export default function LocationDropdown({ location, onChange }: LocationDropdownProps) {
    const [open, setOpen] = useState(false)
    const [history, setHistory] = useState<string[]>([])
    const inputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setHistory(getLocationHistory())
    }, [])

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    const filtered = history.filter((h) => h.toLowerCase().includes((location || '').toLowerCase()))

    return (
        <div className="space-y-3 relative z-40">
            <div ref={containerRef} className="relative">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-2 block">
                    📍 Luogo (Opzionale)
                </label>
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={location}
                        onChange={(e) => {
                            onChange(e.target.value)
                            setOpen(true)
                        }}
                        onFocus={() => setOpen(true)}
                        placeholder="Es. Letto, Divano, Macchina..."
                        className="w-full px-4 py-3 rounded-xl text-white placeholder-white/30 outline-none font-medium"
                        style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            transition: 'border-color 0.2s, box-shadow 0.2s',
                        }}
                        onFocusCapture={(e) => {
                            e.target.style.borderColor = 'rgba(255,0,51,0.5)'
                            e.target.style.boxShadow = '0 0 0 3px rgba(255,0,51,0.1)'
                        }}
                        onBlurCapture={(e) => {
                            e.target.style.borderColor = 'rgba(255,255,255,0.12)'
                            e.target.style.boxShadow = 'none'
                        }}
                    />
                    {location && (
                        <button
                            type="button"
                            onClick={() => { onChange(''); inputRef.current?.focus() }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 text-lg"
                        >
                            ×
                        </button>
                    )}
                </div>

                <AnimatePresence>
                    {open && (history.length > 0) && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="absolute z-50 w-full mt-2 rounded-xl overflow-hidden flex flex-col"
                            style={{
                                background: 'rgba(20,20,30,0.97)',
                                border: '1px solid rgba(255,255,255,0.12)',
                                boxShadow: '0 16px 40px rgba(0,0,0,0.8)',
                            }}
                        >
                            <div className="max-h-[220px] overflow-y-auto scrollbar-hide">
                                {filtered.length > 0 ? (
                                    filtered.map((loc) => (
                                        <button
                                            key={loc}
                                            type="button"
                                            onClick={() => {
                                                onChange(loc)
                                                setOpen(false)
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
                                        >
                                            <span className="text-white/90 font-medium">{loc}</span>
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-4 py-3 text-xs text-white/30 italic">Nessun risultato</div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
