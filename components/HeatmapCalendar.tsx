'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { PerformanceEntry } from '@/lib/store'
import { scoreToHeatColor } from '@/lib/scoring'

interface HeatmapCalendarProps {
    entries: PerformanceEntry[]
}

const WEEKDAYS = ['Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa', 'Do']
const MONTHS = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']

export default function HeatmapCalendar({ entries }: HeatmapCalendarProps) {
    // Build a map of date string → average score
    const scoreMap = useMemo(() => {
        const map = new Map<string, number[]>()
        for (const e of entries) {
            const d = e.datetime.slice(0, 10)
            if (!map.has(d)) map.set(d, [])
            map.get(d)!.push(e.weightedAvg)
        }
        const avg = new Map<string, number>()
        map.forEach((scores, date) => {
            avg.set(date, scores.reduce((a, b) => a + b, 0) / scores.length)
        })
        return avg
    }, [entries])

    // Generate last 12 months of weeks
    const weeks = useMemo(() => {
        const today = new Date()
        const start = new Date(today)
        start.setMonth(start.getMonth() - 11)
        start.setDate(1)
        // Align to Monday
        const dow = (start.getDay() + 6) % 7
        start.setDate(start.getDate() - dow)

        const result: Array<Array<Date | null>> = []
        const cur = new Date(start)
        while (cur <= today) {
            const week: Array<Date | null> = []
            for (let d = 0; d < 7; d++) {
                const day = new Date(cur)
                week.push(day > today ? null : day)
                cur.setDate(cur.getDate() + 1)
            }
            result.push(week)
        }
        return result
    }, [])

    // Month labels: detect first week per month
    const monthLabels = useMemo(() => {
        const labels: Array<{ weekIndex: number; label: string }> = []
        let lastMonth = -1
        weeks.forEach((week, wi) => {
            const firstDay = week.find((d) => d !== null)
            if (firstDay && firstDay.getMonth() !== lastMonth) {
                lastMonth = firstDay.getMonth()
                labels.push({ weekIndex: wi, label: MONTHS[firstDay.getMonth()] })
            }
        })
        return labels
    }, [weeks])

    return (
        <div className="glass-card p-4 overflow-x-auto scrollbar-hide">
            <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-3">
                🗓️ Calendario Attività
            </h3>

            {/* Month labels */}
            <div className="relative" style={{ minWidth: weeks.length * 14 + 20 }}>
                <div className="flex mb-1 pl-5">
                    {monthLabels.map(({ weekIndex, label }) => (
                        <div
                            key={weekIndex}
                            className="absolute text-[10px] text-white/40 font-medium"
                            style={{ left: 20 + weekIndex * 14 }}
                        >
                            {label}
                        </div>
                    ))}
                </div>

                {/* Day labels + grid */}
                <div className="flex gap-0 mt-4">
                    <div className="flex flex-col gap-0.5 mr-1">
                        {WEEKDAYS.map((d, i) => (
                            <div key={i} className="text-[9px] text-white/30 h-[11px] flex items-center leading-none">
                                {i % 2 === 0 ? d : ''}
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-0.5">
                        {weeks.map((week, wi) => (
                            <div key={wi} className="flex flex-col gap-0.5">
                                {week.map((day, di) => {
                                    if (!day) return <div key={di} className="w-[11px] h-[11px]" />
                                    const dateStr = day.toISOString().slice(0, 10)
                                    const avg = scoreMap.get(dateStr) ?? null
                                    const color = scoreToHeatColor(avg)
                                    const isToday = dateStr === new Date().toISOString().slice(0, 10)
                                    return (
                                        <motion.div
                                            key={di}
                                            title={avg !== null ? `${dateStr}: ${avg.toFixed(1)}/10` : dateStr}
                                            className="w-[11px] h-[11px] rounded-sm cursor-default"
                                            style={{
                                                background: color,
                                                border: isToday ? '1px solid rgba(255,0,51,0.7)' : '1px solid transparent',
                                            }}
                                            whileHover={{ scale: 1.6, zIndex: 10 }}
                                            transition={{ duration: 0.1 }}
                                        />
                                    )
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-2 mt-3 justify-end">
                    <span className="text-[10px] text-white/30">Meno</span>
                    {[0, 2.5, 5, 7.5, 10].map((v) => (
                        <div key={v} className="w-[11px] h-[11px] rounded-sm" style={{ background: scoreToHeatColor(v) }} />
                    ))}
                    <span className="text-[10px] text-white/30">Di più</span>
                </div>
            </div>
        </div>
    )
}
