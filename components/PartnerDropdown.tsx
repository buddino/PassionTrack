'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getPartnerHistory } from '@/lib/store'
import type { Gender, PerformanceType } from '@/lib/constants'

interface PartnerDropdownProps {
    type: PerformanceType
    nick: string
    gender: Gender
    onNickChange: (nick: string) => void
    onGenderChange: (g: Gender) => void
}

export default function PartnerDropdown({ type, nick, gender, onNickChange, onGenderChange }: PartnerDropdownProps) {
    const [open, setOpen] = useState(false)
    const [history, setHistory] = useState<Array<{ nick: string; gender: Gender }>>([])
    const inputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const hasPrefilledRef = useRef(false)

    useEffect(() => {
        setHistory(getPartnerHistory(type))
        if (type === 'fai-da-te' && !hasPrefilledRef.current) {
            if (!nick) {
                onNickChange('Federica')
                onGenderChange('F')
            }
            hasPrefilledRef.current = true
        } else if (type !== 'fai-da-te') {
            hasPrefilledRef.current = false
        }
    }, [type, nick, onNickChange, onGenderChange])

    useEffect(() => {
        const exactMatch = history.find(h => h.nick.toLowerCase() === nick.trim().toLowerCase())
        if (exactMatch && exactMatch.gender !== gender) {
            onGenderChange(exactMatch.gender)
        }
    }, [nick, history, gender, onGenderChange])

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    const [searchTerm, setSearchTerm] = useState('')
    const isToy = type === 'fai-da-te'

    const filtered = history.filter((h) =>
        h.nick.toLowerCase().includes(searchTerm.toLowerCase() || nick.toLowerCase())
    )

    const showSearch = history.length > 10

    const genderOptions: { value: Gender; label: string; emoji: string }[] = [
        { value: 'M', label: 'Uomo', emoji: '♂️' },
        { value: 'F', label: 'Donna', emoji: '♀️' },
        { value: 'O', label: 'Altro', emoji: '⚧️' },
    ]

    const exactMatch = history.find(h => h.nick.toLowerCase() === nick.trim().toLowerCase())

    return (
        <div className="space-y-3 relative z-50">
            <div ref={containerRef} className="relative">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-2 block">
                    {isToy ? '🖐️ Nome tool / toy' : '👤 Nickname Partner'}
                </label>
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={nick}
                        onChange={(e) => {
                            onNickChange(e.target.value)
                            setOpen(true)
                        }}
                        onFocus={() => setOpen(true)}
                        placeholder="Nome o nickname..."
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
                    {isToy && nick.trim().toLowerCase() === 'federica' && (
                        <div className="absolute right-9 top-1/2 -translate-y-1/2 text-lg pointer-events-none opacity-80" aria-hidden="true">
                            🖐️
                        </div>
                    )}
                    {nick && (
                        <button
                            type="button"
                            onClick={() => { onNickChange(''); inputRef.current?.focus() }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 text-lg flex items-center justify-center p-1"
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
                            {showSearch && (
                                <div className="p-2 border-b border-white/10 bg-white/5">
                                    <input
                                        type="text"
                                        autoFocus
                                        placeholder="Cerca partner..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-3 py-2 bg-white/5 rounded-lg text-xs text-white outline-none border border-white/10 focus:border-white/20"
                                    />
                                </div>
                            )}
                            <div className="max-h-[220px] overflow-y-auto scrollbar-hide">
                                {filtered.length > 0 ? (
                                    filtered.map((h) => (
                                        <button
                                            key={h.nick}
                                            type="button"
                                            onClick={() => {
                                                onNickChange(h.nick)
                                                onGenderChange(h.gender)
                                                setOpen(false)
                                                setSearchTerm('')
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
                                        >
                                            <span className="text-lg">{h.gender === 'M' ? '♂️' : h.gender === 'F' ? '♀️' : '⚧️'}</span>
                                            <span className="text-white/90 font-medium">{h.nick}</span>
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

            {!isToy && (
                <div className={exactMatch ? "opacity-50 pointer-events-none" : ""}>
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-2 block">
                        ⚧ Genere {exactMatch && "(Bloccato dalla history)"}
                    </label>
                    <div className="flex gap-2">
                        {genderOptions.map(({ value, label, emoji }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => onGenderChange(value)}
                                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5"
                                style={{
                                    background: gender === value ? 'linear-gradient(135deg, #FF0033, #8B00FF)' : 'rgba(255,255,255,0.05)',
                                    border: gender === value ? '1px solid rgba(255,0,51,0.5)' : '1px solid rgba(255,255,255,0.08)',
                                    color: gender === value ? 'white' : 'rgba(255,255,255,0.5)',
                                    boxShadow: gender === value ? '0 4px 15px rgba(255,0,51,0.3)' : 'none',
                                }}
                            >
                                {emoji} {label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
