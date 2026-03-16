'use client'

import { motion } from 'framer-motion'
import { PERFORMANCE_TYPES_CONFIG, PerformanceType } from '@/lib/constants'

interface PerformanceTypePickerProps {
    value: PerformanceType | null
    onChange: (type: PerformanceType) => void
}

export default function PerformanceTypePicker({ value, onChange }: PerformanceTypePickerProps) {
    const types = Object.entries(PERFORMANCE_TYPES_CONFIG) as [PerformanceType, typeof PERFORMANCE_TYPES_CONFIG[PerformanceType]][]

    return (
        <div className="grid grid-cols-1 gap-3">
            {types.map(([type, config]) => {
                const isActive = value === type
                return (
                    <motion.button
                        key={type}
                        type="button"
                        onClick={() => onChange(type)}
                        whileTap={{ scale: 0.98 }}
                        className="relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-300 flex items-center gap-4"
                        style={{
                            background: isActive ? `linear-gradient(135deg, ${config.color}40, rgba(20,20,30,0.8))` : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${isActive ? config.color : 'rgba(255,255,255,0.1)'}`,
                            boxShadow: isActive ? `0 8px 30px ${config.color}30` : 'none',
                        }}
                    >
                        <div className="text-4xl">{config.emoji}</div>
                        <div>
                            <div className="text-lg font-bold text-white mb-1">{config.label}</div>
                            <div className="text-xs text-white/50">{config.statements.length} parametri di valutazione</div>
                        </div>
                        {isActive && (
                            <motion.div
                                layoutId="active-type"
                                className="absolute right-4 w-3 h-3 rounded-full"
                                style={{ background: config.color, boxShadow: `0 0 10px ${config.color}` }}
                            />
                        )}
                    </motion.button>
                )
            })}
        </div>
    )
}
