'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toPng } from 'html-to-image'
import { Share2, Download, X, Eye, EyeOff, MapPin, User, BarChart2 } from 'lucide-react'
import type { PerformanceEntry } from '@/lib/store'
import ShareCard from './ShareCard'
import { PERFORMANCE_TYPES_CONFIG } from '@/lib/constants'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  entry: PerformanceEntry | null
}

export default function ShareModal({ isOpen, onClose, entry }: ShareModalProps) {
  const [options, setOptions] = useState({
    showNick: true,
    showLocation: true,
    showDetail: true
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const hiddenCardRef = useRef<HTMLDivElement>(null)

  if (!entry) return null
  const config = PERFORMANCE_TYPES_CONFIG[entry.type || 'scopata']

  const handleDownload = async () => {
    const target = hiddenCardRef.current
    if (!target) return

    setIsGenerating(true)
    try {
      // Small delay to ensure everything is rendered
      await new Promise(resolve => setTimeout(resolve, 100))

      const dataUrl = await toPng(target, {
        width: 1080,
        height: 1080,
        pixelRatio: 2, // High resolution
        cacheBust: true,
      })

      const link = document.createElement('a')
      link.download = `passiontrack-performance-${entry.datetime.slice(0, 10)}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Errore durante la generazione dell\'immagine:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleShare = async () => {
    const target = hiddenCardRef.current
    if (!target) return

    setIsGenerating(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 100))
      const dataUrl = await toPng(target, {
        width: 1080,
        height: 1080,
        pixelRatio: 2,
      })

      const blob = await fetch(dataUrl).then(res => res.blob())
      const file = new File([blob], `performance-${entry.datetime.slice(0, 10)}.png`, { type: 'image/png' })

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'PassionTrack Performance',
            text: 'Guarda i risultati della mia sessione! 🚀'
          })
        } catch (shareErr) {
          // If the user cancelled or the share failed for other reasons
          if ((shareErr as Error).name !== 'AbortError') {
             console.error('Share failed:', shareErr)
             handleDownload()
          }
        }
      } else {
        // Browser doesn't support sharing files (common on desktop)
        console.warn('Native sharing not supported for files')
        handleDownload()
      }
    } catch (err) {
      console.error('Errore durante la generazione per condivisione:', err)
      alert("Errore nella condivisione. Prova a scaricare l'immagine.")
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleOption = (key: keyof typeof options) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-[#0a0a0f] border border-white/10 rounded-2xl overflow-hidden glass-card shadow-2xl flex flex-col"
            style={{ maxHeight: 'calc(100vh - 40px)' }}
          >
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-black text-white">Configura Condivisione</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 overflow-y-auto space-y-6">

              {/* Options */}
              <div className="space-y-3">
                <OptionToggle
                  icon={<User size={18} />}
                  label="Mostra nickname"
                  isActive={options.showNick}
                  onClick={() => toggleOption('showNick')}
                  color={config.color}
                />
                <OptionToggle
                  icon={<MapPin size={18} />}
                  label="Mostra luogo"
                  isActive={options.showLocation}
                  onClick={() => toggleOption('showLocation')}
                  color={config.color}
                />
                <OptionToggle
                  icon={<BarChart2 size={18} />}
                  label="Dettagli voti"
                  isActive={options.showDetail}
                  onClick={() => toggleOption('showDetail')}
                  color={config.color}
                />
              </div>


              {/* Note about generation */}
            </div>

            {/* Actions */}
            <div className="p-4 bg-white/5 flex gap-3">
              <button
                onClick={handleDownload}
                disabled={isGenerating}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all disabled:opacity-50"
              >
                <Download size={20} />
                Salva
              </button>
              <button
                onClick={handleShare}
                disabled={isGenerating}
                className="flex-[2] btn-neon flex items-center justify-center gap-2 py-4 font-bold"
                style={{ background: `linear-gradient(135deg, ${config.color}, #8B00FF)` }}
              >
                <Share2 size={20} />
                Condividi
              </button>
            </div>

            {/* Hidden Target for Generation */}
            <div className="fixed top-[-9999px] left-[-9999px] pointer-events-none opacity-0">
              <ShareCard ref={hiddenCardRef} entry={entry} options={options} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function OptionToggle({ icon, label, isActive, onClick, color }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void, color: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${isActive ? 'bg-white/5 border-white/20' : 'bg-transparent border-white/5 opacity-60'}`}
    >
      <div className="flex items-center gap-3">
        <div className="text-white/60">
          {icon}
        </div>
        <span className="font-bold text-white text-sm">{label}</span>
      </div>
      <div
        className={`w-10 h-6 rounded-full relative transition-colors ${isActive ? '' : 'bg-white/10'}`}
        style={{ backgroundColor: isActive ? color : undefined }}
      >
        <motion.div
          animate={{ x: isActive ? 18 : 2 }}
          className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-md"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
    </button>
  )
}
