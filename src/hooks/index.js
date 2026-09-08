import { useEffect, useState } from 'react'

/** Ticks every 30s — enough precision for a days/hours/minutes countdown */
export function useCountdown(target) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(t)
  }, [])
  const diff = Math.max(0, target - now)
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor(diff / 3600000) % 24,
    minutes: Math.floor(diff / 60000) % 60,
    done: diff === 0,
  }
}

/** True once the window is scrolled past `offset` px.
 * Hysteresis (releases below `offset - 24`) + rAF throttle so a scroll-linked
 * class can't flutter at the threshold — flutter on a sticky header reads as vibration. */
export function useScrolled(offset = 24) {
  const [scrolled, setScrolled] = useState(() => window.scrollY > offset)
  useEffect(() => {
    let ticking = false
    const releaseAt = Math.max(0, offset - 24)
    const check = () => {
      ticking = false
      const y = window.scrollY
      setScrolled((prev) => {
        if (!prev && y > offset) return true
        if (prev && y < releaseAt) return false
        return prev
      })
    }
    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(check)
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [offset])
  return scrolled
}

/** Locks body scroll while `locked` is true */
export function useLockBody(locked) {
  useEffect(() => {
    if (!locked) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [locked])
}

const SITE = 'Alegre × Good Habits'
const DEFAULT_DESC = 'A specialty coffee shop and a curated thrift store in one space. Good coffee, good finds, good habits.'

function setMeta(selector, attr, value) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    const [, key, val] = selector.match(/\[(\w+)="([^"]+)"\]/) || []
    if (key) el.setAttribute(key, val)
    document.head.appendChild(el)
  }
  el.setAttribute(attr, value)
}

/** Per-page document title, description and Open Graph tags */
export function useMeta({ title, description } = {}) {
  useEffect(() => {
    document.title = title ? `${title} — ${SITE}` : `${SITE} — Coffee. Clothes. Good Habits.`
    const desc = description || DEFAULT_DESC
    setMeta('meta[name="description"]', 'content', desc)
    setMeta('meta[property="og:title"]', 'content', title || SITE)
    setMeta('meta[property="og:description"]', 'content', desc)
  }, [title, description])
}
