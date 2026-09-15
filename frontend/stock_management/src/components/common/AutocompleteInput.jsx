import { useState, useEffect, useRef } from 'react'
import api from '../../api/axios'

export default function AutocompleteInput({ label, id, name, value, onChange, onSelect, error, placeholder }) {
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!value || value.length < 1) return

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await api.get(`/stock/potential-stock/?search=${encodeURIComponent(value)}`)
        setSuggestions(res.data)
        setOpen(res.data.length > 0)
      } catch {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [value])

  const handleSelect = (product) => {
    onSelect(product)
    setOpen(false)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="off"
        className={`w-full rounded-lg border px-4 py-2.5 text-gray-900 shadow-sm transition
          placeholder:text-gray-400 focus:outline-none focus:ring-2
          ${error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
            : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-200'
          }`}
      />
      {open && value && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {suggestions.map((product) => (
            <li
              key={product.id}
              onClick={() => handleSelect(product)}
              className="cursor-pointer px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 transition"
            >
              <span className="font-medium">{product.product_name}</span>
              <span className="ml-2 text-gray-400">HSN: {product.hsn_code}</span>
            </li>
          ))}
        </ul>
      )}
      {loading && value && (
        <div className="absolute right-3 top-8">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
        </div>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
