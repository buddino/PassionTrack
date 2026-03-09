'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import SliderInput from '@/components/SliderInput'
import MoodPicker from '@/components/MoodPicker'
import PartnerDropdown from '@/components/PartnerDropdown'
import CustomDatePicker from '@/components/CustomDatePicker'
import HourPicker from '@/components/HourPicker'
import { saveEntry, getSettings } from '@/lib/store'
import { weightedAverage } from '@/lib/scoring'
import { STATEMENTS, DEFAULT_WEIGHTS } from '@/lib/constants'
import type { Gender } from '@/lib/constants'

const Confetti = dynamic(() => import('react-confetti'), { ssr: false })

const STEPS = ['partner', 'mood', 'sliders', 'done'] as const
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
  const [step, setStep] = useState<Step>('partner')
  const [partnerNick, setPartnerNick] = useState('')
  const [partnerGender, setPartnerGender] = useState<Gender>('M')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [hour, setHour] = useState(() => new Date().getHours())
  const [mood, setMood] = useState(3)
  const [scores, setScores] = useState<number[]>(Array(10).fill(5))
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS)
  const [showConfetti, setShowConfetti] = useState(false)
  const [savedScore, setSavedScore] = useState<number | null>(null)
  const { width, height } = useWindowSize()

  useEffect(() => {
    const s = getSettings()
    setWeights(s.weights)
  }, [])

  const avg = weightedAverage(scores, weights)

  const handleScore = useCallback((i: number, v: number) => {
    setScores((prev) => {
      const next = [...prev]
      next[i] = v
      return next
    })
  }, [])

  const handleSave = () => {
    if (!partnerNick.trim()) { setStep('partner'); return }
    const uuid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
    })
    const entry = {
      id: uuid(),
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
    setStep('partner')
    setPartnerNick('')
    setPartnerGender('M')
    setDate(new Date().toISOString().slice(0, 10))
    setHour(new Date().getHours())
    setMood(3)
    setScores(Array(10).fill(5))
    setSavedScore(null)
    setShowConfetti(false)
  }

  const getStatementLabel = (s: typeof STATEMENTS[0]) => {
    if (s.id === 7) {
      return partnerGender === 'M' ? 'Dimensioni e forma' : 'Capienza e profondità'
    }
    return s.label
  }

  const stepIndex = STEPS.indexOf(step)

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
          <h1 className="text-3xl font-black tracking-tight" style={{ color: '#FF0033' }}>
            🔥 PassionTrack
          </h1>
          <p className="text-white/40 text-sm mt-1">Nuova sessione</p>
        </div>

        {/* Progress bar (hidden on done step) */}
        {step !== 'done' && (
          <div className="flex gap-1.5 mb-6">
            {(['partner', 'mood', 'sliders'] as Step[]).map((s, i) => (
              <div key={s} className="h-1 flex-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #FF0033, #8B00FF)' }}
                  initial={{ width: 0 }}
                  animate={{ width: i <= stepIndex ? '100%' : '0%' }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1: Partner */}
          {step === 'partner' && (
            <motion.div
              key="partner"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.35 }}
            >
              <div className="glass-card p-5 mb-4 relative z-10">
                <h2 className="text-lg font-bold text-white mb-4">👤 Con chi?</h2>
                <PartnerDropdown
                  nick={partnerNick}
                  gender={partnerGender}
                  onNickChange={setPartnerNick}
                  onGenderChange={setPartnerGender}
                />
                <div className="mt-5 space-y-4">
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
              <motion.button
                type="button"
                onClick={() => {
                  if (!partnerNick.trim()) return
                  setStep('mood')
                }}
                className="btn-neon w-full py-4 text-base"
                whileTap={{ scale: 0.97 }}
                style={{ opacity: partnerNick.trim() ? 1 : 0.4 }}
              >
                Avanti →
              </motion.button>
            </motion.div>
          )}

          {/* STEP 2: Mood */}
          {step === 'mood' && (
            <motion.div
              key="mood"
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
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep('partner')} className="btn-ghost flex-1 py-4">
                  ← Indietro
                </button>
                <motion.button
                  type="button"
                  onClick={() => setStep('sliders')}
                  className="btn-neon flex-[2] py-4 text-base"
                  whileTap={{ scale: 0.97 }}
                >
                  Avanti →
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Sliders */}
          {step === 'sliders' && (
            <motion.div
              key="sliders"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.35 }}
            >
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
                      style={{ color: '#FF0033' }}
                    >
                      {avg.toFixed(1)}
                    </motion.span>
                  </div>
                </div>
                {STATEMENTS.map((s, i) => (
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
                <button type="button" onClick={() => setStep('mood')} className="btn-ghost flex-1 py-4">
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
          {step === 'done' && (
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
              <p className="text-white/50 mb-6">con <span className="text-white font-semibold">{partnerNick}</span></p>
              <div className="glass-card p-6 mb-8 inline-block mx-auto">
                <p className="text-white/50 text-sm mb-1">Voto finale</p>
                <p className="text-5xl font-black" style={{ color: '#FF0033' }}>
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
