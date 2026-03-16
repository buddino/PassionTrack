import type { PerformanceEntry } from './store'
import { STATEMENTS } from './constants'

export interface Challenge {
    id: string
    title: string
    description: string
    condition: (entries: PerformanceEntry[]) => boolean
}

// Helper to check if dates are consecutive days
const areConsecutiveDays = (dates: Date[]) => {
    if (dates.length < 2) return false
    for (let i = 0; i < dates.length - 1; i++) {
        const d1 = new Date(dates[i].getFullYear(), dates[i].getMonth(), dates[i].getDate())
        const d2 = new Date(dates[i + 1].getFullYear(), dates[i + 1].getMonth(), dates[i + 1].getDate())
        const diff = (d1.getTime() - d2.getTime()) / (1000 * 3600 * 24)
        if (diff !== 1) return false
    }
    return true
}

// Get boundaries for a given month relative to a date
const getMonthBoundaries = (date: Date) => {
    return {
        start: new Date(date.getFullYear(), date.getMonth(), 1),
        end: new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)
    }
}

// Main list of challenges
export const CHALLENGES: Challenge[] = [
    // --- CONSECUTIVE DAYS ---
    {
        id: 'consec-3',
        title: 'Tripletta Infuocata',
        description: '3 giorni consecutivi.',
        condition: (entries) => {
            const scops = entries.filter(e => e.type === 'scopata')
            if (scops.length < 3) return false
            const dates = Array.from(new Set(scops.map(e => e.datetime.slice(0, 10))))
                .map(d => new Date(d))
                .sort((a, b) => b.getTime() - a.getTime())
            return areConsecutiveDays(dates.slice(0, 3))
        }
    },
    {
        id: 'consec-5',
        title: 'Maratona del Piacere',
        description: '5 giorni consecutivi.',
        condition: (entries) => {
            const scops = entries.filter(e => e.type === 'scopata')
            if (scops.length < 5) return false
            const dates = Array.from(new Set(scops.map(e => e.datetime.slice(0, 10))))
                .map(d => new Date(d))
                .sort((a, b) => b.getTime() - a.getTime())
            return areConsecutiveDays(dates.slice(0, 5))
        }
    },
    {
        id: 'consec-7',
        title: 'Settimana Divina',
        description: '7 giorni consecutivi.',
        condition: (entries) => {
            const scops = entries.filter(e => e.type === 'scopata')
            if (scops.length < 7) return false
            const dates = Array.from(new Set(scops.map(e => e.datetime.slice(0, 10))))
                .map(d => new Date(d))
                .sort((a, b) => b.getTime() - a.getTime())
            return areConsecutiveDays(dates.slice(0, 7))
        }
    },
    // --- SAME DAY ---
    {
        id: 'day-2',
        title: 'Doppietta',
        description: '2 volte nello stesso giorno.',
        condition: (entries) => {
            const map = new Map<string, number>()
            entries.filter(e => e.type === 'scopata').forEach(e => {
                const limit = e.datetime.slice(0, 10)
                map.set(limit, (map.get(limit) || 0) + 1)
            })
            return Array.from(map.values()).some(count => count >= 2)
        }
    },
    {
        id: 'day-3',
        title: 'Tripletta Storica',
        description: '3 volte nello stesso giorno.',
        condition: (entries) => {
            const map = new Map<string, number>()
            entries.filter(e => e.type === 'scopata').forEach(e => {
                const limit = e.datetime.slice(0, 10)
                map.set(limit, (map.get(limit) || 0) + 1)
            })
            return Array.from(map.values()).some(count => count >= 3)
        }
    },
    {
        id: 'day-4',
        title: 'Inesauribile',
        description: '4 volte nello stesso giorno.',
        condition: (entries) => {
            const map = new Map<string, number>()
            entries.filter(e => e.type === 'scopata').forEach(e => {
                const limit = e.datetime.slice(0, 10)
                map.set(limit, (map.get(limit) || 0) + 1)
            })
            return Array.from(map.values()).some(count => count >= 4)
        }
    },
    {
        id: 'day-5',
        title: 'Leggenda Vivente',
        description: '5 volte nello stesso giorno.',
        condition: (entries) => {
            const map = new Map<string, number>()
            entries.filter(e => e.type === 'scopata').forEach(e => {
                const limit = e.datetime.slice(0, 10)
                map.set(limit, (map.get(limit) || 0) + 1)
            })
            return Array.from(map.values()).some(count => count >= 5)
        }
    },
    // --- FREQUENCY PER WEEK IN A MONTH ---
    {
        id: 'week-1-month',
        title: 'Costanza',
        description: 'Almeno 1 volta a settimana per un mese intero.',
        condition: (entries) => checkWeeklyFrequency(entries, 1)
    },
    {
        id: 'week-2-month',
        title: 'Ritmo Sostenuto',
        description: 'Almeno 2 volte a settimana per un mese intero.',
        condition: (entries) => checkWeeklyFrequency(entries, 2)
    },
    {
        id: 'week-3-month',
        title: 'Coniglietto Energico',
        description: 'Almeno 3 volte a settimana per un mese intero.',
        condition: (entries) => checkWeeklyFrequency(entries, 3)
    },
    // --- SCORES IN A MONTH ---
    {
        id: 'month-3-gt8',
        title: 'Palato Fino',
        description: '3 prestazioni con voto > 8 in un mese.',
        condition: (entries) => {
            const scops = entries.filter(e => e.type === 'scopata' && e.weightedAvg > 8)
            return checkMonthlyCount(scops, 3)
        }
    },
    {
        id: 'month-3-gt9',
        title: 'Eccellenza',
        description: '3 prestazioni con voto > 9 in un mese.',
        condition: (entries) => {
            const scops = entries.filter(e => e.type === 'scopata' && e.weightedAvg > 9)
            return checkMonthlyCount(scops, 3)
        }
    },
    // --- SINGLE SCORES ---
    {
        id: 'score-9',
        title: 'Quasi Perfetto',
        description: 'Una prestazione con voto 9.',
        condition: (entries) => entries.some(e => e.type === 'scopata' && e.weightedAvg >= 9.0 && e.weightedAvg < 10.0)
    },
    {
        id: 'score-10',
        title: 'Nirvana Raggiunto',
        description: 'Una prestazione con voto 10 assoluto.',
        condition: (entries) => entries.some(e => e.type === 'scopata' && e.weightedAvg === 10.0)
    },
    {
        id: 'score-lt3',
        title: 'Serata No',
        description: 'Una prestazione con voto minore di 3.',
        condition: (entries) => entries.some(e => e.type === 'scopata' && e.weightedAvg < 3.0)
    },
    {
        id: 'score-1',
        title: 'Disastro Totale',
        description: 'Una prestazione con voto attorno all\'1.',
        condition: (entries) => entries.some(e => e.type === 'scopata' && e.weightedAvg <= 1.5 && e.weightedAvg > 0)
    },
    {
        id: 'score-0',
        title: 'Letargo',
        description: 'Una prestazione con voto 0.',
        condition: (entries) => entries.some(e => e.type === 'scopata' && e.weightedAvg === 0)
    },
    // --- PARTNERS ---
    {
        id: 'partner-3-month',
        title: 'Esploratore',
        description: '3 partner diversi in un mese.',
        condition: (entries) => checkPartnerCountMonth(entries, 3)
    },
    {
        id: 'partner-5-month',
        title: 'Conquistatore',
        description: '5 partner diversi in un mese.',
        condition: (entries) => checkPartnerCountMonth(entries, 5)
    },
    {
        id: 'partner-7-month',
        title: 'Casanova',
        description: '7 partner diversi in un mese.',
        condition: (entries) => checkPartnerCountMonth(entries, 7)
    },
    {
        id: 'partner-2-day',
        title: 'Menage Imprevisto',
        description: '2 partner diversi nello stesso giorno.',
        condition: (entries) => {
            const scops = entries.filter(e => e.type === 'scopata')
            const map = new Map<string, Set<string>>()
            scops.forEach(e => {
                const day = e.datetime.slice(0, 10)
                if (!map.has(day)) map.set(day, new Set())
                map.get(day)!.add(e.partnerNick)
            })
            return Array.from(map.values()).some(set => set.size >= 2)
        }
    },
    // --- SPECIFIC STATS = 10 ---
    {
        id: 'size-10',
        title: 'Misure Straordinarie',
        description: 'Almeno un 10 per Dimensione/Fit.',
        condition: (entries) => checkStatMax(entries, getStatIndex('Dimensione e fit del pene'))
    },
    {
        id: 'orgasm-10',
        title: 'Fuochi d\'Artificio',
        description: 'Almeno un 10 per Orgasmo.',
        condition: (entries) => checkStatMax(entries, getStatIndex('Intensità dell\'orgasmo'))
    },
    {
        id: 'stamina-10',
        title: 'Duracell',
        description: 'Almeno un 10 per Resistenza e durata.',
        condition: (entries) => checkStatMax(entries, getStatIndex('Resistenza fisica e durata'))
    },
    {
        id: 'kink-10',
        title: 'Cinquanta Sfumature',
        description: 'Almeno un 10 per Esplorazione Kink.',
        condition: (entries) => checkStatMax(entries, getStatIndex('Kink, feticci ed esplorazione'))
    },
    // --- MONTHLY TRENDS ---
    {
        id: 'trend-up-month',
        title: 'Crescita Costante',
        description: 'Trend mai decrescente per tutto un mese intero (almeno 3 prestazioni).',
        condition: (entries) => {
            const scops = entries.filter(e => e.type === 'scopata').sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
            if (scops.length < 3) return false

            // Check current month of latest entry
            const latest = new Date(scops[scops.length - 1].datetime)
            const { start, end } = getMonthBoundaries(latest)
            const monthEntries = scops.filter(e => {
                const d = new Date(e.datetime)
                return d >= start && d <= end
            })
            if (monthEntries.length < 3) return false

            for (let i = 1; i < monthEntries.length; i++) {
                if (monthEntries[i].weightedAvg < monthEntries[i - 1].weightedAvg) return false
            }
            return true
        }
    },
    {
        id: 'trend-gt8-month',
        title: 'Mese d\'Oro',
        description: 'Trend del mese sempre sopra 8 con almeno 5 scopate.',
        condition: (entries) => {
            const scops = entries.filter(e => e.type === 'scopata')
            return checkMonthlyAggregate(scops, 5, (arr) => arr.every(x => x.weightedAvg > 8))
        }
    },
    {
        id: 'trend-gt9-month',
        title: 'Mese di Diamante',
        description: 'Trend del mese sempre sopra 9 con almeno 5 scopate.',
        condition: (entries) => {
            const scops = entries.filter(e => e.type === 'scopata')
            return checkMonthlyAggregate(scops, 5, (arr) => arr.every(x => x.weightedAvg > 9))
        }
    },
    // --- TIMES OF DAY ---
    {
        id: 'all-times-month',
        title: 'Orologio Svizzero',
        description: 'Una scopata in ognuna delle fasce orarie in un mese: mattina, pomeriggio, sera e notte.',
        condition: (entries) => {
            const scops = entries.filter(e => e.type === 'scopata')
            const map = new Map<string, Set<string>>()
            scops.forEach(e => {
                const d = new Date(e.datetime)
                const yyyymm = `${d.getFullYear()}-${d.getMonth()}`
                const h = d.getHours()
                let bucket = ''
                if (h >= 6 && h < 12) bucket = 'mattina'
                else if (h >= 12 && h < 18) bucket = 'pomeriggio'
                else if (h >= 18 && h < 24) bucket = 'sera'
                else bucket = 'notte'

                if (!map.has(yyyymm)) map.set(yyyymm, new Set())
                map.get(yyyymm)!.add(bucket)
            })
            return Array.from(map.values()).some(set => set.size === 4)
        }
    }
]

