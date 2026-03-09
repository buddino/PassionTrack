import { DEFAULT_WEIGHTS } from './constants'

export interface PerformanceEntry {
    id: string
    partnerNick: string
    partnerGender: 'M' | 'F' | 'O'
    datetime: string
    mood: number
    scores: number[]
    weightedAvg: number
}

export interface Settings {
    weights: number[]
}

const ENTRIES_KEY = 'passiontrack_entries'
const SETTINGS_KEY = 'passiontrack_settings'

export function getEntries(): PerformanceEntry[] {
    if (typeof window === 'undefined') return []
    try {
        const raw = localStorage.getItem(ENTRIES_KEY)
        return raw ? JSON.parse(raw) : []
    } catch {
        return []
    }
}

export function saveEntry(entry: PerformanceEntry): void {
    const entries = getEntries()
    entries.unshift(entry)
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries))
}

export function deleteEntry(id: string): void {
    const entries = getEntries().filter((e) => e.id !== id)
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries))
}

export function clearAllEntries(): void {
    localStorage.removeItem(ENTRIES_KEY)
}

export function getSettings(): Settings {
    if (typeof window === 'undefined') return { weights: DEFAULT_WEIGHTS }
    try {
        const raw = localStorage.getItem(SETTINGS_KEY)
        return raw ? JSON.parse(raw) : { weights: DEFAULT_WEIGHTS }
    } catch {
        return { weights: DEFAULT_WEIGHTS }
    }
}

export function saveSettings(settings: Settings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function exportJSON(): void {
    const entries = getEntries()
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `passiontrack_export_${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}

export function getPartnerHistory(): Array<{ nick: string; gender: 'M' | 'F' | 'O' }> {
    const entries = getEntries()
    const map = new Map<string, 'M' | 'F' | 'O'>()
    for (const e of entries) {
        if (!map.has(e.partnerNick)) {
            map.set(e.partnerNick, e.partnerGender)
        }
    }
    return Array.from(map.entries()).map(([nick, gender]) => ({ nick, gender }))
}
