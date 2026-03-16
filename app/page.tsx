'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import SliderInput from '@/components/SliderInput'
import MoodPicker from '@/components/MoodPicker'
import PartnerDropdown from '@/components/PartnerDropdown'
import CustomDatePicker from '@/components/CustomDatePicker'
import HourPicker from '@/components/HourPicker'
import PerformanceTypePicker from '@/components/PerformanceTypePicker'
import LocationDropdown from '@/components/LocationDropdown'
import { saveEntry, getSettings } from '@/lib/store'
import { weightedAverage } from '@/lib/scoring'
import { STATEMENTS, PERFORMANCE_TYPES_CONFIG } from '@/lib/constants'
import type { Gender, PerformanceType } from '@/lib/constants'

const Confetti = dynamic(() => import('react-confetti'), { ssr: false })

const STEPS = ['type', 'details', 'sliders', 'done'] as const
type Step = typeof STEPS[number]

function useWindowSize() {
  const [size, setSize] = useState({ width: 400, height: 800 })
  useEffect(() => {
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight })
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return size
}

export default function HomePage() {
  const [step, setStep] = useState<Step>('type')
  const [perfType, setPerfType] = useState<PerformanceType | null>(null)

  const [partnerNick, setPartnerNick] = useState('')
  const [partnerGender, setPartnerGender] = useState<Gender>('M')
  const [location, setLocation] = useState('')

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [hour, setHour] = useState(() => new Date().getHours())

  const [mood, setMood] = useState(3)
  const [scores, setScores] = useState<number[]>([])

  const [weights, setWeights] = useState<number[]>([])
  const [showConfetti, setShowConfetti] = useState(false)
  const [savedScore, setSavedScore] = useState<number | null>(null)
  const { width, height } = useWindowSize()

  useEffect(() => {
    const s = getSettings()
    setWeights(s.weights)
  }, [])

  // When performance type changes, re-initialize scores
  useEffect(() => {
    if (perfType) {
      const stCount = PERFORMANCE_TYPES_CONFIG[perfType].statements.length
      setScores(Array(stCount).fill(5))
    }
  }, [perfType])

  // Get current active statements
  const activeStatementIds = perfType ? PERFORMANCE_TYPES_CONFIG[perfType].statements : []
  const activeStatements = activeStatementIds.map(id => STATEMENTS.find(s => s.id === id)!)

  // Weights should technically map by statement ID. If weights from settings are a flat array (index = id-1):
  const activeWeights = activeStatementIds.map(id => weights[id - 1] ?? 1.0)

  const avg = weightedAverage(scores, activeWeights)

  const handleScore = useCallback((i: number, v: number) => {
    setScores((prev) => {
      const next = [...prev]
      next[i] = v
      return next
    })
  }, [])

  const handleSave = () => {
    if (!perfType) { setStep('type'); return }
    if (!partnerNick.trim()) { setStep('details'); return }

    const uuid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
    })

    const entry = {
      id: uuid(),
      type: perfType,
      location: location.trim() || undefined,
      partnerNick: partnerNick.trim(),
      partnerGender,
      datetime: `${date}T${hour.toString().padStart(2, '0')}:00:00`,
      mood,
      scores,
      weightedAvg: avg,
    }
    saveEntry(entry)
    setSavedScore(avg)
    setShowConfetti(true)
    setStep('done')
    setTimeout(() => setShowConfetti(false), 4500)
  }

  const handleReset = () => {
    setStep('type')
    setPerfType(null)
    setPartnerNick('')
    setPartnerGender('M')
    setLocation('')
    setDate(new Date().toISOString().slice(0, 10))
    setHour(new Date().getHours())
    setMood(3)
    setScores([])
    setSavedScore(null)
    setShowConfetti(false)
  }

  const getStatementLabel = (s: typeof STATEMENTS[0]) => {
    if (s.id === 7 && partnerGender !== 'M' && s.labelAlt) {
      return s.labelAlt
    }
    return s.label
  }

  const stepIndex = STEPS.indexOf(step)
  const isToy = perfType === 'fai-da-te'

  return (
    <>
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={280}
          colors={['#FF0033', '#8B00FF', '#FF6633', '#FFCC00', '#ffffff']}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 100, pointerEvents: 'none' }}
        />
      )}

      <div className="px-4 pt-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-black tracking-tight" style={{ color: perfType ? PERFORMANCE_TYPES_CONFIG[perfType].color : '#FF0033' }}>
            {perfType ? PERFORMANCE_TYPES_CONFIG[perfType].emoji + ' ' + PERFORMANCE_TYPES_CONFIG[perfType].label : '🔥 PassionTrack'}
          </h1>
          <p className="text-white/40 text-sm mt-1">Nuovo "allenamento"</p>
        </div>

        {/* Progress bar (hidden on done step) */}
        {step !== 'done' && (
          <div className="flex gap-1.5 mb-6">
            {(['type', 'details', 'sliders'] as Step[]).map((s, i) => (
              <div key={s} className="h-1 flex-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${perfType ? PERFORMANCE_TYPES_CONFIG[perfType].color : '#FF0033'}, #8B00FF)` }}
                  initial={{ width: 0 }}
                  animate={{ width: i <= stepIndex ? '100%' : '0%' }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1: Type */}
          {step === 'type' && (
            <motion.div
              key="type"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.35 }}
            >
              <div className="glass-card p-5 mb-4 relative">
                <h2 className="text-lg font-bold text-white mb-4">🎯 Tipo di Performance</h2>
                <PerformanceTypePicker
                  value={perfType}
                  onChange={setPerfType}
                />
              </div>
              <motion.button
                type="button"
                onClick={() => {
                  if (!perfType) return
                  setStep('details')
                }}
                className="btn-neon w-full py-4 text-base"
                whileTap={{ scale: 0.97 }}
                style={{ opacity: perfType ? 1 : 0.4 }}
              >
                Avanti →
              </motion.button>
            </motion.div>
          )}

          {/* STEP 2: Details */}
          {step === 'details' && perfType && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.35 }}
            >
              <div className="glass-card p-5 mb-4 relative z-30">
                <h2 className="text-lg font-bold text-white mb-4">📝 Dettagli</h2>

                <PartnerDropdown
                  type={perfType}
                  nick={partnerNick}
                  gender={partnerGender}
                  onNickChange={setPartnerNick}
                  onGenderChange={setPartnerGender}
                />

                <div className="mt-5 space-y-4">
                  <LocationDropdown
                    location={location}
                    onChange={setLocation}
                  />

                  {/* Data */}
                  <div>
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-2 block">
                      📅 Data
                    </label>
                    <CustomDatePicker
                      date={date}
                      onChange={setDate}
                    />
                  </div>
                  {/* Ora */}
                  <div>
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-2 block">
                      ⏰ Ora
                    </label>
                    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden glass-card">
                      <HourPicker hour={hour} onChange={setHour} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep('type')} className="btn-ghost flex-1 py-4">
                  ← Indietro
                </button>
                <motion.button
                  type="button"
                  onClick={() => {
                    if (!partnerNick.trim()) return
                    setStep('sliders')
                  }}
                  className="btn-neon flex-[2] py-4 text-base"
                  whileTap={{ scale: 0.97 }}
                  style={{ opacity: partnerNick.trim() ? 1 : 0.4 }}
                >
                  Avanti →
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Sliders & Mood */}
          {step === 'sliders' && perfType && (
            <motion.div
              key="sliders"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.35 }}
            >

              <div className="glass-card p-5 mb-4">
                <h2 className="text-lg font-bold text-white mb-2">🔥 Eccitazione</h2>
                <p className="text-white/40 text-sm mb-6">Come ti sentivi prima?</p>
                <MoodPicker value={mood} onChange={setMood} />
                <p className="text-center mt-4 text-white/50 text-sm font-medium">
                  {['Spento', 'Tiepido', 'Coinvolto', 'Caldo', 'Infuocato', 'BOLLENTE 🌋'][mood]}
                </p>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-white">📋 Voti</h2>
                  {/* Live score preview */}
                  <div className="glass-card px-4 py-2 flex items-center gap-2">
                    <span className="text-white/50 text-xs">Media</span>
                    <motion.span
                      key={avg.toFixed(1)}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className="text-xl font-black"
                      style={{ color: PERFORMANCE_TYPES_CONFIG[perfType].color }}
                    >
                      {avg.toFixed(1)}
                    </motion.span>
                  </div>
                </div>
                {activeStatements.map((s, i) => (
                  <SliderInput
                    key={s.id}
                    value={scores[i]}
                    onChange={(v) => handleScore(i, v)}
                    label={getStatementLabel(s)}
                    emoji={s.emoji}
                    description={s.description}
                    index={i}
                  />
                ))}
              </div>

              <div className="flex gap-3 mb-4">
                <button type="button" onClick={() => setStep('details')} className="btn-ghost flex-1 py-4">
                  ← Indietro
                </button>
                <motion.button
                  type="button"
                  onClick={handleSave}
                  className="btn-neon flex-[2] py-4 text-base font-bold"
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.01 }}
                >
                  💾 Salva Performance
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Done */}
          {step === 'done' && perfType && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="text-8xl mb-6"
              >
                {savedScore !== null && savedScore >= 8 ? '🌋' : savedScore !== null && savedScore >= 5 ? '🔥' : '😏'}
              </motion.div>
              <h2 className="text-2xl font-black text-white mb-2">Performance Salvata!</h2>
              <p className="text-white/50 mb-6">{isToy ? 'con toy ' : 'con '}<span className="text-white font-semibold">{partnerNick}</span></p>

              {location && (
                <p className="text-white/40 text-sm mb-6">📍 {location}</p>
              )}

              <div className="glass-card p-6 mb-8 inline-block mx-auto">
                <p className="text-white/50 text-sm mb-1">Voto finale</p>
                <p className="text-5xl font-black" style={{ color: PERFORMANCE_TYPES_CONFIG[perfType].color }}>
                  {savedScore?.toFixed(1)}
                </p>
                <p className="text-white/30 text-sm">/10</p>
              </div>
              <div className="flex flex-col gap-3 px-4">
                <motion.button
                  type="button"
                  onClick={handleReset}
                  className="btn-neon w-full py-4 text-base font-bold"
                  whileTap={{ scale: 0.97 }}
                >
                  ➕ Nuova Sessione
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
