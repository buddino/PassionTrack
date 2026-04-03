'use client'

import React from 'react'
import { PERFORMANCE_TYPES_CONFIG, STATEMENTS } from '@/lib/constants'
import type { PerformanceEntry } from '@/lib/store'
import Image from 'next/image'

interface ShareCardProps {
  entry: PerformanceEntry
  options: {
    showNick: boolean
    showLocation: boolean
    showDetail: boolean
  }
}

const ShareCard = React.forwardRef<HTMLDivElement, ShareCardProps>(({ entry, options }, ref) => {
  const config = PERFORMANCE_TYPES_CONFIG[entry.type || 'scopata']
  const date = new Date(entry.datetime)
  const formattedDate = date.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
  const formattedTime = entry.datetime.split('T')[1].slice(0, 5)

  const activeStatementIds = config.statements as unknown as number[]
  const activeStatements = activeStatementIds.map(id => {
    const stmt = STATEMENTS.find(s => s.id === id)!
    return {
      ...stmt,
      score: entry.scores[activeStatementIds.indexOf(id)] ?? 5
    }
  })

  return (
    <div 
      ref={ref}
      className="relative w-[1080px] h-[1080px] overflow-hidden flex flex-col items-center justify-center p-12 text-white font-sans"
      style={{ 
        background: '#0a0a0f',
        backgroundImage: `radial-gradient(circle at 0% 0%, ${config.color}20 0%, transparent 40%), radial-gradient(circle at 100% 100%, #8B00FF20 0%, transparent 40%)`
      }}
    >
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]" style={{ background: config.color }}></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]" style={{ background: '#8B00FF' }}></div>
      </div>

      {/* Header */}
      <div className="z-10 flex flex-col items-center mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-md">
             <span className="text-4xl">{config.emoji}</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter" style={{ color: config.color }}>PassionTrack</h1>
        </div>
        <p className="text-2xl font-medium text-white/40 uppercase tracking-[0.2em]">Performance Review</p>
      </div>

      {/* Score Section */}
      <div className="z-10 flex flex-col items-center justify-center mb-10">
        <div className="relative">
             {/* Glow Effect */}
             <div className="absolute inset-0 rounded-full blur-[60px] opacity-40 scale-150" style={{ background: config.color }}></div>
             
             <div className="relative w-72 h-72 rounded-full border-[10px] flex flex-col items-center justify-center animate-glow bg-white/5 backdrop-blur-lg shadow-2xl" style={{ borderColor: config.color }}>
                <span className="text-[120px] font-black leading-none mb-1" style={{ color: config.color }}>{entry.weightedAvg.toFixed(1)}</span>
                <span className="text-xl font-bold uppercase tracking-[0.3em] text-white/60">Score</span>
             </div>
        </div>
      </div>

      <div className="z-10 w-full flex flex-col items-center gap-4 mb-10">
        <div className="flex flex-col items-center gap-4">
            <h2 className="text-6xl font-black tracking-tight text-center">
                {options.showNick ? entry.partnerNick : 'Secret Partner'}
            </h2>
            {entry.location && options.showLocation && (
                <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-3xl font-bold uppercase tracking-widest text-white/60">
                    <span style={{ color: config.color }}>📍</span>
                    <span>{entry.location}</span>
                </div>
            )}
        </div>
        
        <div className="flex gap-6 text-xl text-white/40 font-medium">
            <span>{formattedDate}</span>
            <span className="opacity-40">•</span>
            <span>{formattedTime}</span>
        </div>
      </div>

      {/* Statement Bars (Optional) */}
      {options.showDetail && (
        <div className="z-10 w-full grid grid-cols-2 gap-x-12 gap-y-6 px-10">
          {activeStatements.map((s, i) => {
            const pct = (s.score / 10) * 100
            return (
              <div key={s.id} className="flex flex-col gap-2">
                <div className="flex justify-between items-center px-1">
                    <span className="text-lg font-bold text-white/60">{s.emoji} {s.label}</span>
                    <span className="text-xl font-bold" style={{ color: config.color }}>{s.score.toFixed(1)}</span>
                </div>
                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div 
                        className="h-full rounded-full shadow-[0_0_15px_rgba(255,255,255,0.2)]" 
                        style={{ 
                            width: `${pct}%`, 
                            background: `linear-gradient(90deg, ${config.color}, #8B00FF)` 
                        }}
                    ></div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Footer / Branding */}
      <div className="absolute bottom-10 z-10 text-white/20 text-sm font-bold tracking-widest uppercase">
          Generated via PassionTrack App
      </div>
    </div>
  )
})

ShareCard.displayName = 'ShareCard'
export default ShareCard
