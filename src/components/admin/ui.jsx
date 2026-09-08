import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { ease } from '../Reveal'
import { useLockBody } from '../../hooks'

export function Modal({ open, onClose, title, children, wide = false }) {
  useLockBody(open)
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="drawer-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className={`modal ${wide ? 'modal--wide' : ''}`}
            role="dialog" aria-modal="true" aria-label={title}
            initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.35, ease }}
          >
            <header className="modal__head">
              <h3>{title}</h3>
              <button type="button" className="nav__icon" aria-label="Close" onClick={onClose}><X size={18} strokeWidth={1.8} /></button>
            </header>
            <div className="modal__body">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function ConfirmDialog({ open, title, body, confirmLabel = 'Delete', onConfirm, onCancel, danger = true }) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="confirm__body">{body}</p>
      <div className="confirm__actions">
        <button type="button" className="btn btn--line btn--sm" onClick={onCancel}>Cancel</button>
        <button type="button" className={`btn btn--sm ${danger ? 'btn--danger' : 'btn--solid'}`} onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </Modal>
  )
}

/** Small status pill for admin tables */
export function APill({ status }) {
  return <span className={`pill pill--${status}`}>{status}</span>
}
