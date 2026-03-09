'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getSettings, saveSettings, clearAllEntries, exportJSON } from '@/lib/store'
import { STATEMENTS, DEFAULT_WEIGHTS } from '@/lib/constants'

export default function SettingsPage() {
    const [weights, setWeights] = useState(DEFAULT_WEIGHTS)
    const [saved, setSaved] = useState(false)
    const [showClearConfirm, setShowClearConfirm] = useState(false)
    const [cleared, setCleared] = useState(false)

    useEffect(() => {
        const s = getSettings()
        setWeights(s.weights)
    }, [])

    const handleWeightChange = (i: number, v: number) => {
        setWeights((prev) => {
            const next = [...prev]
            next[i] = v
            return next
        })
        setSaved(false)
    }

    const handleSave = () => {
        saveSettings({ weights })
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
    }

    const handleReset = () => {
        setWeights(DEFAULT_WEIGHTS)
        saveSettings({ weights: DEFAULT_WEIGHTS })
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    const handleClear = () => {
        clearAllEntries()
        setShowClearConfirm(false)
        setCleared(true)
        setTimeout(() => setCleared(false), 3000)
    }

    return (
        <div className="px-4 pt-6 space-y-5 pb-8">
            <h1 className="text-3xl font-black" style={{ color: '#FF0033' }}>⚙️ Impostazioni</h1>

            {/* Weights section */}
            <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="font-bold text-white">⚖️ Pesi degli Statement</h2>
                        <p className="text-xs text-white/40 mt-0.5">Personalizza l&apos;importanza di ogni criterio</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="text-xs px-3 py-1.5 rounded-lg btn-ghost"
                    >
                        Reset
                    </button>
                </div>

                {STATEMENTS.map((s, i) => (
                    <div key={s.id} className="mb-4">
                        <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">{s.emoji}</span>
                                <span className="text-sm font-medium text-white/80">{s.label}</span>
                            </div>
                            <span className="text-sm font-bold text-white/90 min-w-[32px] text-right">
                                {weights[i].toFixed(2)}
                            </span>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={3}
                            step={0.25}
                            value={weights[i]}
                            onChange={(e) => handleWeightChange(i, parseFloat(e.target.value))}
                            className="custom-slider w-full"
                            style={{
                                background: `linear-gradient(to right, rgba(139,0,255,0.8) 0%, rgba(139,0,255,0.8) ${(weights[i] / 3) * 100}%, rgba(255,255,255,0.1) ${(weights[i] / 10) * 100}%, rgba(255,255,255,0.1) 100%)`,
                            }}
                        />
                    </div>
                ))}

                <motion.button
                    type="button"
                    onClick={handleSave}
                    className="btn-neon w-full py-3 text-sm font-bold mt-2"
                    whileTap={{ scale: 0.97 }}
                >
                    {saved ? '✅ Salvato!' : '💾 Salva Pesi'}
                </motion.button>
            </div>

            {/* Export */}
            <div className="glass-card p-4">
                <h2 className="font-bold text-white mb-1">📤 Export Dati</h2>
                <p className="text-xs text-white/40 mb-4">Scarica tutte le sessioni in formato JSON</p>
                <button
                    type="button"
                    onClick={exportJSON}
                    className="btn-ghost w-full py-3 text-sm font-semibold"
                >
                    📥 Export JSON
                </button>
            </div>

            {/* Danger zone */}
            <div className="glass-card p-4" style={{ borderColor: 'rgba(255,0,51,0.2)' }}>
                <h2 className="font-bold text-white mb-1">⚠️ Zona Pericolo</h2>
                <p className="text-xs text-white/40 mb-4">Questa azione è irreversibile</p>

                <AnimatePresence mode="wait">
                    {cleared ? (
                        <motion.div
                            key="cleared"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-3 text-green-400 text-sm font-semibold"
                        >
                            ✅ Database svuotato con successo
                        </motion.div>
                    ) : showClearConfirm ? (
                        <motion.div
                            key="confirm"
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="space-y-3"
                        >
                            <div className="glass-card p-3 text-center" style={{ borderColor: 'rgba(255,0,51,0.3)' }}>
                                <p className="text-white font-semibold text-sm">Sei sicuro?</p>
                                <p className="text-white/40 text-xs mt-1">Tutti i dati verranno eliminati permanentemente</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowClearConfirm(false)}
                                    className="btn-ghost flex-1 py-3 text-sm"
                                >
                                    Annulla
                                </button>
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all"
                                    style={{ background: 'rgba(255,0,51,0.25)', border: '1px solid rgba(255,0,51,0.5)' }}
                                >
                                    🗑️ Elimina tutto
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.button
                            key="delete-btn"
                            type="button"
                            onClick={() => setShowClearConfirm(true)}
                            className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
                            style={{ background: 'rgba(255,0,51,0.1)', border: '1px solid rgba(255,0,51,0.3)', color: 'rgba(255,80,80,0.9)' }}
                            whileTap={{ scale: 0.97 }}
                        >
                            🗑️ Svuota Database
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* App info */}
            <div className="text-center py-4">
                <p className="text-white/20 text-xs">PassionTrack v1.0 • Dati salvati localmente</p>
                <p className="text-white/10 text-xs mt-1">🔒 Privato • Nessun server • Solo tuo</p>
            </div>
        </div>
    )
}