// HELPERS
function checkWeeklyFrequency(entries: PerformanceEntry[], targetPerWeek: number) {
    const scops = entries.filter(e => e.type === 'scopata').sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
    if (scops.length === 0) return false

    const latest = new Date(scops[scops.length - 1].datetime)
    const { start, end } = getMonthBoundaries(latest)
    const monthEntries = scops.filter(e => {
        const d = new Date(e.datetime)
        return d >= start && d <= end
    })

    // Divide month in 4 approx weeks
    const weeks = [0, 0, 0, 0]
    monthEntries.forEach(e => {
        const d = new Date(e.datetime).getDate()
        if (d <= 7) weeks[0]++
        else if (d <= 14) weeks[1]++
        else if (d <= 21) weeks[2]++
        else weeks[3]++
    })

    return weeks.every(count => count >= targetPerWeek)
}

function checkMonthlyCount(entries: PerformanceEntry[], target: number) {
    const map = new Map<string, number>()
    entries.forEach(e => {
        const d = new Date(e.datetime)
        const key = `${d.getFullYear()}-${d.getMonth()}`
        map.set(key, (map.get(key) || 0) + 1)
    })
    return Array.from(map.values()).some(count => count >= target)
}

function checkPartnerCountMonth(entries: PerformanceEntry[], target: number) {
    const scops = entries.filter(e => e.type === 'scopata')
    const map = new Map<string, Set<string>>()
    scops.forEach(e => {
        const d = new Date(e.datetime)
        const key = `${d.getFullYear()}-${d.getMonth()}`
        if (!map.has(key)) map.set(key, new Set())
        map.get(key)!.add(e.partnerNick)
    })
    return Array.from(map.values()).some(set => set.size >= target)
}

function checkMonthlyAggregate(entries: PerformanceEntry[], minCount: number, condition: (arr: PerformanceEntry[]) => boolean) {
    const map = new Map<string, PerformanceEntry[]>()
    entries.forEach(e => {
        const d = new Date(e.datetime)
        const key = `${d.getFullYear()}-${d.getMonth()}`
        if (!map.has(key)) map.set(key, [])
        map.get(key)!.push(e)
    })

    for (const arr of Array.from(map.values())) {
        if (arr.length >= minCount && condition(arr)) return true
    }
    return false
}

function getStatIndex(labelSlice: string) {
    const statement = STATEMENTS.find(s => s.label.toLowerCase().includes(labelSlice.toLowerCase()))
    return statement ? statement.id - 1 : -1
}

function checkStatMax(entries: PerformanceEntry[], scoreIdx: number) {
    if (scoreIdx === -1) return false
    return entries.some(e => e.type === 'scopata' && e.scores?.[scoreIdx] === 10)
}
