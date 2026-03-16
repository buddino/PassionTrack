'use client'

import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const tabs = [
    { href: '/', label: 'Nuovo', emoji: '➕' },
    { href: '/stats', label: 'Stats', emoji: '📊' },
    { href: '/settings', label: 'Impostazioni', emoji: '⚙️' },
]

export default function BottomNav() {
    const pathname = usePathname()
    const router = useRouter()

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-40"
            style={{
                background: 'rgba(10,10,15,0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderTop: '1px solid rgba(255,255,255,0.08)',
            }}
        >
            <div className="flex items-center justify-around max-w-md mx-auto px-2">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href
                    return (
                        <button
                            key={tab.href}
                            onClick={() => router.push(tab.href)}
                            className="relative flex flex-col items-center py-3 px-5 gap-1 group outline-none"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="nav-indicator"
                                    className="absolute top-0 left-0 right-0 mx-auto w-8 h-0.5 rounded-full"
                                    style={{ background: '#FF0033', boxShadow: '0 0 8px #FF0033' }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                            <motion.span
                                className="text-2xl"
                                animate={{ scale: isActive ? 1.15 : 1 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                            >
                                {tab.emoji}
                            </motion.span>
                            <span
                                className="text-xs font-medium transition-colors duration-200"
                                style={{ color: isActive ? '#FF0033' : 'rgba(255,255,255,0.4)' }}
                            >
                                {tab.label}
                            </span>
                        </button>
                    )
                })}
            </div>
        </nav>
    )
}
