'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getEntries } from '@/lib/store'
import type { PerformanceEntry } from '@/lib/store'
import Image from 'next/image'
import MonthlyCalendar from '@/components/MonthlyCalendar'
import TimeHistogram from '@/components/TimeHistogram'
import TrendChart from '@/components/TrendChart'
import { STATEMENTS, PERFORMANCE_TYPES_CONFIG } from '@/lib/constants'
import type { PerformanceType } from '@/lib/constants'

const WEEKDAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']

function StatCard({ label, value, emoji, color }: { label: string; value: string | number; emoji: string, color?: string }) {
    return (
        <div className="glass-card p-3 flex flex-col items-center text-center">
            <span className="text-2xl mb-1">{emoji}</span>
            <p className="text-white font-bold text-lg leading-tight" style={{ color: color || 'white' }}>{value}</p>
            <p className="text-white/40 text-[11px] mt-0.5">{label}</p>
        </div>
    )
}

export default function StatsPage() {
    const [entries, setEntries] = useState<PerformanceEntry[]>([])
    const [selectedType, setSelectedType] = useState<PerformanceType | 'All'>('All')
    const [selectedPartner, setSelectedPartner] = useState<string | null>(null)
    const [selectedDate, setSelectedDate] = useState<string | null>(null)

    useEffect(() => {
        setEntries(getEntries())
    }, [])

    const typeEntries = useMemo(() => {
        if (selectedType === 'All') return entries
        return entries.filter(e => e.type === selectedType)
    }, [entries, selectedType])

    const filteredEntries = useMemo(() => {
        let es = typeEntries
        if (selectedPartner) {
            es = es.filter(e => e.partnerNick === selectedPartner)
        }
        return es
    }, [typeEntries, selectedPartner])

    const dayEntries = useMemo(() => {
        if (!selectedDate) return []
        return entries.filter(e => e.datetime.slice(0, 10) === selectedDate)
    }, [entries, selectedDate])

    const partners = useMemo(() => {
        const map = new Map<string, number>()
        typeEntries.forEach((e) => map.set(e.partnerNick, (map.get(e.partnerNick) ?? 0) + 1))
        return Array.from(map.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([nick, count]) => ({ nick, count }))
    }, [typeEntries])

    const globalStats = useMemo(() => {
        if (typeEntries.length === 0) return null
        const avg = typeEntries.reduce((a, e) => a + e.weightedAvg, 0) / typeEntries.length
        const best = typeEntries.reduce((a, b) => (a.weightedAvg > b.weightedAvg ? a : b))
        const dayCounts = Array(7).fill(0)
        const hourBuckets = Array(24).fill(0)
        typeEntries.forEach((e) => {
            const d = new Date(e.datetime)
            dayCounts[d.getDay()]++
            hourBuckets[d.getHours()]++
        })
        const peakDay = dayCounts.indexOf(Math.max(...dayCounts))
        const peakHour = hourBuckets.indexOf(Math.max(...hourBuckets))

        const hourlyData = hourBuckets.map((count, hour) => ({
            hour: hour.toString().padStart(2, '0'),
            count
        }))

        const locationMap = new Map<string, number>()
        typeEntries.forEach(e => {
            if (e.location?.trim()) {
                const loc = e.location.trim()
                locationMap.set(loc, (locationMap.get(loc) ?? 0) + 1)
            }
        })
        const topLocation = Array.from(locationMap.entries())
            .sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'

        return { avg, best, peakDay, peakHour, topPartner: partners[0]?.nick ?? '—', hourlyData, topLocation }
    }, [typeEntries, partners])

    const partnerStats = useMemo(() => {
        if (!selectedPartner) return null
        const es = typeEntries.filter((e) => e.partnerNick === selectedPartner)
        if (es.length === 0) return null
        const avg = es.reduce((a, e) => a + e.weightedAvg, 0) / es.length
        const best = es.reduce((a, b) => (a.weightedAvg > b.weightedAvg ? a : b))
        const worst = es.reduce((a, b) => (a.weightedAvg < b.weightedAvg ? a : b))

        // Compute statements if a specific type is selected
        let stmtAvgs: { id: number; avg: number; label: string; emoji: string }[] = []
        if (selectedType !== 'All') {
            const stIds = PERFORMANCE_TYPES_CONFIG[selectedType].statements
            stmtAvgs = stIds.map((id, index) => {
                const sAvg = es.reduce((a, e) => a + (e.scores[index] ?? 0), 0) / es.length
                const stmt = STATEMENTS.find(s => s.id === id)!
                return { id, avg: sAvg, label: stmt.label, emoji: stmt.emoji }
            })
        }

        return { avg, best, worst, count: es.length, stmtAvgs }
    }, [typeEntries, selectedPartner, selectedType])

    if (entries.length === 0) {
        return (
            <div className="px-4 pt-6 flex flex-col items-center justify-center" style={{ minHeight: '60vh' }}>
                <div className="text-6xl mb-4 animate-float">📊</div>
                <h2 className="text-xl font-bold text-white mb-2">Nessuna sessione</h2>
                <p className="text-white/40 text-sm text-center">Salva la tua prima performance per vedere le statistiche!</p>
            </div>
        )
    }

    const typeColor = selectedType === 'All' ? '#FF0033' : PERFORMANCE_TYPES_CONFIG[selectedType].color

    return (
        <div className="px-4 pt-6 space-y-4">
            <div className="mb-2 flex items-center gap-3">
                <Image
                    src="/logo.png"
                    alt="PassionTrack Logo"
                    width={32}
                    height={32}
                    className="rounded-lg shadow-md"
                />
                <h1 className="text-3xl font-black" style={{ color: typeColor }}>Statistiche</h1>
            </div>

            {/* Monthly Calendar (Shared among all types) */}
            <div>
                <h2 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">📅 Calendario Globale</h2>
                <MonthlyCalendar
                    entries={entries}
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                />
            </div>

            {/* Day Details (Shared) */}
            <AnimatePresence>
                {selectedDate && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="glass-card p-4 mb-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest">
                                    Dettagli {new Date(selectedDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </h3>
                                <button onClick={() => setSelectedDate(null)} className="text-[10px] text-white/30 hover:text-white/50">Chiudi</button>
                            </div>
                            <div className="space-y-2">
                                {dayEntries.length > 0 ? dayEntries.map(e => {
                                    const conf = PERFORMANCE_TYPES_CONFIG[e.type || 'scopata']
                                    return (
                                        <div key={e.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10" style={{ borderLeft: `3px solid ${conf.color}` }}>
                                            <div className="flex items-center gap-3">
                                                <div className="text-xl">
                                                    {conf.emoji}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">{e.partnerNick}</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-[10px] text-white/40">{e.datetime.split('T')[1].slice(0, 5)}</p>
                                                        {e.location && <span className="text-[10px] text-white/40 px-1.5 py-0.5 rounded-md bg-white/10">📍 {e.location}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-black" style={{ color: conf.color }}>{e.weightedAvg.toFixed(1)}</p>
                                                <p className="text-[9px] text-white/30 uppercase tracking-tighter">Score</p>
                                            </div>
                                        </div>
                                    )
                                }) : (
                                    <p className="text-xs text-white/30 italic py-2 text-center">Nessun rapporto registrato</p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Type Filter */}
            <div>
                <h2 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">🏷️ Filtra per Tipo</h2>
                <div className="flex flex-wrap gap-2 pb-1">
                    <button
                        type="button"
                        onClick={() => { setSelectedType('All'); setSelectedPartner(null) }}
                        className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                        style={{
                            background: selectedType === 'All' ? 'linear-gradient(135deg,#FF0033,#8B00FF)' : 'rgba(255,255,255,0.06)',
                            border: `1px solid ${selectedType === 'All' ? 'rgba(255,0,51,0.5)' : 'rgba(255,255,255,0.1)'}`,
                            color: selectedType === 'All' ? 'white' : 'rgba(255,255,255,0.6)',
                            boxShadow: selectedType === 'All' ? '0 4px 15px rgba(255,0,51,0.3)' : 'none',
                        }}
                    >
                        Tutti
                    </button>
                    {(Object.keys(PERFORMANCE_TYPES_CONFIG) as PerformanceType[]).map(type => {
                        const conf = PERFORMANCE_TYPES_CONFIG[type]
                        const isActive = selectedType === type
                        return (
                            <button
                                key={type}
                                type="button"
                                onClick={() => { setSelectedType(type); setSelectedPartner(null) }}
                                className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                                style={{
                                    background: isActive ? `linear-gradient(135deg, ${conf.color}90, ${conf.color}40)` : 'rgba(255,255,255,0.06)',
                                    border: `1px solid ${isActive ? conf.color : 'rgba(255,255,255,0.1)'}`,
                                    color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
                                    boxShadow: isActive ? `0 4px 15px ${conf.color}40` : 'none',
                                }}
                            >
                                {conf.emoji} {conf.label}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Global stats (Filtered) */}
            {globalStats && (
                <div className="space-y-4">
                    <div>
                        <h2 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">🌍 Overview</h2>
                        <div className="grid grid-cols-2 gap-2">
                            <StatCard label="Media" value={globalStats?.avg.toFixed(2) ?? '0.00'} emoji="📈" color={typeColor} />
                            <StatCard label="Top (Count)" value={globalStats?.topPartner ?? '—'} emoji="👑" color={typeColor} />
                            <StatCard label="Giorno più attivo" value={globalStats ? WEEKDAY_NAMES[globalStats.peakDay] : '—'} emoji="📅" color={typeColor} />
                            <StatCard label="Orario di picco" value={globalStats ? `${globalStats.peakHour}:00` : '--:--'} emoji="⏰" color={typeColor} />
                            <StatCard label="Sessioni filtrate" value={typeEntries.length} emoji="🎯" color={typeColor} />
                            <StatCard label="Top Luogo" value={globalStats?.topLocation ?? '—'} emoji="📍" color={typeColor} />
                        </div>
                    </div>

                    {globalStats && <TimeHistogram data={globalStats.hourlyData} />}
                </div>
            )}

            {/* Partner selector */}
            {
                partners.length > 0 && (
                    <div>
                        <h2 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">{selectedType === 'fai-da-te' ? '🛠️ Per Toy' : '👤 Per Partner'}</h2>
                        <div className="-mx-4 px-4 flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                            {partners.map(({ nick, count }) => (
                                <button
                                    key={nick}
                                    type="button"
                                    onClick={() => setSelectedPartner(selectedPartner === nick ? null : nick)}
                                    className="flex flex-col items-center justify-center shrink-0 w-24 p-3 rounded-xl transition-all"
                                    style={{
                                        background: selectedPartner === nick ? `linear-gradient(135deg, ${typeColor}70, rgba(20,20,30,0.8))` : 'rgba(255,255,255,0.06)',
                                        border: `1px solid ${selectedPartner === nick ? typeColor : 'rgba(255,255,255,0.1)'}`,
                                        color: selectedPartner === nick ? 'white' : 'rgba(255,255,255,0.6)',
                                        boxShadow: selectedPartner === nick ? `0 4px 15px ${typeColor}40` : 'none',
                                    }}
                                >
                                    <span className="font-semibold text-sm truncate w-full text-center">{nick}</span>
                                    <span className="text-white/40 text-[10px] mt-1">{count} volte</span>
                                </button>
                            ))}
                        </div>

                        {partnerStats && selectedPartner && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-3 space-y-3"
                            >
                                <div className="grid grid-cols-3 gap-2">
                                    <StatCard label="Media" value={partnerStats?.avg.toFixed(2) ?? '0.00'} emoji="📊" />
                                    <StatCard label="Record" value={partnerStats?.best.weightedAvg.toFixed(1) ?? '0.0'} emoji="🏆" />
                                    <StatCard label="Min" value={partnerStats?.worst.weightedAvg.toFixed(1) ?? '0.0'} emoji="📉" />
                                </div>
                                {/* Per-statement breakdown (Only shown when a specific type is selected) */}
                                {selectedType !== 'All' && partnerStats.stmtAvgs.length > 0 && (
                                    <div className="glass-card p-4">
                                        <h3 className="text-xs text-white/40 uppercase tracking-widest mb-3 font-semibold">Medie per Parametro</h3>
                                        {partnerStats.stmtAvgs.map((s, i) => {
                                            const pct = (s.avg / 10) * 100
                                            return (
                                                <div key={s.id} className="mb-2.5">
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span className="text-white/60">{s.emoji} {s.label}</span>
                                                        <span className="text-white font-semibold">{s.avg.toFixed(1)}</span>
                                                    </div>
                                                    <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                                                        <motion.div
                                                            className="h-full rounded-full"
                                                            style={{ background: `linear-gradient(90deg, ${typeColor}, #8B00FF)`, width: `${pct}%` }}
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${pct}%` }}
                                                            transition={{ duration: 0.5, delay: i * 0.04 }}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                                {selectedType === 'All' && (
                                    <div className="text-center text-[10px] text-white/40 py-2">
                                        Seleziona un tipo specifico per vedere le medie dei punteggi dettagliati.
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>
                )
            }

            {/* Trend chart */}
            {
                typeEntries.length >= 2 ? (
                    <TrendChart entries={typeEntries} partnerFilter={selectedPartner ?? undefined} />
                ) : (
                    <div className="text-center py-6 text-white/30 text-sm">
                        Aggiungi almeno 2 sessioni per visualizzare il trend 📉
                    </div>
                )
            }

            <div className="h-4" />
        </div >
    )
}
