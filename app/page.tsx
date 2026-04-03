'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import SliderInput from '@/components/SliderInput'
import MoodPicker from '@/components/MoodPicker'
import PartnerDropdown from '@/components/PartnerDropdown'
import CustomDatePicker from '@/components/CustomDatePicker'
import HourPicker from '@/components/HourPicker'
import PerformanceTypePicker from '@/components/PerformanceTypePicker'
import LocationDropdown from '@/components/LocationDropdown'
import { saveEntry, getSettings, getEntries, getUnlockedChallenges, addUnlockedChallenge } from '@/lib/store'
import type { PerformanceEntry } from '@/lib/store'
import ShareModal from '@/components/ShareModal'
import { CHALLENGES, type Challenge } from '@/lib/challenges'
import { weightedAverage } from '@/lib/scoring'
import { STATEMENTS, PERFORMANCE_TYPES_CONFIG, DEFAULT_WEIGHTS } from '@/lib/constants'
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

  const [weights, setWeights] = useState<number[]>(DEFAULT_WEIGHTS)
  const [newlyUnlocked, setNewlyUnlocked] = useState<Challenge[]>([])
  const [showConfetti, setShowConfetti] = useState(false)
  const [savedScore, setSavedScore] = useState<number | null>(null)
  const [lastSavedEntry, setLastSavedEntry] = useState<PerformanceEntry | null>(null)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
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

    const entry = {
      type: perfType,
      location: location.trim() || undefined,
      partnerNick: partnerNick.trim(),
      partnerGender,
      datetime: `${date}T${hour.toString().padStart(2, '0')}:00:00`,
      mood,
      scores,
      weightedAvg: avg,
    }
    const saved = saveEntry(entry)
    setLastSavedEntry(saved)

    const allEntries = getEntries()
    const unlockedIds = getUnlockedChallenges()
    const newlyUnlockedList: Challenge[] = []

    for (const challenge of CHALLENGES) {
      if (!unlockedIds.includes(challenge.id)) {
        if (challenge.condition(allEntries)) {
          newlyUnlockedList.push(challenge)
          addUnlockedChallenge(challenge.id)
        }
      }
    }

    setNewlyUnlocked(newlyUnlockedList)

    setSavedScore(avg)
    setShowConfetti(true)
    setStep('done')
    setTimeout(() => setShowConfetti(false), newlyUnlockedList.length > 0 ? 8000 : 4500)
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
    setLastSavedEntry(null)
    setNewlyUnlocked([])
    setShowConfetti(false)
    setIsShareModalOpen(false)
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
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="PassionTrack Logo"
              width={40}
              height={40}
              className="rounded-xl shadow-lg"
              priority
            />
            <h1 className="text-3xl font-black tracking-tight" style={{ color: perfType ? PERFORMANCE_TYPES_CONFIG[perfType].color : '#FF0033' }}>
              {perfType ? PERFORMANCE_TYPES_CONFIG[perfType].label : 'PassionTrack'}
            </h1>
          </div>
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
              <div className="w-24 h-24 rounded-full border-[6px] flex items-center justify-center mb-8 mx-auto" style={{ borderColor: perfType ? PERFORMANCE_TYPES_CONFIG[perfType].color : '#FF0033' }}>
                <span className="text-3xl font-black" style={{ color: perfType ? PERFORMANCE_TYPES_CONFIG[perfType].color : '#FF0033' }}>{savedScore}</span>
              </div>

              {newlyUnlocked.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-8 w-full flex flex-col items-center gap-3"
                >
                  <h3 className="text-lg font-black text-[#FFCC00] flex items-center gap-2">
                    <span className="text-2xl">🏆</span> NUOVI REWARD! <span className="text-2xl">🏆</span>
                  </h3>
                  <div className="flex flex-col gap-2 w-full">
                    {newlyUnlocked.map(c => (
                      <div key={c.id} className="p-4 flex items-center gap-4 rounded-xl border-2 border-[#FFCC00]/40 bg-[#FFD700]/10" style={{ boxShadow: '0 0 20px rgba(255,204,0,0.2)' }}>
                        <div className="text-4xl">🏅</div>
                        <div className="text-left flex-1">
                          <h4 className="font-bold text-white text-[15px]">{c.title}</h4>
                          <p className="text-[11px] text-white/70 leading-tight mt-0.5">{c.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}


              <div className="flex flex-col gap-3 px-4">
                <motion.button
                  type="button"
                  onClick={() => setIsShareModalOpen(true)}
                  className="btn-ghost w-full py-4 text-base font-bold flex items-center justify-center gap-2"
                  whileTap={{ scale: 0.97 }}
                >
                  <span>📤</span> Condividi Risultato
                </motion.button>

                <motion.button
                  type="button"
                  onClick={handleReset}
                  className="btn-neon w-full py-4 text-base font-bold mt-2"
                  whileTap={{ scale: 0.97 }}
                >
                  ➕ Nuova Sessione
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <ShareModal 
          isOpen={isShareModalOpen} 
          onClose={() => setIsShareModalOpen(false)} 
          entry={lastSavedEntry} 
        />
      </div>
    </>
  )
}
