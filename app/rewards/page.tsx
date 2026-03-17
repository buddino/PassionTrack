'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getUnlockedChallenges } from '@/lib/store'
import { CHALLENGES, type Challenge } from '@/lib/challenges'
import Image from 'next/image'

export default function RewardsPage() {
    const [unlocked, setUnlocked] = useState<Set<string>>(new Set())
    const [selected, setSelected] = useState<Challenge | null>(null)

    useEffect(() => {
        setUnlocked(new Set(getUnlockedChallenges()))
    }, [])

    const progress = Math.round((unlocked.size / CHALLENGES.length) * 100)

    return (
        <div className="px-4 pt-6 space-y-6 pb-24">
            <div className="mb-2 flex items-center gap-3">
                <Image
                    src="/logo.png"
                    alt="PassionTrack Logo"
                    width={32}
                    height={32}
                    className="rounded-lg shadow-md"
                />
                <h1 className="text-3xl font-black text-[#FFCC00]">Rewards</h1>
            </div>
            <p className="text-white/50 text-sm mt-1">Sblocca nuove sfide durante le tue avventure!</p>

            <div className="glass-card p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border-4 border-[#FFCC00]/30 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                    <div className="absolute inset-x-0 bottom-0 bg-[#FFD700]/30 transition-all duration-1000" style={{ height: `${progress}%` }} />
                    <span className="text-xl font-bold text-white relative z-10">{progress}%</span>
                </div>
                <div>
                    <h3 className="font-bold text-lg text-white">Progresso Sfide</h3>
                    <p className="text-sm text-white/50">{unlocked.size} di {CHALLENGES.length} sbloccati</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {CHALLENGES.map((challenge, idx) => {
                    const isUnlocked = unlocked.has(challenge.id)
                    return (
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={challenge.id}
                            onClick={() => setSelected(challenge)}
                            className="relative flex flex-col items-center p-4 rounded-2xl border transition-all text-center glass-card"
                            style={{
                                borderColor: isUnlocked ? 'rgba(255, 204, 0, 0.4)' : 'rgba(255,255,255,0.05)',
                                background: isUnlocked ? 'rgba(255, 215, 0, 0.03)' : 'rgba(20,20,30,0.5)',
                            }}
                        >
                            <div className={`w-16 h-16 rounded-full mb-3 flex items-center justify-center text-3xl shadow-lg relative ${isUnlocked ? 'bg-gradient-to-br from-[#FFD700] to-[#FF8C00]' : 'bg-gray-800'}`}>
                                {isUnlocked ? (
                                    <Image src={`/badges/${challenge.id}.webp`} alt={challenge.title} fill className="object-cover rounded-full" unoptimized onError={(e) => { e.currentTarget.style.display = 'none' }} />
                                ) : (
                                    <span className="text-white/20">🔒</span>
                                )}
                            </div>
                            <h4 className="font-bold text-[13px] leading-tight text-white mb-1">{challenge.title}</h4>
                            <p className="text-[10px] text-white/50 line-clamp-2">{isUnlocked ? 'Sbloccato!' : 'Tocca per scoprire'}</p>

                            {isUnlocked && (
                                <div className="absolute top-2 right-2 text-xs">✨</div>
                            )}
                        </motion.button>
                    )
                })}
            </div>

            <AnimatePresence>
                {selected && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelected(null)}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
                        style={{ paddingTop: 'calc(var(--safe-area-top) + 1.5rem)', paddingBottom: 'calc(var(--safe-area-bottom) + 1.5rem)' }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-[#0a0a0f]/95 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] w-full max-w-sm text-center relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]"
                        >
                            <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#FFCC00]/15 to-transparent pointer-events-none" />

                            <div className={`w-24 h-24 mx-auto rounded-full mb-4 flex items-center justify-center text-5xl shadow-2xl relative ${unlocked.has(selected.id) ? 'bg-gradient-to-br from-[#FFD700] to-[#FF8C00] shadow-[#FFD700]/30' : 'bg-gray-800'}`}>
                                {unlocked.has(selected.id) ? (
                                    <Image src={`/badges/${selected.id}.webp`} alt={selected.title} fill className="object-cover rounded-full" unoptimized onError={(e) => { e.currentTarget.style.display = 'none' }} />
                                ) : (
                                    <span className="text-white/20">🔒</span>
                                )}
                            </div>

                            <h2 className="text-2xl font-black text-white mb-2">{selected.title}</h2>
                            <p className="text-white/70 mb-6">{selected.description}</p>

                            <button
                                onClick={() => setSelected(null)}
                                className="w-full py-3 rounded-xl font-bold bg-white/10 text-white hover:bg-white/20 transition-colors"
                            >
                                Chiudi
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
