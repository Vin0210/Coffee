import { createContext, useContext, useEffect, useState } from 'react'
import { useToast } from './ToastContext'

const FavoritesContext = createContext(null)
export const useFavorites = () => useContext(FavoritesContext)

const LS_KEY = 'gh_favorites'

/** Saved thrift pieces (local now; a per-user favorites table is ready in the schema) */
export function FavoritesProvider({ children }) {
  const { toast } = useToast()
  const [ids, setIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] }
  })

  useEffect(() => { localStorage.setItem(LS_KEY, JSON.stringify(ids)) }, [ids])

  const toggle = (product) => {
    setIds((prev) => {
      const has = prev.includes(product.id)
      toast(has ? 'Removed from favorites' : 'Saved to favorites')
      return has ? prev.filter((i) => i !== product.id) : [...prev, product.id]
    })
  }
  const has = (id) => ids.includes(id)

  return (
    <FavoritesContext.Provider value={{ ids, toggle, has }}>
      {children}
    </FavoritesContext.Provider>
  )
}
