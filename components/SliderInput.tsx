'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { scoreToColor } from '@/lib/scoring'

interface SliderInputProps {
    value: number
    onChange: (v: number) => void
    label: string
    emoji: string
    description: string
    index: number
}

export default function SliderInput({ value, onChange, label, emoji, description, index }: SliderInputProps) {
    const trackRef = useRef<HTMLInputElement>(null)
    const color = scoreToColor(value)

    useEffect(() => {
        if (!trackRef.current) return
        const pct = (value / 10) * 100
        trackRef.current.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, rgba(255,255,255,0.1) ${pct}%, rgba(255,255,255,0.1) 100%)`
    }, [value, color])

    return (
        <motion.div
            className="glass-card p-4 mb-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: index * 0.06 }}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{emoji}</span>
                    <div>
                        <p className="font-semibold text-sm text-white/90 leading-tight">{label}</p>
                        <p className="text-xs text-white/40 mt-0.5">{description}</p>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <motion.span
                        key={value}
                        initial={{ scale: 1.3, opacity: 0.6 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-xl font-bold min-w-[40px] text-right tabular-nums"
                        style={{ color }}
                    >
                        {value.toFixed(1)}
                    </motion.span>
                    <span className="text-[10px] text-white/30">/ 10</span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <span className="text-xs text-white/30 w-4 text-right">0</span>
                <input
                    ref={trackRef}
                    type="range"
                    min={0}
                    max={10}
                    step={0.5}
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    className="custom-slider flex-1"
                    style={{ cursor: 'pointer' }}
                />
                <span className="text-xs text-white/30 w-4">10</span>
            </div>
        </motion.div>
    )
}
