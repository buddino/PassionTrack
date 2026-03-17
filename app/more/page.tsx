'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import LuckyPartner from '@/components/LuckyPartner'

export default function MorePage() {
    const [activeSection, setActiveSection] = useState<'menu' | 'lucky'>('menu')

    return (
        <div className="px-4 pt-6 pb-24">
            <div className="mb-8">
                <div className="flex items-center gap-3">
                    <Image
                        src="/logo.png"
                        alt="PassionTrack Logo"
                        width={40}
                        height={40}
                        className="rounded-xl shadow-lg"
                        priority
                    />
                    <h1 className="text-3xl font-black tracking-tight text-white">
                        Altro
                    </h1>
                </div>
                <p className="text-white/40 text-sm mt-1">Funzionalità extra e svago</p>
            </div>

            <AnimatePresence mode="wait">
                {activeSection === 'menu' && (
                    <motion.div
                        key="menu"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                    >
                        <button
                            onClick={() => setActiveSection('lucky')}
                            className="glass-card w-full p-6 flex items-center justify-between group active:scale-95 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF0033] to-[#8B00FF] flex items-center justify-center text-2xl shadow-lg shadow-[#FF0033]/20">
                                    🔑
                                </div>
                                <div className="text-left">
                                    <h3 className="text-lg font-bold text-white">Chi chiavo stasera?</h3>
                                    <p className="text-white/40 text-xs">Fai scegliere al destino chi sarà la prossima vittima estraendo a sorte (o quasi) tra le precedenti fiamme!</p>
                                </div>
                            </div>
                            <span className="text-white/20 group-hover:text-white/40 transition-colors text-xl">→</span>
                        </button>

                        {/* Future menu items can go here */}
                        <div className="p-8 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-center">
                            <span className="text-3xl opacity-20 mb-2">✨</span>
                            <p className="text-white/20 text-xs font-medium uppercase tracking-widest">Altre novità in arrivo</p>
                        </div>
                    </motion.div>
                )}

                {activeSection === 'lucky' && (
                    <motion.div
                        key="lucky"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                    >
                        <button
                            onClick={() => setActiveSection('menu')}
                            className="flex items-center gap-2 text-white/40 text-sm font-bold mb-6 active:opacity-60 transition-opacity"
                        >
                            ← Torna indietro
                        </button>
                        <LuckyPartner />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
