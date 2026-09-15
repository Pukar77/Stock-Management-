import { useState, useEffect } from 'react'
import api from '../../api/axios'
import PageHeader from '../../components/common/PageHeader'
import AutocompleteInput from '../../components/common/AutocompleteInput'
import FormInput from '../../components/common/FormInput'
import Alert from '../../components/common/Alert'
import Spinner from '../../components/common/Spinner'
import { formatDate } from '../../utils/format'
import { extractApiError } from '../../utils/apiError'

export default function StockIn() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [alert, setAlert] = useState({ type: 'success', message: '' })
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    product_name: '',
    hsn_code: '',
    quantity: '',
    purchase_price: '',
  })

  const fetchRecords = async () => {
    try {
      const res = await api.get('/stock/stock-in/')
      setRecords(res.data.slice().reverse())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRecords() }, [])

  const handleProductSelect = (product) => {
    setForm((prev) => ({
      ...prev,
      product_name: product.product_name,
      hsn_code: product.hsn_code,
    }))
    setErrors((prev) => ({ ...prev, product_name: '', hsn_code: '' }))
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setAlert({ type: 'success', message: '' })
    setSubmitting(true)

    try {
      const res = await api.post('/stock/stock-in/', form)
      setAlert({ type: 'success', message: res.data.message })
      setForm({ product_name: '', hsn_code: '', quantity: '', purchase_price: '' })
      fetchRecords()
    } catch (err) {
      const { fieldErrors, general } = extractApiError(err)
      setAlert({ type: 'success', message: '' })
      setErrors({ ...fieldErrors, general })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader title="Stock In" subtitle="Record incoming stock" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">New Stock Entry</h2>
          <Alert message={errors.general} />
          <Alert {...alert} message={alert.message} />
          <form onSubmit={handleSubmit} className="space-y-4">
            <AutocompleteInput
              label="Product Name"
              id="product_name"
              name="product_name"
              value={form.product_name}
              onChange={handleChange}
              onSelect={handleProductSelect}
              error={errors.product_name}
              placeholder="Start typing product name..."
            />
            <FormInput
              label="HSN Code"
              id="hsn_code"
              name="hsn_code"
              type="number"
              placeholder="Auto-filled on selection"
              value={form.hsn_code}
              onChange={handleChange}
              error={errors.hsn_code}
            />
            <FormInput
              label="Quantity"
              id="quantity"
              name="quantity"
              type="number"
              placeholder="e.g. 100"
              value={form.quantity}
              onChange={handleChange}
              error={errors.quantity}
              required
            />
            <FormInput
              label="Purchase Price"
              id="purchase_price"
              name="purchase_price"
              type="number"
              step="any"
              placeholder="e.g. 1500.00"
              value={form.purchase_price}
              onChange={handleChange}
              error={errors.purchase_price}
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {submitting ? 'Adding...' : 'Add Stock'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Stock In Records</h2>
          {loading ? (
            <div className="py-12"><Spinner /></div>
          ) : records.length === 0 ? (
            <p className="text-sm text-gray-400 py-12 text-center">No records yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Product</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">HSN</th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-500">Qty</th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-500">Price</th>
                    <th className="text-right px-4 py-2.5 font-medium text-gray-500">Total Qty</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium text-gray-900">{r.product_name_display}</td>
                      <td className="px-4 py-3 text-gray-500">{r.hsn_code_display}</td>
                      <td className="px-4 py-3 text-right text-emerald-600 font-medium">+{r.quantity}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{r.purchase_price}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">{r.total_quantity}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(r.purchased_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
