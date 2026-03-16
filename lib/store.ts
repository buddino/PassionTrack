import { DEFAULT_WEIGHTS, PerformanceType, Gender } from './constants'

export interface PerformanceEntry {
    id: string
    type?: PerformanceType // Optional for legacy support
    location?: string
    partnerNick: string
    partnerGender: Gender
    datetime: string
    mood: number
    scores: number[] // Indexed matching PERFORMANCE_TYPES_CONFIG[type].statements
    weightedAvg: number
}

export interface Settings {
    weights: number[]
}

export interface AppState {
    theme: 'dark' | 'light'
    notifications: boolean
    pin: string | null
    entries: PerformanceEntry[]
    unlockedChallenges: string[]
    settings: Settings // Moved settings into AppState
}

const defaultState: AppState = {
    theme: 'dark',
    notifications: true,
    pin: null,
    entries: [],
    unlockedChallenges: [],
    settings: { weights: DEFAULT_WEIGHTS }
}

const APP_STATE_KEY = 'passiontrack_app_state'

function getState(): AppState {
    if (typeof window === 'undefined') return defaultState
    try {
        const raw = localStorage.getItem(APP_STATE_KEY)
        const storedState: AppState = raw ? JSON.parse(raw) : defaultState

        // Merge with defaultState to ensure new fields are present
        const mergedState = { ...defaultState, ...storedState }

        // Optional backfill of legacy entries as 'scopata' if not already done
        if (mergedState.entries && mergedState.entries.some(e => e.type === undefined)) {
            mergedState.entries = mergedState.entries.map((e: any) => ({
                ...e,
                type: e.type || 'scopata'
            }))
        }

        // Ensure unlockedChallenges is an array
        if (!mergedState.unlockedChallenges) {
            mergedState.unlockedChallenges = []
        }

        // Ensure settings are present
        if (!mergedState.settings) {
            mergedState.settings = { weights: DEFAULT_WEIGHTS }
        } else if (!mergedState.settings.weights) {
            mergedState.settings.weights = DEFAULT_WEIGHTS
        }

        return mergedState
    } catch (e) {
        console.error("Failed to parse app state from localStorage:", e)
        return defaultState
    }
}

function saveState(state: AppState): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(APP_STATE_KEY, JSON.stringify(state))
}

export function getEntries(): PerformanceEntry[] {
    return getState().entries
}

export const saveEntry = (entry: Omit<PerformanceEntry, 'id'>): PerformanceEntry => {
    const state = getState()
    // Find missing fields and ensure default arrays are correct length based on type
    const newEntry: PerformanceEntry = {
        ...entry,
        id: crypto.randomUUID(),
    }
    state.entries.unshift(newEntry) // Add to the beginning

    // Evaluate challenges here
    // import inside to prevent circular dep initially or just use it if exported
    // actually, we will just return the state context and handle evaluation in the UI, or evaluate here dynamically.
    saveState(state)
    return newEntry
}

export function deleteEntry(id: string): void {
    const state = getState()
    state.entries = state.entries.filter((e) => e.id !== id)
    saveState(state)
}

export function clearAllEntries(): void {
    const state = getState()
    state.entries = []
    saveState(state)
}

export function getSettings(): Settings {
    return getState().settings
}

export function saveSettings(settings: Settings): void {
    const state = getState()
    state.settings = settings
    saveState(state)
}

export const getUnlockedChallenges = (): string[] => {
    return getState().unlockedChallenges || []
}

export const addUnlockedChallenge = (id: string) => {
    const state = getState()
    if (!state.unlockedChallenges) {
        state.unlockedChallenges = []
    }
    if (!state.unlockedChallenges.includes(id)) {
        state.unlockedChallenges.push(id)
        saveState(state)
        return true
    }
    return false
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

export function getPartnerHistory(type?: PerformanceType): Array<{ nick: string; gender: Gender }> {
    const entries = getEntries()
    const map = new Map<string, Gender>()
    for (const e of entries) {
        if (type === 'fai-da-te') {
            if (e.type === 'fai-da-te' && !map.has(e.partnerNick)) {
                map.set(e.partnerNick, e.partnerGender)
            }
        } else {
            // Include legacy undefined forms, or 'scopata' / 'limone' as human partners
            if (e.type !== 'fai-da-te' && !map.has(e.partnerNick)) {
                map.set(e.partnerNick, e.partnerGender)
            }
        }
    }
    return Array.from(map.entries()).map(([nick, gender]) => ({ nick, gender }))
}

export function getLocationHistory(): string[] {
    const entries = getEntries()
    const set = new Set<string>()
    for (const e of entries) {
        if (e.location?.trim()) {
            set.add(e.location.trim())
        }
    }
    return Array.from(set)
}
