import { useState, useEffect } from 'react'
import api from '../../api/axios'
import Spinner from '../../components/common/Spinner'

export default function TotalStock() {
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTotal = async () => {
      try {
        const res = await api.get('/stock/total-stock/')
        setStocks(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchTotal()
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Total Stock</h1>
        <p className="text-gray-500 mt-1">Overview of all product stock levels</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="py-20"><Spinner /></div>
        ) : stocks.length === 0 ? (
          <div className="py-16 text-center text-gray-400">No stock records yet. Add some stock in/out entries first.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-6 py-3 font-medium text-gray-500">#</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Product Name</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">HSN Code</th>
                  <th className="text-right px-6 py-3 font-medium text-gray-500">Total In</th>
                  <th className="text-right px-6 py-3 font-medium text-gray-500">Total Out</th>
                  <th className="text-right px-6 py-3 font-medium text-gray-500">Current Stock</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((s, i) => (
                  <tr key={s.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-400">{i + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{s.product_name}</td>
                    <td className="px-6 py-4 text-gray-600">{s.hsn_code}</td>
                    <td className="px-6 py-4 text-right text-emerald-600 font-medium">{s.total_in}</td>
                    <td className="px-6 py-4 text-right text-orange-600 font-medium">{s.total_out}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                        s.current_stock > 0
                          ? 'bg-emerald-100 text-emerald-700'
                          : s.current_stock === 0
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {s.current_stock}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
