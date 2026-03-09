'use client'

import { motion } from 'framer-motion'
import { MOOD_EMOJIS } from '@/lib/constants'

interface MoodPickerProps {
    value: number
    onChange: (v: number) => void
}

export default function MoodPicker({ value, onChange }: MoodPickerProps) {
    return (
        <div className="flex items-center justify-center gap-2">
            {MOOD_EMOJIS.map((emoji, i) => {
                const isActive = i === value
                return (
                    <motion.button
                        key={i}
                        type="button"
                        onClick={() => onChange(i)}
                        whileTap={{ scale: 0.85 }}
                        whileHover={{ scale: 1.2 }}
                        animate={isActive ? { scale: 1.25, y: -4 } : { scale: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        className="relative text-3xl outline-none select-none"
                        style={{
                            filter: isActive
                                ? 'drop-shadow(0 0 8px rgba(255,0,51,0.8))'
                                : 'grayscale(60%) opacity(0.5)',
                            transition: 'filter 0.2s',
                        }}
                    >
                        {emoji}
                        {isActive && (
                            <motion.div
                                layoutId="mood-ring"
                                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                                style={{ background: '#FF0033', boxShadow: '0 0 6px #FF0033' }}
                            />
                        )}
                    </motion.button>
                )
            })}
        </div>
    )
}
