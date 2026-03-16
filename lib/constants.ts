export type Gender = 'M' | 'F' | 'O'
export type PerformanceType = 'scopata' | 'limone' | 'fai-da-te'

export interface Statement {
    id: number
    label: string
    labelAlt?: string // for statement 7 gender variant
    emoji: string
    description: string
}

export const STATEMENTS: Statement[] = [
    {
        id: 1,
        label: 'Preliminari',
        emoji: '💋',
        description: 'Qualità del preludio e del riscaldamento',
    },
    {
        id: 2,
        label: 'Passionalità e ardore',
        emoji: '🔥',
        description: 'Intensità emotiva e trasporto',
    },
    {
        id: 3,
        label: 'Empatia verso il partner',
        emoji: '💞',
        description: 'Attenzione e sintonia con i desideri altrui',
    },
    {
        id: 4,
        label: 'Resistenza fisica e durata',
        emoji: '⚡',
        description: 'Energia, resistenza e continuità',
    },
    {
        id: 5,
        label: 'Orgasmo / Godimento',
        emoji: '🌊',
        description: 'Qualità e intensità del piacere',
    },
    {
        id: 6,
        label: 'Fisicità post-amplesso',
        emoji: '🤗',
        description: 'Dolcezza, cuddles e presenza emotiva',
    },
    {
        id: 7,
        label: 'Dimensioni e forma',
        labelAlt: 'Capienza e profondità',
        emoji: '📏',
        description: 'Compatibilità fisica',
    },
    {
        id: 8,
        label: 'Sfizi, feticismi e kink',
        emoji: '🎭',
        description: 'Apertura mentale e gioco dei ruoli',
    },
    {
        id: 9,
        label: 'Coinvolgimento mentale',
        emoji: '🧠',
        description: 'Intesa intellettuale ed erotica',
    },
    {
        id: 10,
        label: 'Varietà e dinamismo',
        emoji: '🎲',
        description: 'Creatività, posizioni e ritmo',
    },
    {
        id: 11,
        label: 'Manine qua e là',
        emoji: '🖐️',
        description: 'Uso delle mani e carezze',
    },
    {
        id: 12,
        label: 'Lingua',
        emoji: '🌀',
        description: 'Abilità e tecnica',
    },
    {
        id: 13,
        label: 'Livello di eccitazione raggiunto',
        emoji: '🔥',
        description: 'Picco di calore',
    },
    {
        id: 14,
        label: 'Dolore alla mascella',
        emoji: '💊',
        description: 'Impegno logistico e fisico',
    },
    {
        id: 15,
        label: 'Qualità del tool utilizzato',
        emoji: '🛠️',
        description: 'Efficacia dell\'attrezzo',
    },
]

export const PERFORMANCE_TYPES_CONFIG = {
    'scopata': {
        label: 'Scopata',
        emoji: '🧹',
        statements: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        color: '#FF0033' // Neon red
    },
    'limone': {
        label: 'Limone duro',
        emoji: '🍋',
        statements: [2, 9, 10, 11, 12, 13, 14, 4],
        color: '#FFCC00' // Lemon yellow
    },
    'fai-da-te': {
        label: 'Fai da te',
        emoji: '🖐️',
        statements: [4, 6, 5, 8, 15],
        color: '#33CCFF' // Cyan
    }
} as const

// Map statement 1..15 -> 1.0 weight by default.
export const DEFAULT_WEIGHTS = STATEMENTS.map(() => 1.0)
export const MOOD_EMOJIS = ['😶', '😏', '😊', '🥵', '🔥', '💥']
