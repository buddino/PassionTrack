'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PerformanceEntry } from '@/lib/store'
import type { PerformanceType } from '@/lib/constants'
import { PERFORMANCE_TYPES_CONFIG } from '@/lib/constants'

interface MonthlyCalendarProps {
    entries: PerformanceEntry[]
    onDateSelect: (date: string | null) => void
    selectedDate: string | null
}

const MONTHS = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
]

const DAYS = ['Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa', 'Do']

export default function MonthlyCalendar({ entries, onDateSelect, selectedDate }: MonthlyCalendarProps) {
    const [viewDate, setViewDate] = useState(() => new Date())

    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()

    const daysInMonth = useMemo(() => {
        const date = new Date(year, month, 1)
        const days = []

        // Get starting day of week (0 = Sunday, so shift to 0 = Monday)
        let firstDay = date.getDay() - 1
        if (firstDay === -1) firstDay = 6

        // Padding for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(null)
        }

        // Actual days
        const lastDay = new Date(year, month + 1, 0).getDate()
        for (let i = 1; i <= lastDay; i++) {
            days.push(new Date(year, month, i))
        }

        return days
    }, [year, month])

    const dateTypes = useMemo(() => {
        const map = new Map<string, PerformanceType[]>()
        entries.forEach(e => {
            const d = e.datetime.slice(0, 10)
            const list = map.get(d) || []
            const t = e.type || 'scopata'
            if (!list.includes(t)) {
                list.push(t)
            }
            map.set(d, list)
        })
        return map
    }, [entries])

    const changeMonth = (offset: number) => {
        setViewDate(new Date(year, month + offset, 1))
    }

    const todayStr = new Date().toISOString().slice(0, 10)

    return (
        <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold">
                    {MONTHS[month]} <span className="opacity-40">{year}</span>
                </h3>
                <div className="flex gap-1">
                    <button
                        onClick={() => changeMonth(-1)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <ChevronLeft size={18} className="text-white/60" />
                    </button>
                    <button
                        onClick={() => changeMonth(1)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <ChevronRight size={18} className="text-white/60" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map(d => (
                    <div key={d} className="text-[10px] font-bold text-white/20 text-center uppercase py-1">
                        {d}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {daysInMonth.map((date, i) => {
                    if (!date) return <div key={`empty-${i}`} className="aspect-square" />

                    const dateStr = date.toISOString().slice(0, 10)
                    const types = dateTypes.get(dateStr) || []
                    const hasEntry = types.length > 0
                    const isSelected = selectedDate === dateStr
                    const isToday = dateStr === todayStr

                    const primaryColor = hasEntry ? PERFORMANCE_TYPES_CONFIG[types[0]].color : '#FF0033'
                    const bgStyle = isSelected
                        ? `${primaryColor}33`
                        : hasEntry
                            ? `${primaryColor}1A`
                            : 'rgba(255, 255, 255, 0.03)'
                    const borderStyle = isSelected
                        ? `1px solid ${primaryColor}`
                        : isToday
                            ? '1px solid rgba(255, 255, 255, 0.2)'
                            : '1px solid transparent'

                    return (
                        <button
                            key={dateStr}
                            onClick={() => onDateSelect(isSelected ? null : dateStr)}
                            className="relative aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all group"
                            style={{
                                background: bgStyle,
                                border: borderStyle,
                                color: isSelected || hasEntry ? 'white' : 'rgba(255, 255, 255, 0.4)'
                            }}
                        >
                            <span>{date.getDate()}</span>
                            {hasEntry && !isSelected && (
                                <div className="flex gap-0.5 mt-0.5 absolute bottom-1 left-1/2 -translate-x-1/2">
                                    {types.map(t => (
                                        <div key={t} className="w-1 rounded-full aspect-square" style={{ background: PERFORMANCE_TYPES_CONFIG[t].color }} />
                                    ))}
                                </div>
                            )}
                            {hasEntry && isSelected && (
                                <motion.div
                                    layoutId="active-bg"
                                    className="absolute inset-0 rounded-lg -z-10"
                                    style={{ background: `${primaryColor}40` }}
                                />
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
