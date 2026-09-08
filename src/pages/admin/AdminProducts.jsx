import { useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { coffeeProducts, coffeeCategories } from '../../data/coffee'
import { thriftProducts, thriftCategories } from '../../data/thrift'
import { Modal, ConfirmDialog } from '../../components/admin/ui'
import { useToast } from '../../context/ToastContext'
import { peso, cx } from '../../lib/format'

let uid = 0
const nextId = () => `local-${++uid}`

const EMPTY = {
  id: '', name: '', type: 'coffee', category: 'espresso', price: 0, stock: 10,
  brand: '', size: 'M', condition: 8, short: '', available: true,
}

export default function AdminProducts({ presetType }) {
  const { toast } = useToast()
  const [items, setItems] = useState(() =>
    [...coffeeProducts, ...thriftProducts].map((p) => ({ ...p, stock: p.type === 'coffee' ? 24 : p.status === 'sold' ? 0 : 1 }))
  )
  const [tab, setTab] = useState(presetType || 'all')
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const list = useMemo(() => items.filter((p) => tab === 'all' || p.type === tab), [items, tab])

  const save = (e) => {
    e.preventDefault()
    const form = editing
    if (form.id) {
      setItems((prev) => prev.map((p) => (p.id === form.id ? { ...p, ...form } : p)))
      toast('Product updated.')
    } else {
      setItems((prev) => [{ ...form, id: nextId(), slug: form.name.toLowerCase().replace(/\s+/g, '-') }, ...prev])
      toast('Product added.')
    }
    setEditing(null)
  }

  const remove = () => {
    setItems((prev) => prev.filter((p) => p.id !== deleting.id))
    toast(`“${deleting.name}” deleted.`)
    setDeleting(null)
  }

  return (
    <div className="apage">
      <header className="apage__head">
        <div><p className="eyebrow">Catalog</p><h1>{presetType === 'coffee' ? 'Coffee products' : presetType === 'thrift' ? 'Thrift products' : 'Products'}</h1></div>
        <button type="button" className="btn btn--solid btn--sm" onClick={() => setEditing({ ...EMPTY, type: tab === 'thrift' ? 'thrift' : 'coffee' })}>
          <Plus size={14} strokeWidth={2.4} /> Add product
        </button>
      </header>

      {!presetType && (
        <div className="atabs">
          {['all', 'coffee', 'thrift'].map((t) => (
            <button key={t} type="button" className={cx('atabs__tab', tab === t && 'is-active')} onClick={() => setTab(t)}>
              {t === 'all' ? 'All' : t === 'coffee' ? 'Coffee' : 'Thrift'}
            </button>
          ))}
        </div>
      )}

      <section className="apanel">
        <table className="table">
          <thead><tr><th>Product</th><th>Type</th><th>Category</th><th>Price</th><th>Stock</th><th>Available</th><th /></tr></thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id}>
                <td className="apage__strong">
                  {p.name}
                  {p.brand ? <span className="apage__muted"> · {p.brand}{p.size ? ` · ${p.size}` : ''}</span> : null}
                </td>
                <td>{p.type}</td>
                <td className="apage__muted">{p.category}</td>
                <td>{peso(p.price)}</td>
                <td className={cx(p.stock === 0 && 'apage__danger')}>{p.stock}</td>
                <td>
                  <button
                    type="button"
                    className={cx('toggle', !p.available && 'is-off')}
                    onClick={() => setItems((prev) => prev.map((x) => (x.id === p.id ? { ...x, available: !x.available } : x)))}
                    aria-label="Toggle availability"
                  >
                    <span />
                  </button>
                </td>
                <td className="apage__actions">
                  <button type="button" aria-label={`Edit ${p.name}`} onClick={() => setEditing({ ...p })}><Pencil size={14} strokeWidth={1.8} /></button>
                  <button type="button" aria-label={`Delete ${p.name}`} onClick={() => setDeleting(p)}><Trash2 size={14} strokeWidth={1.8} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit product' : 'Add product'} wide>
        {editing && (
          <form className="aform" onSubmit={save}>
            <div className="aform__grid">
              <label className="field"><span>Name</span>
                <input className="input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required />
              </label>
              <label className="field"><span>Type</span>
                <select className="input" value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value, category: e.target.value === 'thrift' ? 'tops' : 'espresso' })}>
                  <option value="coffee">Coffee</option>
                  <option value="thrift">Thrift</option>
                </select>
              </label>
              <label className="field"><span>Category</span>
                <select className="input" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                  {(editing.type === 'thrift' ? thriftCategories : coffeeCategories).map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </select>
              </label>
              <label className="field"><span>Price (₱)</span>
                <input className="input" type="number" min="0" value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} required />
              </label>
              <label className="field"><span>Stock</span>
                <input className="input" type="number" min="0" value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} />
              </label>
              {editing.type === 'thrift' ? (
                <>
                  <label className="field"><span>Brand</span>
                    <input className="input" value={editing.brand || ''} onChange={(e) => setEditing({ ...editing, brand: e.target.value })} />
                  </label>
                  <label className="field"><span>Size</span>
                    <input className="input" value={editing.size || ''} onChange={(e) => setEditing({ ...editing, size: e.target.value })} />
                  </label>
                  <label className="field"><span>Condition (1–10)</span>
                    <input className="input" type="number" min="1" max="10" value={editing.condition || 8} onChange={(e) => setEditing({ ...editing, condition: Number(e.target.value) })} />
                  </label>
                </>
              ) : (
                <label className="field field--wide"><span>Short description</span>
                  <input className="input" value={editing.short || ''} onChange={(e) => setEditing({ ...editing, short: e.target.value })} />
                </label>
              )}
              <label className="field field--wide"><span>Image</span>
                <input className="input" type="file" accept="image/*" onChange={() => toast('Image queued — uploads go to the Supabase Storage bucket “product-images” when connected.')} />
              </label>
            </div>
            <label className="acheck">
              <input type="checkbox" checked={editing.available} onChange={(e) => setEditing({ ...editing, available: e.target.checked })} />
              Available for sale
            </label>
            <div className="aform__foot">
              <button type="button" className="btn btn--line btn--sm" onClick={() => setEditing(null)}>Cancel</button>
              <button type="submit" className="btn btn--solid btn--sm">{editing.id ? 'Save changes' : 'Add product'}</button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete product"
        body={`Remove “${deleting?.name}” from the catalog? This cannot be undone.`}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
