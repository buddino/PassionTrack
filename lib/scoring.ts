export function weightedAverage(scores: number[], weights: number[]): number {
    const totalWeight = weights.reduce((acc, w) => acc + w, 0)
    if (totalWeight === 0) return 0
    const weightedSum = scores.reduce((acc, score, i) => acc + score * (weights[i] ?? 1), 0)
    return Math.round((weightedSum / totalWeight) * 100) / 100
}

export function scoreToColor(score: number): string {
    // 0 = cool blue, 5 = orange, 10 = neon red
    const t = score / 10
    if (t < 0.5) {
        // blue (#4488FF) → orange (#FF8800)
        const r = Math.round(68 + (255 - 68) * (t * 2))
        const g = Math.round(136 + (136 - 136) * (t * 2))
        const b = Math.round(255 + (0 - 255) * (t * 2))
        return `rgb(${r},${g},${b})`
    } else {
        // orange (#FF8800) → neon red (#FF0033)
        const u = (t - 0.5) * 2
        const r = 255
        const g = Math.round(136 * (1 - u))
        const b = Math.round(0 + 51 * u)
        return `rgb(${r},${g},${b})`
    }
}

export function scoreToHeatColor(avg: number | null): string {
    if (avg === null) return 'rgba(255,255,255,0.05)'
    const t = avg / 10
    // from dark gray to dark red
    const r = Math.round(40 + (220 - 40) * t)
    const g = Math.round(40 * (1 - t))
    const b = Math.round(40 * (1 - t))
    return `rgba(${r},${g},${b},${0.3 + t * 0.7})`
}
