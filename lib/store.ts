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
    version: string
    theme: 'dark' | 'light'
    notifications: boolean
    pin: string | null
    entries: PerformanceEntry[]
    unlockedChallenges: string[]
    settings: Settings // Moved settings into AppState
}

const defaultState: AppState = {
    version: '1.0.0',
    theme: 'dark',
    notifications: true,
    pin: null,
    entries: [],
    unlockedChallenges: [],
    settings: { weights: DEFAULT_WEIGHTS }
}

const APP_STATE_KEY = 'passiontrack_app_state'
const LEGACY_ENTRIES_KEY = 'passiontrack_entries'
const LEGACY_SETTINGS_KEY = 'passiontrack_settings'
export const CURRENT_VERSION = '1.0.0'

function performMigration() {
    if (typeof window === 'undefined') return

    let stateHasChanged = false;
    const rawState = localStorage.getItem(APP_STATE_KEY)

    // 1. Migrazione Legacy -> 1.0.0 (se l'App State non esiste ancora)
    if (!rawState) {
        const legacyEntriesRaw = localStorage.getItem(LEGACY_ENTRIES_KEY)
        const legacySettingsRaw = localStorage.getItem(LEGACY_SETTINGS_KEY)

        if (legacyEntriesRaw || legacySettingsRaw) {
            console.log("PassionTrack: Rilevati dati vecchio formato. Inizio migrazione a 1.0.0...")
            let entries: PerformanceEntry[] = []
            if (legacyEntriesRaw) {
                try {
                    const parsed = JSON.parse(legacyEntriesRaw)
                    if (Array.isArray(parsed)) {
                        entries = parsed.map((e: any) => ({
                            ...e,
                            type: e.type || 'scopata'
                        }))
                    }
                } catch (e) {
                    console.error("Errore migrazione entries:", e)
                }
            }

            let settings: Settings = { weights: DEFAULT_WEIGHTS }
            if (legacySettingsRaw) {
                try {
                    const parsed = JSON.parse(legacySettingsRaw)
                    if (parsed && parsed.weights) {
                        settings = parsed
                    }
                } catch (e) {
                    console.error("Errore migrazione settings:", e)
                }
            }

            const migratedState: AppState = {
                ...defaultState,
                entries,
                settings,
                version: '1.0.0'
            }

            localStorage.setItem(APP_STATE_KEY, JSON.stringify(migratedState))
            console.log("PassionTrack: Migrazione legacy completata con successo.")
        }
        return // Se eravamo in stato legacy, ora siamo a 1.0.0, non serve fare versioning. Oppure era vuoto e prenderà defaultState
    }

    // 2. Schema Versioning Migrations (per AppState esistenti)
    if (rawState) {
        try {
            const currentState: any = JSON.parse(rawState);

            // Assicuriamo che gli stati creati in beta abbiano almeno la "1.0.0"
            if (!currentState.version) {
                currentState.version = '1.0.0';
                stateHasChanged = true;
            }

            // --- FUTURE MIGRATIONS GO HERE ---
            // if (currentState.version === '1.0.0') {
            //     // Esempio: upgrade to 1.1.0 
            //     currentState.version = '1.1.0';
            //     stateHasChanged = true;
            //     console.log("PassionTrack: Migrato da 1.0.0 a 1.1.0")
            // }

            if (stateHasChanged) {
                localStorage.setItem(APP_STATE_KEY, JSON.stringify(currentState))
                console.log(`PassionTrack: Migrazione schema completata alla versione ${currentState.version}.`)
            }
        } catch (e) {
            console.error("Errore durante la migrazione del versionamento:", e);
        }
    }
}

function getState(): AppState {
    if (typeof window === 'undefined') return defaultState

    // Tenta la migrazione se necessario
    performMigration()

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

        if (!mergedState.settings) {
            mergedState.settings = { weights: DEFAULT_WEIGHTS }
        } else if (!mergedState.settings.weights) {
            mergedState.settings.weights = DEFAULT_WEIGHTS
        } else if (mergedState.settings.weights.length < DEFAULT_WEIGHTS.length) {
            // Fill missing weights with 1.0 (default)
            const currentWeights = [...mergedState.settings.weights]
            for (let i = currentWeights.length; i < DEFAULT_WEIGHTS.length; i++) {
                currentWeights[i] = 1.0
            }
            mergedState.settings.weights = currentWeights
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

export function importJSON(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string
                const importedEntries = JSON.parse(content)

                if (!Array.isArray(importedEntries)) {
                    throw new Error("Il file non contiene un array di performance valido.")
                }

                const state = getState()
                // Simple merge logic: check for ID duplicates or just append and clean
                const existingIds = new Set(state.entries.map(e => e.id))
                const newEntries = importedEntries.filter((e: any) => e.id && !existingIds.has(e.id))

                if (newEntries.length === 0) {
                    throw new Error("Nessuna nuova performance trovata (tutte già presenti).")
                }

                state.entries = [...state.entries, ...newEntries].sort((a, b) =>
                    new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
                )

                saveState(state)
                resolve()
            } catch (err) {
                reject(err)
            }
        }
        reader.onerror = () => reject(new Error("Errore durante la lettura del file."))
        reader.readAsText(file)
    })
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
