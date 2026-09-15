import { useState, useEffect } from 'react'
import api from '../../api/axios'
import PageHeader from '../../components/common/PageHeader'
import Modal from '../../components/common/Modal'
import FormInput from '../../components/common/FormInput'
import Alert from '../../components/common/Alert'
import Spinner from '../../components/common/Spinner'

export default function PotentialStock() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ product_name: '', hsn_code: '' })
  const [errors, setErrors] = useState({})
  const [alert, setAlert] = useState({ type: 'success', message: '' })

  const fetchProducts = async () => {
    try {
      const res = await api.get('/stock/potential-stock/')
      setProducts(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ product_name: '', hsn_code: '' })
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (product) => {
    setEditing(product)
    setForm({ product_name: product.product_name, hsn_code: product.hsn_code })
    setErrors({})
    setModalOpen(true)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    try {
      if (editing) {
        await api.put(`/stock/potential-stock/${editing.id}/`, form)
        setAlert({ type: 'success', message: 'Product updated successfully' })
      } else {
        await api.post('/stock/potential-stock/', form)
        setAlert({ type: 'success', message: 'Product added successfully' })
      }
      setModalOpen(false)
      fetchProducts()
    } catch (err) {
      if (err.response?.data?.errors) {
        const fieldErrors = {}
        for (const [key, val] of Object.entries(err.response.data.errors)) {
          fieldErrors[key] = Array.isArray(val) ? val[0] : val
        }
        setErrors(fieldErrors)
      } else if (err.response?.data?.message) {
        setErrors({ general: err.response.data.message })
      }
    }
  }

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.product_name}"? This cannot be undone.`)) return
    try {
      await api.delete(`/stock/potential-stock/${product.id}/`)
      setAlert({ type: 'success', message: 'Product deleted' })
      fetchProducts()
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to delete' })
    }
  }

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="Manage your product catalog"
        actions={
          <button onClick={openCreate} className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">
            + Add Product
          </button>
        }
      />

      <Alert {...alert} message={alert.message} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="py-20"><Spinner /></div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center text-gray-400">No products yet. Add one to get started.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-6 py-3 font-medium text-gray-500">#</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Product Name</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">HSN Code</th>
                  <th className="text-right px-6 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-400">{i + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{p.product_name}</td>
                    <td className="px-6 py-4 text-gray-600">{p.hsn_code}</td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button onClick={() => openEdit(p)} className="text-emerald-600 hover:text-emerald-700 font-medium">Edit</button>
                      <button onClick={() => handleDelete(p)} className="text-red-500 hover:text-red-600 font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} title={editing ? 'Edit Product' : 'Add Product'} onClose={() => setModalOpen(false)}>
        <Alert message={errors.general} />
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput label="Product Name" id="product_name" name="product_name" placeholder="e.g. Widget A" value={form.product_name} onChange={handleChange} error={errors.product_name} required />
          <FormInput label="HSN Code" id="hsn_code" name="hsn_code" type="number" placeholder="e.g. 8471" value={form.hsn_code} onChange={handleChange} error={errors.hsn_code} required />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">
              {editing ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
