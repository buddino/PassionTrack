'use client'

import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

interface HourPickerProps {
    hour: number
    onChange: (hour: number) => void
}

export default function HourPicker({ hour, onChange }: HourPickerProps) {
    const scrollRef = useRef<HTMLDivElement>(null)

    // Center the active hour on mount and when hour changes externally
    useEffect(() => {
        if (scrollRef.current) {
            const activeEl = scrollRef.current.children[hour] as HTMLElement | undefined
            if (activeEl) {
                const scrollLeft = activeEl.offsetLeft - scrollRef.current.clientWidth / 2 + activeEl.clientWidth / 2
                scrollRef.current.scrollTo({
                    left: scrollLeft,
                    behavior: 'smooth'
                })
            }
        }
    }, [hour])

    const hours = Array.from({ length: 24 }, (_, i) => i)

    return (
        <div
            ref={scrollRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide py-2 px-1 snap-x snap-mandatory"
            style={{ WebkitOverflowScrolling: 'touch' }}
        >
            {hours.map((h) => {
                const isActive = h === hour
                return (
                    <button
                        key={h}
                        type="button"
                        onClick={() => onChange(h)}
                        className="snap-center shrink-0 h-12 w-16 rounded-xl flex items-center justify-center font-bold text-sm transition-all"
                        style={{
                            background: isActive ? 'linear-gradient(135deg, #FF0033, #8B00FF)' : 'rgba(255,255,255,0.05)',
                            color: isActive ? 'white' : 'rgba(255,255,255,0.4)',
                            border: isActive ? '1px solid rgba(255,0,51,0.5)' : '1px solid rgba(255,255,255,0.1)',
                            boxShadow: isActive ? '0 4px 15px rgba(255,0,51,0.3)' : 'none',
                        }}
                    >
                        {h.toString().padStart(2, '0')}:00
                    </button>
                )
            })}
        </div>
    )
}
