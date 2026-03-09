export type Gender = 'M' | 'F' | 'O'

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
]

export const DEFAULT_WEIGHTS = STATEMENTS.map(() => 1.0)
export const MOOD_EMOJIS = ['😶', '😏', '😊', '🥵', '🔥', '💥']
