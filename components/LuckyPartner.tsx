'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getEntries, PerformanceEntry } from '@/lib/store'
import { PERFORMANCE_TYPES_CONFIG, Gender } from '@/lib/constants'

type TimeFrame = 'week' | 'month' | '3months' | '6months' | 'year' | 'all'

const TIMEFRAME_LABELS: Record<TimeFrame, string> = {
    week: 'Ultima Settimana',
    month: 'Ultimo Mese',
    '3months': 'Ultimi 3 Mesi',
    '6months': 'Ultimi 6 Mesi',
    year: 'Ultimo Anno',
    all: 'Tutto il tempo'
}

const GENDER_OPTIONS: { value: Gender; emoji: string; label: string }[] = [
    { value: 'M', emoji: '♂️', label: 'Maschio' },
    { value: 'F', emoji: '♀️', label: 'Femmina' },
    { value: 'O', emoji: '⚧️', label: 'Altro' }
]

export default function LuckyPartner() {
    const [timeframe, setTimeframe] = useState<TimeFrame>('month')
    const [threshold, setThreshold] = useState(7.0)
    const [thresholdMode, setThresholdMode] = useState<'avg' | 'max'>('avg')
    const [selectedGenders, setSelectedGenders] = useState<Set<Gender>>(new Set(['M', 'F', 'O']))
    const [isRolling, setIsRolling] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [showFederica, setShowFederica] = useState(false)

    const toggleGender = (g: Gender) => {
        const next = new Set(selectedGenders)
        if (next.has(g)) {
            if (next.size > 1) next.delete(g)
        } else {
            next.add(g)
        }
        setSelectedGenders(next)
    }

    const handleRoll = () => {
        setIsRolling(true)
        setError(null)

        // Simulate rolling time
        setTimeout(() => {
            const entries = getEntries()
            const now = new Date()

            // Calculate cutoff date
            let cutoff = new Date(0) // Default to all time
            if (timeframe === 'week') cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            else if (timeframe === 'month') cutoff = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
            else if (timeframe === '3months') cutoff = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
            else if (timeframe === '6months') cutoff = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
            else if (timeframe === 'year') cutoff = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())

            // Filter human partners (ignore fai-da-te) in timeframe AND gender
            const filteredEntries = entries.filter(e => {
                const entryDate = new Date(e.datetime)
                const isHuman = e.type !== 'fai-da-te'
                const isInTimeframe = entryDate >= cutoff
                const isInGender = selectedGenders.has(e.partnerGender)
                return isHuman && isInTimeframe && isInGender
            })

            if (filteredEntries.length === 0) {
                setShowFederica(true)
                setIsRolling(false)
                return
            }

            // Group by partner
            const partnerStats = new Map<string, { entries: PerformanceEntry[], max: number, avg: number }>()
            filteredEntries.forEach(e => {
                if (!partnerStats.has(e.partnerNick)) {
                    partnerStats.set(e.partnerNick, { entries: [], max: 0, avg: 0 })
                }
                const stats = partnerStats.get(e.partnerNick)!
                stats.entries.push(e)
                stats.max = Math.max(stats.max, e.weightedAvg)
                stats.avg = stats.entries.reduce((acc, curr) => acc + curr.weightedAvg, 0) / stats.entries.length
            })

            // Filter by threshold
            const candidates = Array.from(partnerStats.entries())
                .filter(([_, stats]) => {
                    const value = thresholdMode === 'avg' ? stats.avg : stats.max
                    return value >= threshold
                })
                .map(([nick, stats]) => ({ nick, ...stats }))

            if (candidates.length === 0) {
                setShowFederica(true)
                setIsRolling(false)
                return
            }

            // Random selection
            const winner = candidates[Math.floor(Math.random() * candidates.length)]
            const lastEntry = [...winner.entries].sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())[0]

            setResult({
                nick: winner.nick,
                avg: winner.avg,
                max: winner.max,
                lastDate: new Date(lastEntry.datetime).toLocaleDateString('it-IT'),
                lastScore: lastEntry.weightedAvg
            })
            setIsRolling(false)
        }, 2000)
    }

    return (
        <div className="mt-8 mb-12">
            <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🎲</span>
                <h2 className="text-xl font-bold text-white">Mi sento fortunato</h2>
            </div>

            <div className="glass-card p-5">
                <div className="space-y-4">
                    {/* Timeframe Select */}
                    <div>
                        <label className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-2 block">
                            📅 Periodo
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {(Object.keys(TIMEFRAME_LABELS) as TimeFrame[]).map(tf => (
                                <button
                                    key={tf}
                                    onClick={() => setTimeframe(tf)}
                                    className={`text-[10px] py-2 px-1 rounded-lg border transition-all ${timeframe === tf
                                        ? 'bg-white/10 border-white/30 text-white'
                                        : 'bg-white/5 border-white/5 text-white/40'
                                        }`}
                                >
                                    {TIMEFRAME_LABELS[tf]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Gender Toggle */}
                    <div>
                        <label className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-2 block">
                            👤 Genere
                        </label>
                        <div className="flex gap-2">
                            {GENDER_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => toggleGender(opt.value)}
                                    className={`flex-1 py-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${selectedGenders.has(opt.value)
                                        ? 'bg-[#FF0033]/10 border-[#FF0033]/40 text-white'
                                        : 'bg-white/5 border-white/5 text-white/20'
                                        }`}
                                >
                                    <span className="text-lg">{opt.emoji}</span>
                                    <span className="text-[9px] font-bold uppercase">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">
                            Voto minimo ({thresholdMode === 'avg' ? 'Media' : 'Massimo'})
                        </label>
                        <button
                            onClick={() => setThresholdMode(prev => prev === 'avg' ? 'max' : 'avg')}
                            className="text-[10px] px-2 py-1 bg-white/10 rounded-md text-white/70 border border-white/10"
                        >
                            Cambia a {thresholdMode === 'avg' ? 'Max' : 'Media'}
                        </button>
                    </div>

                    {/* Threshold Slider */}
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            min={0}
                            max={10}
                            step={0.5}
                            value={threshold}
                            onChange={(e) => setThreshold(parseFloat(e.target.value))}
                            className="custom-slider flex-1"
                            style={{
                                background: `linear-gradient(to right, #8B00FF 0%, #8B00FF ${(threshold / 10) * 100}%, rgba(255,255,255,0.1) ${(threshold / 10) * 100}%, rgba(255,255,255,0.1) 100%)`,
                            }}
                        />
                        <span className="text-lg font-black text-white w-8 text-right">{threshold.toFixed(1)}</span>
                    </div>

                    {error && (
                        <p className="text-red-400 text-[10px] text-center font-bold italic">{error}</p>
                    )}

                    <motion.button
                        onClick={handleRoll}
                        disabled={isRolling}
                        className="btn-neon w-full py-4 text-sm font-bold flex items-center justify-center gap-2 group"
                        whileTap={{ scale: 0.95 }}
                    >
                        <span className={`text-xl ${isRolling ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'}`}>🔑</span>
                        Chi chiavo stasera?
                    </motion.button>
                </div>
            </div>

            {/* Dice Roll Animation Overlay */}
            <AnimatePresence>
                {isRolling && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center overflow-hidden"
                    >
                        <motion.div
                            animate={{
                                rotateY: [0, 360, 720],
                                rotateX: [0, 180, 360],
                                scale: [1, 1.2, 1]
                            }}
                            transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
                            className="text-8xl mb-8 filter drop-shadow-[0_0_30px_rgba(139,0,255,0.8)]"
                        >
                            🎲
                        </motion.div>
                        <h2 className="text-white text-2xl font-black italic tracking-tighter animate-pulse">LANCIO DEI DADI...</h2>

                        {/* Background light rays */}
                        <div className="absolute inset-0 -z-10 overflow-hidden">
                            {[...Array(6)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute top-1/2 left-1/2 h-40 w-[200vw] bg-gradient-to-r from-transparent via-[#8B00FF]/20 to-transparent"
                                    style={{ marginLeft: '-100vw', marginTop: '-20px' }}
                                    animate={{ rotate: [i * 30, i * 30 + 360] }}
                                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results Modal - Federica (Empty State) */}
            <AnimatePresence>
                {showFederica && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowFederica(false)}
                        className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 50 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full max-w-sm"
                        >
                            <motion.div
                                animate={{ rotate: [0, -10, 10, -10, 0] }}
                                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                                className="text-8xl mb-6 mx-auto"
                            >
                                🖐️
                            </motion.div>
                            <h2 className="text-3xl font-black text-white mb-2">No worries...</h2>
                            <p className="text-xl text-white/60 mb-8 font-medium italic">c&apos;è Federica!</p>

                            <button
                                onClick={() => setShowFederica(false)}
                                className="w-full py-4 rounded-2xl bg-white/10 border border-white/20 text-white font-black text-sm active:scale-95 transition-transform"
                            >
                                RIPROVA 🎲
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results Modal - Winner */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setResult(null)}
                        className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6"
                        style={{ paddingTop: 'var(--safe-area-top)', paddingBottom: 'var(--safe-area-bottom)' }}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 50 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full max-w-sm text-center relative"
                        >
                            <div className="text-7xl mb-6 drop-shadow-[0_0_20px_rgba(255,102,51,0.5)]">🔥</div>

                            <h3 className="text-white/40 text-xs font-black uppercase tracking-[0.3em] mb-2">Destino scelto</h3>
                            <h2 className="text-5xl font-black text-white mb-8 break-words drop-shadow-[0_0_20px_rgba(255,0,51,0.5)]">
                                {result.nick}
                            </h2>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="glass-card p-3 border-white/5 bg-white/5">
                                    <p className="text-[10px] text-white/30 uppercase font-bold mb-1">Voto Medio</p>
                                    <p className="text-2xl font-black text-[#8B00FF]">{result.avg.toFixed(1)}</p>
                                </div>
                                <div className="glass-card p-3 border-white/5 bg-white/5">
                                    <p className="text-[10px] text-white/30 uppercase font-bold mb-1">Voto Massimo</p>
                                    <p className="text-2xl font-black text-[#FF0033]">{result.max.toFixed(1)}</p>
                                </div>
                            </div>

                            <div className="glass-card p-6 border-white/10 bg-[#FF0033]/5 text-left mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] text-white/40 uppercase font-black">Ultima performance</span>
                                    <span className="text-xs text-white font-bold">{result.lastDate}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full border-2 border-[#FF0033]/30 flex items-center justify-center text-xl font-black text-[#FF0033]">
                                        {result.lastScore.toFixed(0)}
                                    </div>
                                    <p className="text-white/60 text-sm italic">"Vai a colpo sicuro!"</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setResult(null)}
                                className="w-full py-4 rounded-2xl bg-white text-black font-black text-sm active:scale-95 transition-transform"
                            >
                                HO CAPITO! 🚀
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
