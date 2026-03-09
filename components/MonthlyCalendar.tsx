'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PerformanceEntry } from '@/lib/store'

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

    const entryDates = useMemo(() => {
        const set = new Set<string>()
        entries.forEach(e => set.add(e.datetime.slice(0, 10)))
        return set
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
                    const hasEntry = entryDates.has(dateStr)
                    const isSelected = selectedDate === dateStr
                    const isToday = dateStr === todayStr

                    return (
                        <button
                            key={dateStr}
                            onClick={() => onDateSelect(isSelected ? null : dateStr)}
                            className="relative aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all group"
                            style={{
                                background: isSelected
                                    ? 'rgba(255, 0, 51, 0.2)'
                                    : hasEntry
                                        ? 'rgba(255, 0, 51, 0.1)'
                                        : 'rgba(255, 255, 255, 0.03)',
                                border: isSelected
                                    ? '1px solid #FF0033'
                                    : isToday
                                        ? '1px solid rgba(255, 255, 255, 0.2)'
                                        : '1px solid transparent',
                                color: isSelected || hasEntry ? 'white' : 'rgba(255, 255, 255, 0.4)'
                            }}
                        >
                            {date.getDate()}
                            {hasEntry && !isSelected && (
                                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#FF0033]" />
                            )}
                            {hasEntry && isSelected && (
                                <motion.div
                                    layoutId="active-bg"
                                    className="absolute inset-0 rounded-lg bg-[#FF0033]/20 -z-10"
                                />
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
