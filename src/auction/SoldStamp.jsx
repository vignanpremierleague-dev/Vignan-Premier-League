import { motion } from 'framer-motion'
import { AUCTION_STAGES, formatCr } from '../lib/auction'
import { C } from './tokens'

export default function SoldStamp({ stage, soldTo, soldPrice }) {
  const isSold = stage === AUCTION_STAGES.SOLD
  const isUnsold = stage === AUCTION_STAGES.UNSOLD
  if (!isSold && !isUnsold) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.3, rotate: -8 }}
      animate={{ opacity: 1, scale: 1, rotate: -8 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%) rotate(-8deg)',
        zIndex: 30, pointerEvents: 'none',
        padding: isSold ? '18px 44px 14px' : '18px 44px',
        border: `5px solid ${isSold ? C.danger : C.textMuted}`,
        borderRadius: 18,
        background: 'rgba(8,8,8,.72)',
        textAlign: 'center',
        boxShadow: isSold
          ? `0 0 60px rgba(230,57,70,.35), inset 0 0 40px rgba(230,57,70,.08)`
          : `0 0 30px rgba(100,100,100,.2)`,
      }}
    >
      <div style={{
        fontFamily: '"DM Sans",system-ui,sans-serif', fontWeight: 900,
        fontSize: 'clamp(2.4rem,6vw,4.5rem)', letterSpacing: '.18em',
        textTransform: 'uppercase', lineHeight: 1,
        color: isSold ? C.danger : C.textMuted,
        textShadow: isSold ? `0 0 40px rgba(230,57,70,.7)` : 'none',
      }}>
        {isSold ? 'SOLD' : 'UNSOLD'}
      </div>
      {isSold && (
        <div style={{ marginTop: 10 }}>
          <div style={{ color: '#ddd', fontWeight: 700, fontSize: '.88rem', letterSpacing: '.06em', textTransform: 'uppercase' }}>
            {soldTo}
          </div>
          <div style={{ color: C.orange, fontWeight: 900, fontSize: '1.6rem', marginTop: 4 }}>
            {formatCr(soldPrice)}
          </div>
        </div>
      )}
    </motion.div>
  )
}
