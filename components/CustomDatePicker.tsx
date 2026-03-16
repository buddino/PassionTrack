'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CustomDatePickerProps {
    date: string // YYYY-MM-DD
    onChange: (date: string) => void
}

const MONTHS = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']
const WEEKDAYS = ['L', 'M', 'M', 'G', 'V', 'S', 'D']

export default function CustomDatePicker({ date, onChange }: CustomDatePickerProps) {
    const [open, setOpen] = useState(false)
    const [currentMonth, setCurrentMonth] = useState(() => {
        const d = new Date(date)
        return new Date(d.getFullYear(), d.getMonth(), 1)
    })

    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    const selectedDate = new Date(date)

    const handlePrevMonth = (e: React.MouseEvent) => {
        e.stopPropagation()
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
    }

    const handleNextMonth = (e: React.MouseEvent) => {
        e.stopPropagation()
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
    }

    const handleSelectDate = (d: number) => {
        const newD = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d)
        // Adjust for local timezone to get correct YYYY-MM-DD
        const offset = newD.getTimezoneOffset()
        newD.setMinutes(newD.getMinutes() - offset)
        onChange(newD.toISOString().slice(0, 10))
        setOpen(false)
    }

    // Generate calendar grid
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
    // Adjust so Monday is 0, Sunday is 6
    const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

    const days = []
    for (let i = 0; i < startDay; i++) {
        days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i)
    }

    // Formatting date to show in the button "14 Giugno 2024"
    const displayDate = selectedDate.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })

    return (
        <div className="relative z-30" ref={containerRef}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full px-4 py-3 rounded-xl text-left font-medium text-base transition-all flex justify-between items-center"
                style={{
                    background: open ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${open ? 'rgba(255,0,51,0.5)' : 'rgba(255,255,255,0.12)'}`,
                    boxShadow: open ? '0 0 0 3px rgba(255,0,51,0.1)' : 'none',
                    color: 'white'
                }}
            >
                <span>📅 {displayDate}</span>
                <span className="text-white/40 text-xs">Cambia</span>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 w-full mt-2 rounded-2xl overflow-hidden glass-card p-4"
                        style={{
                            background: '#0a0a0f',
                            backdropFilter: 'blur(30px)',
                            WebkitBackdropFilter: 'blur(30px)',
                            border: '1px solid rgba(255,0,51,0.4)',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.95), 0 0 20px rgba(255,0,51,0.15)'
                        }}
                    >
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between mb-4">
                            <button type="button" onClick={handlePrevMonth} className="p-2 text-white/60 hover:text-white transition-colors bg-white/5 rounded-lg">
                                ←
                            </button>
                            <span className="font-bold text-sm text-white uppercase tracking-wider">
                                {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                            </span>
                            <button type="button" onClick={handleNextMonth} className="p-2 text-white/60 hover:text-white transition-colors bg-white/5 rounded-lg">
                                →
                            </button>
                        </div>

                        {/* Weekdays */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {WEEKDAYS.map((day, i) => (
                                <div key={i} className="text-center text-[10px] font-bold text-white/30">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Days Grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {days.map((day, i) => {
                                if (day === null) return <div key={`empty-${i}`} className="h-8" />

                                const isSelected =
                                    selectedDate.getDate() === day &&
                                    selectedDate.getMonth() === currentMonth.getMonth() &&
                                    selectedDate.getFullYear() === currentMonth.getFullYear()

                                const isToday =
                                    new Date().getDate() === day &&
                                    new Date().getMonth() === currentMonth.getMonth() &&
                                    new Date().getFullYear() === currentMonth.getFullYear()

                                const isFuture = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day, 23, 59, 59).getTime() > new Date().getTime()

                                return (
                                    <button
                                        key={`day-${day}`}
                                        type="button"
                                        disabled={isFuture}
                                        onClick={() => handleSelectDate(day)}
                                        className="h-9 relative flex items-center justify-center rounded-lg text-sm font-medium transition-all"
                                        style={{
                                            opacity: isFuture ? 0.3 : 1,
                                            cursor: isFuture ? 'not-allowed' : 'pointer',
                                            color: isSelected ? 'white' : 'rgba(255,255,255,0.7)',
                                            background: isSelected
                                                ? 'linear-gradient(135deg, #FF0033, #8B00FF)'
                                                : isToday ? 'rgba(255,255,255,0.1)' : 'transparent',
                                            border: isSelected ? '1px solid rgba(255,0,51,0.4)' : '1px solid transparent'
                                        }}
                                    >
                                        {day}
                                        {isToday && !isSelected && (
                                            <div className="absolute bottom-1 w-1 h-1 rounded-full bg-white/40" />
                                        )}
                                    </button>
                                )
                            })}
                        </div>

                        <div className="mt-4 flex gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    const testDate = new Date();
                                    const offset = testDate.getTimezoneOffset();
                                    testDate.setMinutes(testDate.getMinutes() - offset);
                                    onChange(testDate.toISOString().slice(0, 10));
                                    setOpen(false);
                                }}
                                className="w-full py-2 rounded-lg text-xs font-semibold"
                                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)' }}
                            >
                                Torna ad Oggi
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
