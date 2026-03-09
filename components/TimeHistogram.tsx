'use client'

import { useMemo } from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts'

interface TimeHistogramProps {
    data: { hour: string; count: number }[]
}

export default function TimeHistogram({ data }: TimeHistogramProps) {
    const maxCount = useMemo(() => Math.max(...data.map((d) => d.count), 1), [data])

    return (
        <div className="glass-card p-4">
            <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-4">
                ⏰ Distribuzione Oraria
            </h3>

            <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                            dataKey="hour"
                            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                            tickLine={false}
                            interval={3}
                        />
                        <YAxis
                            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                            allowDecimals={false}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            contentStyle={{
                                background: 'rgba(15,15,25,0.95)',
                                border: '1px solid rgba(255,0,51,0.3)',
                                borderRadius: 12,
                                fontSize: 12,
                                color: 'white',
                            }}
                            labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}
                            formatter={(value: any) => [`${value} sessioni`, 'Rapporti']}
                            labelFormatter={(label) => `${label}:00`}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.count === maxCount && entry.count > 0 ? '#FF0033' : 'rgba(255, 0, 51, 0.4)'}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-white/20 text-center mt-2 italic">
                Visualizza i momenti della giornata in cui sei più attivo
            </p>
        </div>
    )
}
