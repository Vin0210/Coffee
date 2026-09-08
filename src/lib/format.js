export const peso = (n) => '₱' + Number(n || 0).toLocaleString('en-PH')

/** Format a date-only string (YYYY-MM-DD) safely in local time */
const asDate = (iso) => new Date(iso + (String(iso).length === 10 ? 'T12:00:00' : ''))

export const fmtDate = (iso) =>
  asDate(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })

export const fmtDay = (iso) => asDate(iso).toLocaleDateString('en-PH', { weekday: 'short' })

export const fmtDayNum = (iso) => asDate(iso).getDate()

export const fmtMonth = (iso) =>
  asDate(iso).toLocaleDateString('en-PH', { month: 'short' }).toUpperCase()

export const fmtDateTime = (ts) =>
  new Date(ts).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

export const cx = (...parts) => parts.filter(Boolean).join(' ')

export const orderRef = () => 'GH-' + Math.random().toString(36).slice(2, 7).toUpperCase()
