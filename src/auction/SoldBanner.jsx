import { AnimatePresence, motion } from 'framer-motion'
import { Gavel } from 'lucide-react'
import { AUCTION_STAGES, formatCr } from '../lib/auction'
import { C } from './tokens'

/**
 * Shared sold/unsold banner used in both the mobile player card and the
 * admin PlayerPanel. Replaces the bid row with an animated result display.
 */
export default function SoldBanner({ stage, soldTo, soldPrice }) {
  const isSold   = stage === AUCTION_STAGES.SOLD
  const isUnsold = stage === AUCTION_STAGES.UNSOLD
  if (!isSold && !isUnsold) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      style={{
        borderRadius: 12, overflow: 'hidden',
        background: isSold ? 'rgba(22,10,6,1)' : 'rgba(12,12,12,1)',
        border: `1px solid ${isSold ? 'rgba(255,107,34,.5)' : 'rgba(255,255,255,.1)'}`,
        boxShadow: isSold ? `0 0 32px rgba(255,107,34,.2)` : 'none',
      }}
    >
      {/* Animated shimmer top bar */}
      {isSold && (
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            height: 3,
            background: `linear-gradient(90deg, transparent, ${C.orange}, transparent)`,
          }}
        />
      )}

      <div style={{ padding: '16px 20px' }}>
        {isSold ? (
          <>
            {/* SOLD label with pulsing dot */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.08, type: 'spring', stiffness: 300, damping: 18 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: '.62rem', fontWeight: 900, letterSpacing: '.2em',
                textTransform: 'uppercase', color: C.orange, marginBottom: 10,
              }}
            >
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                style={{ width: 6, height: 6, borderRadius: '50%', background: C.orange, display: 'inline-block', flexShrink: 0 }}
              />
              SOLD
            </motion.div>

            {/* Team → Price */}
            <motion.div
              initial={{ x: -14, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '.62rem', color: C.textMuted, fontWeight: 700, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '.06em' }}>To</div>
                <div style={{ fontWeight: 900, fontSize: '1.2rem', color: C.text, textTransform: 'capitalize', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {soldTo}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '.62rem', color: C.textMuted, fontWeight: 700, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '.06em' }}>At</div>
                <motion.div
                  animate={{ color: [C.orange, '#ffb560', C.orange] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ fontWeight: 900, fontSize: '1.4rem', lineHeight: 1 }}
                >
                  {formatCr(soldPrice)}
                </motion.div>
              </div>
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', alignItems: 'center', gap: 10 }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(255,255,255,.06)', border: `1px solid ${C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Gavel size={14} color={C.textMuted} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: C.textSub }}>Unsold</div>
              <div style={{ fontSize: '.75rem', color: C.textMuted, marginTop: 1 }}>No bids placed</div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
