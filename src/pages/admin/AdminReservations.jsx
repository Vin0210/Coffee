import { useState } from 'react'
import { Check, X, Plus } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import { fmtDate, cx } from '../../lib/format'

const INITIAL = [
  { id: 1, name: 'Mara V.', phone: '+63 917 555 0143', date: '2026-09-07', time: '1:00 PM', guests: 2, request: 'Window seat if possible', status: 'pending' },
  { id: 2, name: 'Jico R.', phone: '+63 917 555 0102', date: '2026-09-07', time: '4:00 PM', guests: 4, request: '', status: 'confirmed' },
  { id: 3, name: 'Ana L.', phone: '+63 917 555 0187', date: '2026-09-08', time: '10:00 AM', guests: 2, request: 'Laptop morning', status: 'confirmed' },
  { id: 4, name: 'Toff D.', phone: '+63 917 555 0166', date: '2026-09-09', time: '7:00 PM', guests: 6, request: 'Birthday — will bring cake', status: 'pending' },
]

export default function AdminReservations() {
  const { toast } = useToast()
  const [list, setList] = useState(INITIAL)

  const setStatus = (id, status) => {
    setList((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
    toast(status === 'cancelled' ? 'Reservation cancelled.' : `Reservation ${status}.`)
  }

  return (
    <div className="apage">
      <header className="apage__head">
        <div><p className="eyebrow">Front of house</p><h1>Reservations</h1></div>
      </header>
      <section className="apanel">
        <table className="table">
          <thead><tr><th>Guest</th><th>Date</th><th>Time</th><th>Guests</th><th>Request</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id}>
                <td className="apage__strong">{r.name}<span className="apage__muted"> · {r.phone}</span></td>
                <td>{fmtDate(r.date)}</td>
                <td>{r.time}</td>
                <td>{r.guests}</td>
                <td className="apage__muted">{r.request || '—'}</td>
                <td><span className={cx('pill', r.status === 'confirmed' ? 'pill--confirmed' : r.status === 'cancelled' ? 'pill--cancelled' : 'pill--preparing')}>{r.status}</span></td>
                <td className="apage__actions">
                  <button type="button" aria-label="Confirm" onClick={() => setStatus(r.id, 'confirmed')} disabled={r.status === 'confirmed'}><Check size={14} strokeWidth={2.2} /></button>
                  <button type="button" aria-label="Cancel" onClick={() => setStatus(r.id, 'cancelled')} disabled={r.status === 'cancelled'}><X size={14} strokeWidth={2.2} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <button type="button" className="btn btn--line btn--sm" onClick={() => toast('Walk-in noted at the host stand.')}>
        <Plus size={14} strokeWidth={2.2} /> Add walk-in
      </button>
    </div>
  )
}
