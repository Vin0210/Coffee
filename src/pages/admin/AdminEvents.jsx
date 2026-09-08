import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Modal } from '../../components/admin/ui'
import { useToast } from '../../context/ToastContext'
import { fmtDate, cx } from '../../lib/format'

const INITIAL = [
  { id: 1, title: 'THRIFT DROP 04', date: '2026-09-11', time: '7:00 PM', slots: '40 pieces', status: 'upcoming' },
  { id: 2, title: 'LIVE DJ NIGHT', date: '2026-09-19', time: '8:00 PM', slots: '80 slots', status: 'upcoming' },
  { id: 3, title: 'COFFEE WORKSHOP — POUR OVER', date: '2026-09-26', time: '2:00 PM', slots: '12 slots', status: 'upcoming' },
  { id: 4, title: 'ACOUSTIC SESSION', date: '2026-08-29', time: '7:30 PM', slots: 'Sold out', status: 'past' },
]

export default function AdminEvents() {
  const { toast } = useToast()
  const [list, setList] = useState(INITIAL)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ title: '', date: '', time: '7:00 PM', slots: '' })

  const add = (e) => {
    e.preventDefault()
    setList((prev) => [{ id: Date.now(), ...form, status: 'upcoming' }, ...prev])
    toast('Event published.')
    setAdding(false)
    setForm({ title: '', date: '', time: '7:00 PM', slots: '' })
  }

  return (
    <div className="apage">
      <header className="apage__head">
        <div><p className="eyebrow">Community</p><h1>Events</h1></div>
        <button type="button" className="btn btn--solid btn--sm" onClick={() => setAdding(true)}>
          <Plus size={14} strokeWidth={2.4} /> New event
        </button>
      </header>

      <section className="apanel">
        <table className="table">
          <thead><tr><th>Event</th><th>Date</th><th>Time</th><th>Slots</th><th>Status</th></tr></thead>
          <tbody>
            {list.map((e) => (
              <tr key={e.id}>
                <td className="apage__strong">{e.title}</td>
                <td>{fmtDate(e.date)}</td>
                <td>{e.time}</td>
                <td>{e.slots}</td>
                <td>
                  <button
                    type="button"
                    className={cx('pill', e.status === 'upcoming' ? 'pill--confirmed' : 'pill--cancelled')}
                    onClick={() => setList((prev) => prev.map((x) => (x.id === e.id ? { ...x, status: x.status === 'upcoming' ? 'past' : 'upcoming' } : x)))}
                  >
                    {e.status}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <Modal open={adding} onClose={() => setAdding(false)} title="New event">
        <form className="aform" onSubmit={add}>
          <label className="field"><span>Title</span>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </label>
          <div className="aform__grid aform__grid--2">
            <label className="field"><span>Date</span>
              <input className="input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </label>
            <label className="field"><span>Time</span>
              <input className="input" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            </label>
            <label className="field"><span>Slots / capacity</span>
              <input className="input" value={form.slots} onChange={(e) => setForm({ ...form, slots: e.target.value })} placeholder="40 pieces · Free entry…" />
            </label>
          </div>
          <div className="aform__foot">
            <button type="button" className="btn btn--line btn--sm" onClick={() => setAdding(false)}>Cancel</button>
            <button type="submit" className="btn btn--solid btn--sm">Publish event</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
