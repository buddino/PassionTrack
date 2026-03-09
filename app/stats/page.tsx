'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getEntries } from '@/lib/store'
import type { PerformanceEntry } from '@/lib/store'
import MonthlyCalendar from '@/components/MonthlyCalendar'
import TimeHistogram from '@/components/TimeHistogram'
import TrendChart from '@/components/TrendChart'
import { STATEMENTS } from '@/lib/constants'

const WEEKDAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']

function StatCard({ label, value, emoji }: { label: string; value: string | number; emoji: string }) {
    return (
        <div className="glass-card p-3 flex flex-col items-center text-center">
            <span className="text-2xl mb-1">{emoji}</span>
            <p className="text-white font-bold text-lg leading-tight">{value}</p>
            <p className="text-white/40 text-[11px] mt-0.5">{label}</p>
        </div>
    )
}

export default function StatsPage() {
    const [entries, setEntries] = useState<PerformanceEntry[]>([])
    const [selectedPartner, setSelectedPartner] = useState<string | null>(null)
    const [selectedDate, setSelectedDate] = useState<string | null>(null)

    useEffect(() => {
        setEntries(getEntries())
    }, [])

    const filteredEntries = useMemo(() => {
        let es = entries
        if (selectedPartner) {
            es = es.filter(e => e.partnerNick === selectedPartner)
        }
        return es
    }, [entries, selectedPartner])

    const dayEntries = useMemo(() => {
        if (!selectedDate) return []
        return entries.filter(e => e.datetime.slice(0, 10) === selectedDate)
    }, [entries, selectedDate])

    const partners = useMemo(() => {
        const map = new Map<string, number>()
        entries.forEach((e) => map.set(e.partnerNick, (map.get(e.partnerNick) ?? 0) + 1))
        return Array.from(map.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([nick, count]) => ({ nick, count }))
    }, [entries])

    const globalStats = useMemo(() => {
        if (entries.length === 0) return null
        const avg = entries.reduce((a, e) => a + e.weightedAvg, 0) / entries.length
        const best = entries.reduce((a, b) => (a.weightedAvg > b.weightedAvg ? a : b))
        const dayCounts = Array(7).fill(0)
        const hourBuckets = Array(24).fill(0)
        entries.forEach((e) => {
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

        return { avg, best, peakDay, peakHour, topPartner: partners[0]?.nick ?? '—', hourlyData }
    }, [entries, partners])

    const partnerStats = useMemo(() => {
        if (!selectedPartner) return null
        const es = entries.filter((e) => e.partnerNick === selectedPartner)
        if (es.length === 0) return null
        const avg = es.reduce((a, e) => a + e.weightedAvg, 0) / es.length
        const best = es.reduce((a, b) => (a.weightedAvg > b.weightedAvg ? a : b))
        const worst = es.reduce((a, b) => (a.weightedAvg < b.weightedAvg ? a : b))
        // Statement averages
        const stmtAvgs = STATEMENTS.map((_, si) => {
            return es.reduce((a, e) => a + (e.scores[si] ?? 0), 0) / es.length
        })
        return { avg, best, worst, count: es.length, stmtAvgs }
    }, [entries, selectedPartner])

    if (entries.length === 0) {
        return (
            <div className="px-4 pt-6 flex flex-col items-center justify-center" style={{ minHeight: '60vh' }}>
                <div className="text-6xl mb-4 animate-float">📊</div>
                <h2 className="text-xl font-bold text-white mb-2">Nessuna sessione</h2>
                <p className="text-white/40 text-sm text-center">Salva la tua prima performance per vedere le statistiche!</p>
            </div>
        )
    }

    return (
        <div className="px-4 pt-6 space-y-4">
            <div className="mb-2">
                <h1 className="text-3xl font-black" style={{ color: '#FF0033' }}>📊 Statistiche</h1>
            </div>

            {/* Monthly Calendar */}
            <MonthlyCalendar
                entries={entries}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
            />

            {/* Day Details */}
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
                                    📅 Rapporti del {new Date(selectedDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </h3>
                                <button onClick={() => setSelectedDate(null)} className="text-[10px] text-white/30 hover:text-white/50">Chiudi</button>
                            </div>
                            <div className="space-y-2">
                                {dayEntries.length > 0 ? dayEntries.map(e => (
                                    <div key={e.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                                        <div className="flex items-center gap-3">
                                            <div className="text-xl">
                                                {e.partnerGender === 'M' ? '🧔' : e.partnerGender === 'F' ? '👩' : '🌈'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{e.partnerNick}</p>
                                                <p className="text-[10px] text-white/40">{e.datetime.split('T')[1].slice(0, 5)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black" style={{ color: '#FF0033' }}>{e.weightedAvg.toFixed(1)}</p>
                                            <p className="text-[9px] text-white/30 uppercase tracking-tighter">Score</p>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-xs text-white/30 italic py-2 text-center">Nessun rapporto registrato</p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Global stats */}
            {globalStats && (
                <div className="space-y-4">
                    <div>
                        <h2 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">🌍 Global</h2>
                        <div className="grid grid-cols-2 gap-2">
                            <StatCard label="Media globale" value={globalStats.avg.toFixed(2)} emoji="📈" />
                            <StatCard label="Partner top" value={globalStats.topPartner} emoji="👑" />
                            <StatCard label="Giorno più attivo" value={WEEKDAY_NAMES[globalStats.peakDay]} emoji="📅" />
                            <StatCard label="Orario di picco" value={`${globalStats.peakHour}:00`} emoji="⏰" />
                            <StatCard label="Sessioni totali" value={entries.length} emoji="🎯" />
                            <StatCard label="Record assoluto" value={globalStats.best.weightedAvg.toFixed(1)} emoji="🏆" />
                        </div>
                    </div>

                    <TimeHistogram data={globalStats.hourlyData} />
                </div>
            )}

            {/* Partner selector */}
            <div>
                <h2 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">👤 Per Partner</h2>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {partners.map(({ nick, count }) => (
                        <button
                            key={nick}
                            type="button"
                            onClick={() => setSelectedPartner(selectedPartner === nick ? null : nick)}
                            className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                            style={{
                                background: selectedPartner === nick ? 'linear-gradient(135deg,#FF0033,#8B00FF)' : 'rgba(255,255,255,0.06)',
                                border: `1px solid ${selectedPartner === nick ? 'rgba(255,0,51,0.5)' : 'rgba(255,255,255,0.1)'}`,
                                color: selectedPartner === nick ? 'white' : 'rgba(255,255,255,0.6)',
                                boxShadow: selectedPartner === nick ? '0 4px 15px rgba(255,0,51,0.3)' : 'none',
                            }}
                        >
                            {nick} <span className="text-white/40 font-normal text-xs ml-1">{count}x</span>
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
                            <StatCard label="Media" value={partnerStats.avg.toFixed(2)} emoji="📊" />
                            <StatCard label="Record" value={partnerStats.best.weightedAvg.toFixed(1)} emoji="🏆" />
                            <StatCard label="Min" value={partnerStats.worst.weightedAvg.toFixed(1)} emoji="📉" />
                        </div>
                        {/* Per-statement breakdown */}
                        <div className="glass-card p-4">
                            <h3 className="text-xs text-white/40 uppercase tracking-widest mb-3 font-semibold">Medie per Statement</h3>
                            {STATEMENTS.map((s, i) => {
                                const val = partnerStats.stmtAvgs[i]
                                const pct = (val / 10) * 100
                                return (
                                    <div key={s.id} className="mb-2.5">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-white/60">{s.emoji} {s.label}</span>
                                            <span className="text-white font-semibold">{val.toFixed(1)}</span>
                                        </div>
                                        <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                                            <motion.div
                                                className="h-full rounded-full"
                                                style={{ background: 'linear-gradient(90deg, #FF0033, #8B00FF)', width: `${pct}%` }}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ duration: 0.5, delay: i * 0.04 }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Trend chart */}
            <TrendChart entries={entries} partnerFilter={selectedPartner ?? undefined} />

            <div className="h-4" />
        </div>
    )
}
