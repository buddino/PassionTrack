'use client'

import { useMemo, useState } from 'react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts'
import type { PerformanceEntry } from '@/lib/store'
import { STATEMENTS, PERFORMANCE_TYPES_CONFIG } from '@/lib/constants'

type Filter = '1M' | '3M' | '6M' | '1Y' | 'All'
const FILTERS: Filter[] = ['1M', '3M', '6M', '1Y', 'All']

const STATEMENT_COLORS = [
    '#FF0033', '#FF6633', '#FF9900', '#FFCC00', '#99FF33',
    '#33FFCC', '#33CCFF', '#3366FF', '#9933FF', '#FF33CC',
    '#FFFFFF', '#AAAAAA', '#FF00FF', '#00FFFF', '#FF9999'
]

interface TrendChartProps {
    entries: PerformanceEntry[]
    partnerFilter?: string
}

function getFilteredEntries(entries: PerformanceEntry[], filter: Filter): PerformanceEntry[] {
    const now = new Date()
    const months: Record<Filter, number> = { '1M': 1, '3M': 3, '6M': 6, '1Y': 12, All: 9999 }
    const cutoff = new Date(now)
    cutoff.setMonth(cutoff.getMonth() - months[filter])
    return entries.filter((e) => new Date(e.datetime) >= cutoff)
}

export default function TrendChart({ entries, partnerFilter }: TrendChartProps) {
    const [filter, setFilter] = useState<Filter>('3M')
    const [showStatements, setShowStatements] = useState(false)
    const [hiddenLines, setHiddenLines] = useState<Set<string>>(new Set())

    const toggleLine = (dataKey: string) => {
        setHiddenLines((prev) => {
            const next = new Set(prev)
            if (next.has(dataKey)) next.delete(dataKey)
            else next.add(dataKey)
            return next
        })
    }

    const activeType = useMemo(() => {
        if (entries.length === 0) return null
        const t = entries[0].type || 'scopata'
        for (const e of entries) {
            if ((e.type || 'scopata') !== t) return null
        }
        return t
    }, [entries])

    const activeStatements = useMemo(() => {
        if (!activeType) return []
        const ids = PERFORMANCE_TYPES_CONFIG[activeType].statements
        return ids.map(id => STATEMENTS.find(s => s.id === id)!)
    }, [activeType])

    const data = useMemo(() => {
        let filtered = getFilteredEntries(entries, filter)
        if (partnerFilter) filtered = filtered.filter((e) => e.partnerNick === partnerFilter)
        return filtered
            .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
            .map((e) => {
                const row: Record<string, string | number> = {
                    date: new Date(e.datetime).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }),
                    Media: e.weightedAvg,
                    Mood: e.mood * 2,
                }
                if (showStatements && activeType && e.scores) {
                    activeStatements.forEach((s, idx) => {
                        row[`S${s.id}`] = e.scores[idx] ?? 0
                    })
                }
                return row
            })
    }, [entries, filter, partnerFilter, showStatements, activeType, activeStatements])

    const primaryColor = activeType ? PERFORMANCE_TYPES_CONFIG[activeType].color : '#FF0033'

    return (
        <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest">📈 Trend</h3>
                <div className="flex items-center gap-2">
                    {activeType && (
                        <button
                            type="button"
                            onClick={() => setShowStatements((v) => !v)}
                            className="text-xs px-3 py-1.5 rounded-lg transition-all"
                            style={{
                                background: showStatements ? `${primaryColor}33` : 'rgba(255,255,255,0.05)',
                                border: `1px solid ${showStatements ? `${primaryColor}66` : 'rgba(255,255,255,0.1)'}`,
                                color: showStatements ? primaryColor : 'rgba(255,255,255,0.5)',
                            }}
                        >
                            {showStatements ? '📊 Dettaglio' : '📊 Dettaglio'}
                        </button>
                    )}
                    <div className="flex gap-1">
                        {FILTERS.map((f) => (
                            <button
                                key={f}
                                type="button"
                                onClick={() => setFilter(f)}
                                className="text-xs px-2.5 py-1.5 rounded-lg transition-all"
                                style={{
                                    background: filter === f ? `${primaryColor}33` : 'rgba(255,255,255,0.05)',
                                    border: `1px solid ${filter === f ? `${primaryColor}66` : 'rgba(255,255,255,0.08)'}`,
                                    color: filter === f ? primaryColor : 'rgba(255,255,255,0.4)',
                                    fontWeight: filter === f ? 600 : 400,
                                }}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {data.length < 2 ? (
                <div className="text-center py-12 text-white/30 text-sm">
                    Aggiungi almeno 2 sessioni per visualizzare il trend 📉
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={showStatements && activeType ? 400 : 250}>
                    <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                            dataKey="date"
                            tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                            tickLine={false}
                        />
                        <YAxis
                            domain={[0, 10]}
                            tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                            ticks={[0, 2, 4, 6, 8, 10]}
                        />
                        <Tooltip
                            contentStyle={{
                                background: 'rgba(15,15,25,0.95)',
                                border: `1px solid ${primaryColor}40`,
                                borderRadius: 12,
                                color: 'white',
                                fontSize: 12,
                            }}
                            labelStyle={{ color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}
                        />
                        <Legend
                            layout={showStatements && activeType ? 'vertical' : 'horizontal'}
                            verticalAlign="bottom"
                            align="center"
                            wrapperStyle={{
                                fontSize: 10,
                                color: 'rgba(255,255,255,0.5)',
                                paddingTop: 20,
                            }}
                            onClick={(e) => {
                                if (typeof e.dataKey === 'string') {
                                    toggleLine(e.dataKey)
                                }
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="Media"
                            stroke={primaryColor}
                            strokeWidth={2.5}
                            hide={hiddenLines.has('Media')}
                            dot={{ fill: primaryColor, r: 3, strokeWidth: 0 }}
                            activeDot={{ r: 5, fill: primaryColor }}
                            name="Media Performance"
                        />
                        <Line
                            type="monotone"
                            dataKey="Mood"
                            stroke="#8B00FF"
                            strokeWidth={2}
                            hide={hiddenLines.has('Mood')}
                            strokeDasharray="5 5"
                            dot={{ fill: '#8B00FF', r: 2, strokeWidth: 0 }}
                            activeDot={{ r: 4, fill: '#8B00FF' }}
                            name="Mood / Eccitazione"
                        />
                        {showStatements && activeType &&
                            activeStatements.map((s, i) => (
                                <Line
                                    key={s.id}
                                    type="monotone"
                                    dataKey={`S${s.id}`}
                                    stroke={STATEMENT_COLORS[i % STATEMENT_COLORS.length]}
                                    strokeWidth={1.5}
                                    hide={hiddenLines.has(`S${s.id}`)}
                                    dot={false}
                                    strokeDasharray="4 2"
                                    name={s.label}
                                />
                            ))}
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    )
}
